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

Run only from a trusted computer with Docker, the Supabase CLI, the production database password, and an encrypted off-site destination. Never commit or upload dumps to GitHub.

```powershell
$backupDir = Join-Path $env:TEMP ("teffein-backup-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backupDir | Out-Null
supabase db dump --db-url $env:TEFFEIN_DB_URL -f "$backupDir/roles.sql" --role-only
supabase db dump --db-url $env:TEFFEIN_DB_URL -f "$backupDir/schema.sql"
supabase db dump --db-url $env:TEFFEIN_DB_URL -f "$backupDir/data.sql" --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

Immediately encrypt the three files, copy the encrypted archive off-site, verify its checksum, and securely delete the temporary plaintext directory.

## Restore drill

1. Create a disposable Supabase project; never test a restore against production.
2. Match required extensions and Postgres major version.
3. Restore roles, schema, then data in a single transaction with `ON_ERROR_STOP=1` and triggers disabled during data load.
4. Verify migration history, table counts, RLS, function privileges, a customer order smoke test, and a Kitchen status transition.
5. Delete the disposable project and record the date and result.

Run a data backup weekly and a restore drill monthly until managed backups are enabled. A Pro upgrade would add seven days of scheduled backups; leaked-password protection and PITR remain separate plan/add-on decisions.

Last schema recovery verification: 2026-09-08, all 14 cloud migration versions matched the repository and GitHub run 34186227606 rebuilt the database and passed every integration test.

