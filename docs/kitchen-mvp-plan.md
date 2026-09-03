# Kitchen MVP — implementation and operations

## Verified source and deployment

Based on merged main `331c22b786a304b28cbd2f985ad37c4bf2136cbc`. Foundation CI [33764191064](https://github.com/jayendrasinh07/Teffein/actions/runs/33764191064) passed; job `100677736090` ran CLI help and `supabase migration new kitchen_mvp`, creating version `20260903135955`.

The implemented migration was locally verified and deployed to Tiffein `boeceqmjrnxpkmhppblq` as `20260903141846_kitchen_mvp`. The filename now matches actual cloud history. Phase 1/2 source remains immutable. Source MD5 (LF with final newline): `a23c8791750f5f7124e912fc6bbc507c`.

## Access and data contract

Use the existing database role `kitchen`; `admin` may support operations. No manager/staff subroles or UI role switch grants access.

`get_kitchen_orders(date,text)` returns active confirmed/preparing/ready orders for exactly one date and lunch/dinner service, sorted by frozen delivery-window label and creation time. It exposes order ID/reference, date/service, window, status/timestamps, meal snapshot names/quantities, preferences, add-on snapshot names/total quantities and notes. It excludes customer account/address/phone/payment/price data. Notes can contain user-entered personal information; they are staff-only.

`update_kitchen_order_status(uuid,text,text)` checks the current database role and locks the order. It permits confirmed → preparing and preparing → ready only. A repeated already-completed requested transition returns the current projection without a duplicate audit event. An obsolete expected stage fails with `40001`; invalid transitions fail with `22023`. A missing order fails with `P0002`; access failure uses `42501`. Order payment, prices, quantities and snapshots remain unchanged.

Both RPCs use SECURITY DEFINER with an empty search path and fully qualified relations; PUBLIC/anon execution is revoked. Authenticated callers must pass the database role check. Kitchen receives no unrestricted order-table read/write policy.

`private.kitchen_status_events` records order, actor, previous/next status and time atomically with each successful transition. It has RLS with no client policies/grants. Database operators can inspect it; there is no audit-history frontend. Deleting an Auth actor retains the event with a null actor ID; deleting the owning order cascades its events.

## Interface behavior

Kitchen links appear for authorized users on desktop/mobile. The workspace provides date/IST and lunch/dinner filters, three columns, counts in portions, complete order references, delivery windows, meal quantities, dietary/spice/oil preferences, add-ons and separate notes. Add-on quantities are totals for the line, not multiplied again by meal quantity.

Polling runs every 15 seconds while visible, plus focus/manual refresh. Controls wait for confirmed server updates. Duplicate clicks are blocked. Stale polls cannot overwrite a completed mutation; disposed account/date/service controllers cannot publish late data. Failed refreshes retain a labelled snapshot and pause controls. Revoked access clears the queue. Status conflicts reload it and display a notice.

The date does not silently roll over at midnight: the selected service stays visible; Today explicitly switches to the current IST date.

Pending-payment orders are operationally preparable in the current manual-payment mode. Kitchen never marks them paid. Ready maps to the existing customer PACKED state and tracking refresh.

## Verification completed

- Local PostgreSQL 18 and cloud PostgreSQL 17 transactional Kitchen tests pass: anonymous/customer/delivery/corporate denial, forged Auth metadata denial, kitchen/admin access, revoked access, minimal projection, frozen snapshots, filters, correct stages/retries/stale errors, audit records and customer RLS.
- Local concurrent sessions pass: two staff retrying the same stage create one event; obsolete stages fail; customer cancellation and kitchen preparation serialize correctly for either lock winner.
- Existing customer SQL, checkout concurrency/default-address checks and Node client regressions pass after the Kitchen migration.
- Kitchen client tests pass for contract validation, rejected/uncertain requests, duplicate clicks, stale polls, identity/filter disposal, offline handling and revocation.

The new frontend typecheck/production build and browser smoke still require execution in CI/configured preview. The prior passing foundation run is evidence for the base, not this new implementation.

## Activation and existing advisors

No real users, orders or published daily menus were added. An intended staff account with a kitchen role and an intentionally published business menu are prerequisites for a real customer-to-kitchen smoke test. Use authorized account administration; do not create arbitrary staff privileges.

Security advisors report no ERROR-level findings. The two new guarded authenticated RPCs produce the expected SECURITY DEFINER callability warnings. The private audit table produces an INFO notice for having no RLS policy; its default-deny behavior is intentional. See [function exposure guidance](https://supabase.com/docs/guides/database/functions#function-privileges) and [no-policy advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Foundational RLS performance advisories remain separate follow-up work.

No Admin, Delivery or Corporate panel, payment gateway, staff management screen or automatic menu publication is part of this MVP.
