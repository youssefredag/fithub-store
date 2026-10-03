const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const photo1 = photo('photo-1583454110551-21f2fa2afe61');
const photo2 = photo('photo-1534367610401-9f5ed68180aa');
const photo3 = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Weight_plates_in_gym_20180112.jpg';
const photo4 = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Weight_benche_15761311874.jpg/960px-Weight_benche_15761311874.jpg';
const photo5 = photo('photo-1580261450046-d0a30080dc9b');
const photo6 = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Pull-up_bar.JPG/960px-Pull-up_bar.JPG';
const photo7 = 'https://upload.wikimedia.org/wikipedia/commons/0/02/Trenirovachni_lastici_set.JPG';
const photo8 = 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Yoga_mat.jpg';

export const gymProducts = [
  {
    id: 1,
    title: "Adjustable Dumbbell Set",
    price: 299.99,
    brand: 'Northline',
    category: "Dumbbells",
    rating: 4.5,
    images: [photo1],
    description: "20-50 lbs adjustable pair. Great for home workouts"
  },
  {
    id: 2,
    title: "Standard Barbell 45lb",
    price: 189.99,
    brand: 'Foundry Strength',
    category: "Barbells",
    rating: 4.8,
    images: [photo2],
    description: "Solid steel barbell with good grip"
  },
  {
    id: 3,
    title: "Weight Plates Set 100lb",
    price: 149.99,
    brand: 'Northline',
    category: "Weight Plates",
    rating: 4.6,
    images: [photo3],
    description: "Mixed plate set for barbell training"
  },
  {
    id: 4,
    title: "Adjustable Weight Bench",
    price: 249.99,
    brand: 'Foundry Strength',
    category: "Benches",
    rating: 4.7,
    images: [photo4],
    description: "Incline/decline bench for home gym"
  },
  {
    id: 5,
    title: "Power Rack & Cage",
    price: 499.99,
    brand: 'Northline',
    category: "Racks",
    rating: 4.9,
    images: [photo5],
    description: "Heavy duty squat rack with safety bars"
  },
  {
    id: 6,
    title: "Pull-Up Bar Door Mount",
    price: 79.99,
    brand: 'Groundwork',
    category: "Pull-up Bars",
    rating: 4.4,
    images: [photo6],
    description: "Fits standard door frames. Max 300 lbs"
  },
  {
    id: 7,
    title: "Resistance Band Set 5pc",
    price: 59.99,
    brand: 'Groundwork',
    category: "Bands",
    rating: 4.3,
    images: [photo7],
    description: "Light to heavy resistance bands"
  },
  {
    id: 8,
    title: "Yoga Exercise Mat",
    price: 49.99,
    brand: 'Groundwork',
    category: "Mats",
    rating: 4.5,
    images: [photo8],
    description: "6mm non-slip mat for yoga and floor exercises"
  }
];

export const gymCategories = [
  "All",
  "Dumbbells",
  "Barbells",
  "Weight Plates",
  "Benches",
  "Racks",
  "Pull-up Bars",
  "Bands",
  "Mats"
];

export const gymBrands = [
  {
    name: 'Northline',
    description: 'Dumbbells, plates, and racks for building a practical home strength setup.',
  },
  {
    name: 'Foundry Strength',
    description: 'Straightforward bars and benches for everyday lifting.',
  },
  {
    name: 'Groundwork',
    description: 'Space-saving training gear and floor essentials.',
  },
];
