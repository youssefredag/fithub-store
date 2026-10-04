# FitHub Store

A React storefront integrated with the Route E-commerce API.

## Live Demo


## Store Features
- Product, brand, and category listings with detail pages
- Search, price sorting, wishlist, and quantity-based cart
- Original FitHub gym products, names, photos, categories, and brands are kept unchanged
- Route API authentication, password reset, and account address support
- Cart, wishlist, addresses for guests, cash/online demo checkout, and order history

## Tech Stack
React · React Router · Vite · Context API

## Backend Configuration
The app uses the Route E-commerce API at `https://ecommerce.routemisr.com/api/v1` for sign-up, sign-in, password reset/change, and saved addresses. Its public product catalog contains different products from the original FitHub gym inventory, so it is intentionally not used to replace FitHub product names, photos, categories, or brands. FitHub cart, wishlist, and order history remain browser-persisted, and online checkout is a no-charge demo; the Route cart/order/payment endpoints cannot process FitHub items until those products exist in the Route backend. To use a different API root, set `VITE_API_BASE_URL` in a local `.env` file, for example:

```env
VITE_API_BASE_URL=https://ecommerce.routemisr.com/api/v1
```

Create an account or sign in to use backend account features and synced addresses. Password reset emails and API availability depend on the backend account configuration.

## Image Sources
Product photos are selected to match the listed equipment. Wikimedia Commons images are used for the weight plates ([source](https://commons.wikimedia.org/wiki/File:Weight_plates_in_gym_20180112.jpg), Santeri Viinamäki, CC BY-SA 4.0), adjustable bench ([source](https://commons.wikimedia.org/wiki/File:Weight_benche_15761311874.jpg)), doorway pull-up bar ([source](https://commons.wikimedia.org/wiki/File:Pull-up_bar.JPG)), resistance band set ([source](https://commons.wikimedia.org/wiki/File:Trenirovachni_lastici_set.JPG), Velislav Panchev, CC BY-SA 4.0), and yoga mat ([source](https://commons.wikimedia.org/wiki/File:Yoga_mat.jpg), Gausanchennai, CC BY-SA 4.0). Other product images use matching Unsplash gym equipment photographs.

## Run Locally
```sh
npm install
npm run dev
```