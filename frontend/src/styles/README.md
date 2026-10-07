# CSS structure

The original `src/index.css` was split without changing selector content or source order.

- `fonts.css` — font-face declarations
- `globals.css` — global reset/base rules
- `layout/header.css` — header/navigation
- `common/hero.css` — shared hero styles
- `layout/floating-actions.css` — social rail + quick phone
- `pages/home.css` — homepage sections and sliders
- `pages/blog.css` — blog cards
- `pages/rooms.css` — room listing
- `pages/menu.css` — menu listing/catalog
- `pages/about.css` — about/story sections
- `pages/careers.css` — careers page
- `pages/contact.css` — contact page/form
- `pages/offers.css` — offers pages
- `pages/room-detail.css` — room detail
- `pages/menu-detail.css` — dish detail
- `layout/footer.css` — footer
- `common/actions.css` — shared action/button font rules
- `responsive.css` — all responsive overrides; imported last

`src/index.css` is now only the import manifest.
