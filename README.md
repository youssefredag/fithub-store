# FitHub Store

A React storefront integrated with the Route E-commerce API.

## Live Demo


## Store Features
- Products, brands, and categories loaded from Route, with search, sorting, and detail pages
- Route-backed cart (including coupon/clear), wishlist, product reviews, addresses, and order history
- Route account registration, sign-in, password reset, and password change
- Profile editing, clothing subcategories, and cash/online checkout through Route
- Cash-on-delivery and online checkout through Route

## Tech Stack
React · React Router · Vite · Context API

## Backend Configuration
The app uses the Route E-commerce API at `https://ecommerce.routemisr.com/api/v1` for its catalog and account operations, and Cart/Orders v2 endpoints for cart changes and cash orders. Products are filtered to the men's and women's fashion categories. Guest cart items are saved in the current browser and merged into the signed-in account cart at login; checkout, wishlist, reviews, addresses, profile details, and orders require a signed-in account. Online payment uses a checkout session returned by Route. Address editing replaces the saved address because the documented address API provides create/read/delete operations but no update endpoint. Administrative `GET /users` and `GET /orders/` endpoints are intentionally not exposed in the customer-facing app. To use a different API root, set `VITE_API_BASE_URL` in a local `.env` file, for example:

```env
VITE_API_BASE_URL=https://ecommerce.routemisr.com/api/v1
```

Create an account or sign in to use account-backed cart, wishlist, review, address, and order features. Password-reset email delivery and payment availability depend on the Route backend configuration.

## Run Locally
```sh
npm install
npm run dev
```