# CSS structure

`src/index.css` is the import manifest; it lists every stylesheet the app loads, in order.

- `prototype-original.css` — all public/customer-facing styles from the original prototype
- `prototype-compat.css` — small additions for API-backed room data
- `pages/*.css` — pages without an equivalent in the prototype (booking, admin screens, promotions, recruitment, reviews, not-found) plus `reference-ui-polish.css`, the shared alignment and polish layer
