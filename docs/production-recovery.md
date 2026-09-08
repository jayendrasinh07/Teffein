# TEFFEIN production recovery

## Current protection

- Supabase project: `boeceqmjrnxpkmhppblq` (`Tiffein`, Free plan).
- Managed daily backups and point-in-time recovery are unavailable on the current plan.
- Database schema is recoverable from `supabase/migrations/`.
- `.github/workflows/verify.yml` rebuilds Postgres 17 from every migration and runs ordering, Kitchen, and concurrency checks.
- Customer and Kitchen health routes are `https://teffein.pages.dev/` and `https://teffein.pages.dev/kitchen`.
- Kitchen/Admin recovery must preserve TOTP factors; privileged RPCs require an `aal2` session.
- `backups/` and common dump extensions are ignored so customer data cannot be committed accidentally.
- The daily `TEFFEIN Production Health` monitor checks project health, advisors, migrations, both live routes, and aggregate order failures without exposing customer data.

## Data backup procedure

Run only from a trusted computer with PostgreSQL client tools, an authenticated Supabase CLI, and an encrypted off-site destination. Never commit or upload plaintext dumps to GitHub.

```powershell
.\scripts\backup-production.ps1
```

The script obtains a short-lived database login from the authenticated Supabase CLI, dumps `public`, `private`, `auth`, and `storage`, writes a PII-free manifest, encrypts the archive with AES-256-CBC plus HMAC-SHA256, stores it in OneDrive, verifies SHA-256, and removes plaintext temporary files. Keep the passphrase outside GitHub and Notion.

For unattended recovery on this trusted Windows profile, use `-UseWindowsProtectedKey`. The random key is wrapped with Windows DPAPI and saved beside the encrypted archives; it is usable only by the same Windows user profile. Maintain a separate portable recovery key before relying on it for device-loss recovery.

## Latest verified backup

- Created: 2026-09-08 12:45 IST
- Archive: `teffein-production-20260908-124550.tefbackup`
- Off-site destination: OneDrive `TEFFEIN Secure Backups`
- SHA-256: `d29dcfa0517dc8fd2c0b7625d459ccc449e32e354e96a909f7ea0c54098de221`
- Scope: `public`, `private`, `auth`, and `storage` database records. Storage objects themselves require a separate object-file backup if buckets are used.
- Encryption: AES-256-CBC, PBKDF2-SHA256 (600,000 iterations), and HMAC-SHA256; key wrapped to the current Windows user with DPAPI.

## Restore drill

1. Run `.\scripts\restore-backup-drill.ps1 -BackupPath <encrypted-file>`; it creates an isolated local PostgreSQL cluster and never connects writes to production.
2. The drill authenticates the archive, restores production `public` schema/data, and checks row counts, RLS coverage, and the ordering RPC.
3. For a full disaster simulation, restore the same archive to a disposable Supabase project, then verify Auth/MFA, customer ordering, and a Kitchen status transition before deleting it.

Latest local drill: **passed on 2026-09-08** with 14 public tables, 9 private tables, 3 orders, and 4 menu days matching the manifest. `place_order_secure` and RLS-protected tables were present. Auth and Storage records are included in the encrypted archive; restoring them remains part of the future disposable-Supabase drill.

Run a data backup weekly and a restore drill monthly until managed backups are enabled. A Pro upgrade would add seven days of scheduled backups; leaked-password protection and PITR remain separate plan/add-on decisions.

Last schema recovery verification: 2026-09-08, all 15 cloud migration versions matched the repository and GitHub run 34190366558 rebuilt the database and passed every integration test.

