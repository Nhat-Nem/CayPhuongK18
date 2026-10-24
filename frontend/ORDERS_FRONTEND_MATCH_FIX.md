# Frontend order API alignment

This patch changes frontend files only. No backend source, module, route, DTO, or database file was edited.

## Changes

- `src/services/orderApi.ts`: send `menuItemId` as a string, matching the backend `AddOrderItemDto` (`@IsString()`). IDs in URL paths are normalized through `String()` before encoding, avoiding numeric conversion of BIGINT identifiers.
- Order request/response types now match the current backend `Order` and `OrderItem` entities.
- The create/edit order forms only submit the `note` field because the backend `CreateOrderDto` and `UpdateOrderDto` do not support `customerName` or `tableNumber`. Those two fields were removed from the form so the UI does not claim to save data that the API ignores.
- The order list uses the backend's `code`, `status`, and `paymentStatus` fields.
- Item subtotal is calculated in the frontend from `unitPrice * quantity`, because the backend entity does not return a `subtotal` field.
- Add/update/remove item controls are enabled only for `PENDING` orders, matching the backend service rule.

## Validation

`tsc --noEmit` completed successfully. A full Vite production build could not be completed in this environment because the archive's `node_modules` contains the Windows Rolldown native binding but not the Linux binding.
