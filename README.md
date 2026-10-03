# FitHub Store

A React storefront for gym equipment.

## Live Demo


## Store Features
- Product, brand, and category listings with detail pages
- Search, price sorting, wishlist, and quantity-based cart
- Demo account screens, address book, checkout, and order history
- Cash-on-delivery and clearly marked, no-charge online payment demo
- Local persistence for cart, wishlist, profile, addresses, and orders

## Tech Stack
React · React Router · Vite · Context API

## API And Demo Limitations
The project does not include a private backend or payment gateway. The catalog uses the included FitHub gym inventory because the public sports-accessories sample contains unrelated ball-sports products and no brand names. Northline, Foundry Strength, and Groundwork are sample brand labels in the local catalog, not verified manufacturer affiliations. Unknown product IDs can load from DummyJSON `/products/:id`, and sign-in can call its `/auth/login` test endpoint. Registration creates a local demo profile. Password reset/change screens, addresses, cart, wishlist, orders, and checkout are client-side demonstrations stored in the browser. Use test credentials only; no payment is processed.

## Image Sources
Product photos are selected to match the listed equipment. Wikimedia Commons images are used for the weight plates ([source](https://commons.wikimedia.org/wiki/File:Weight_plates_in_gym_20180112.jpg), Santeri Viinamäki, CC BY-SA 4.0), adjustable bench ([source](https://commons.wikimedia.org/wiki/File:Weight_benche_15761311874.jpg)), doorway pull-up bar ([source](https://commons.wikimedia.org/wiki/File:Pull-up_bar.JPG)), resistance band set ([source](https://commons.wikimedia.org/wiki/File:Trenirovachni_lastici_set.JPG), Velislav Panchev, CC BY-SA 4.0), and yoga mat ([source](https://commons.wikimedia.org/wiki/File:Yoga_mat.jpg), Gausanchennai, CC BY-SA 4.0). Other product images use matching Unsplash gym equipment photographs.

## Run Locally
```sh
npm install
npm run dev
```