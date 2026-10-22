# Sprint 6 — frontend and minimal compatibility fixes

## Kiệt & Đông scope

- **US.35:** `/danh-gia` submits name, phone, optional email, rating, and note through `POST /api/v1/reviews` using the existing DTO.
- **US.36:** `/admin/danh-gia` loads and shows customer reviews from `GET /api/v1/reviews`.
- **US.37–US.38:** Admin can feature/unfeature a review on the homepage. The backend currently has no featured flag or endpoint, so this selection remains browser-local in `localStorage`. Once the API task (T.10/T.12) is added by the backend owner, the store can be replaced with API calls.
- **US.39/US.41:** `/admin/don-hang` loads orders from `GET /api/v1/orders`; both `ADMIN` and `STAFF` can view the list if backend login returns the proper role.
- **US.40:** Status selector is read-only for STAFF because the existing `PATCH /api/v1/orders/:id` controller is restricted to `ADMIN`. Enabling successful status changes for staff requires the backend owner's authorization/API task (T.17); this package does not weaken backend access controls.
- **US.42:** Total amount uses the backend field `totalAmount`. Item subtotals are rendered as `unitPrice * quantity` for display.
- **US.43:** Payment method/amount/time capture UI is implemented. Since the backend does not expose payment fields or an endpoint yet, recorded payments are browser-local `localStorage` and are not shared between devices (T.26 remains a backend task).

## Fixes in this update

1. **Recruitment `employment_type`:** the frontend normalizes `fulltime` / `part-time` in the edit select and sends `employment_type`. Minimal backend service mapping moves DTO `employment_type` into the entity's `employmentType` property in both create and update, so the value isn't discarded by TypeORM.
2. **Order list HTTP 500:** current entity selects `orders.code` while the MySQL table reported by the user does not contain this column. `synchronize` is set to `false` to prevent TypeORM from attempting to drop the FK-backed `uq_order_menu_item` index. The explicit migration `database/migrations/20261022_add_orders_code.sql` adds and populates `orders.code` without touching existing foreign keys or indexes. Back up DB and run the statements one at a time; run `ADD COLUMN` only if `SHOW COLUMNS FROM orders LIKE 'code'` returns no rows.
3. **Homepage review selection:** if GET `/api/v1/reviews` succeeds and Admin has featured no reviews, the homepage no longer falls back to mock testimonials; it displays an empty state. Mock testimonials remain only while the reviews API is unavailable/loading.
4. **Portal role:** normalizes backend `ADMIN`/`STAFF` role strings to uppercase without granting roles client-side. Admin should see all admin menus; STAFF sees the order area only. If an Admin still sees only the order menu, log out and sign back in, and check that `POST /api/v1/auth` returns role `ADMIN` for the account.

## API paths used

- `POST /api/v1/reviews` — submit review.
- `GET /api/v1/reviews` — list reviews.
- `GET /api/v1/orders`, `GET /api/v1/orders/:id` — list/detail orders.
- `POST /api/v1/orders` — create order from note field.
- `POST /api/v1/orders/:id/items` — add menu item.
- `PATCH /api/v1/orders/:id/items/:itemId` — update quantity.
- `DELETE /api/v1/orders/:id/items/:itemId` — remove item.
- `PATCH /api/v1/orders/:id/note` — update note.
- `PATCH /api/v1/orders/:id` — update status, ADMIN-only in current backend.

## Database migration caution

Do **not** delete `uq_order_menu_item`, do not delete the database, and do not turn schema sync back on to bypass the error. Use the included migration after backing up the current database. `synchronize: false` means future entity/schema changes must be applied through controlled migrations.
