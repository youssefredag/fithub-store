# FitHub Store

A React storefront integrated with the Route E-commerce API.

## Live Demo


## Store Features
- Products, brands, and categories loaded from Route, with search, sorting, and detail pages
- Route-backed cart, wishlist, product reviews, addresses, and order history
- Route account registration, sign-in, password reset, and password change
- Cash-on-delivery and online checkout through Route

## Tech Stack
React · React Router · Vite · Context API

## Backend Configuration
The app uses the Route E-commerce API at `https://ecommerce.routemisr.com/api/v1` for its catalog and shopping operations. Products, images, categories, and brands come from Route; adding products to the cart or wishlist requires signing in so those changes can be saved to the account. Online payment uses the checkout session returned by Route. To use a different API root, set `VITE_API_BASE_URL` in a local `.env` file, for example:

```env
VITE_API_BASE_URL=https://ecommerce.routemisr.com/api/v1
```

Create an account or sign in to use account-backed cart, wishlist, review, address, and order features. Password-reset email delivery and payment availability depend on the Route backend configuration.

## Run Locally
```sh
npm install
npm run dev
```