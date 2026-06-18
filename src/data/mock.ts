import { Banner, Cart, CartItem, Category, Order, Product, Vendor, VendorStore } from '@/types'
import type { PromoCode } from '@/store/cart.store'

// ── Local banner images ───────────────────────────────────────────────────────
const IMG_BANNER_1 = require('../../assets/banners/banner1.jpg')
const IMG_BANNER_2 = require('../../assets/banners/banner2.jpg')
const IMG_BANNER_3 = require('../../assets/banners/banner3.jpg')

// ── Product images ────────────────────────────────────────────────────────────
const PIMG: Record<string, ReturnType<typeof require>> = {
  p1:  require('../../assets/products/1-400x400.jpg'),
  p2:  require('../../assets/products/2-400x400.jpg'),
  p3:  require('../../assets/products/3-400x400.jpg'),
  p4:  require('../../assets/products/4-400x400.jpg'),
  p5:  require('../../assets/products/6-400x400.jpg'),
  p6:  require('../../assets/products/7-400x400.jpg'),
  p7:  require('../../assets/products/8-400x400.jpg'),
  p8:  require('../../assets/products/9-400x400.jpg'),
  p9:  require('../../assets/products/10-400x400.jpg'),
  p10: require('../../assets/products/11-400x400.jpg'),
  p11: require('../../assets/products/12-400x400.jpg'),
  p12: require('../../assets/products/13-400x400.jpg'),
  p13: require('../../assets/products/18-400x400.jpg'),
  p14: require('../../assets/products/19-400x400.jpg'),
  p15: require('../../assets/products/21-400x400.jpg'),
}

// ── Category images ───────────────────────────────────────────────────────────
const CIMG: Record<string, ReturnType<typeof require>> = {
  cat1: require('../../assets/category/image-1-150x150.png'),
  cat2: require('../../assets/category/image-2-150x150.png'),
  cat3: require('../../assets/category/image-3-150x150.png'),
  cat4: require('../../assets/category/image-4-150x150.png'),
  cat5: require('../../assets/category/image-5-150x150.png'),
}

export const MOCK_VENDORS: Vendor[] = [
  { _id: 'v1', name: 'TechNest', slug: 'technest', tagline: 'Premium electronics & gadgets', rating: 4.8, totalReviews: 2341, category: 'Electronics', location: 'Nairobi, KE', followers: 12400, isVerified: true, color: '#312d8a', icon: 'phone-portrait-outline' },
  { _id: 'v2', name: 'StyleHub', slug: 'stylehub', tagline: 'Latest fashion trends', rating: 4.6, totalReviews: 1876, category: 'Fashion', location: 'Mombasa, KE', followers: 9800, isVerified: true, color: '#CE4002', icon: 'shirt-outline' },
  { _id: 'v3', name: 'HomeNest', slug: 'homenest', tagline: 'Beautiful home decor', rating: 4.7, totalReviews: 943, category: 'Home', location: 'Kisumu, KE', followers: 5600, isVerified: false, color: '#F59E0B', icon: 'home-outline' },
  { _id: 'v4', name: 'FitZone', slug: 'fitzone', tagline: 'Your fitness partner', rating: 4.9, totalReviews: 3102, category: 'Sports', location: 'Nakuru, KE', followers: 18200, isVerified: true, color: '#10B981', icon: 'barbell-outline' },
]

export const MOCK_VENDOR_STORES: VendorStore[] = [
  {
    _id: 'v1', name: 'TechNest', slug: 'technest', tagline: 'Premium electronics & gadgets',
    handle: '@technest', bio: 'Your one-stop shop for the latest electronics, gadgets, and tech accessories. We source only top-quality brands and offer same-day delivery in Nairobi.',
    coverImage: '', logoImage: '',
    rating: 4.8, totalReviews: 2341, reviewCount: 2341, productCount: 48,
    category: 'Electronics', location: 'Nairobi, KE', deliveryEstimate: '30–45 min',
    followers: 12400, isVerified: true, isFollowing: false,
    color: '#312d8a', icon: 'phone-portrait-outline',
    categories: ['Electronics'],
    joinedDate: '2022-03-15',
  },
  {
    _id: 'v2', name: 'StyleHub', slug: 'stylehub', tagline: 'Latest fashion trends',
    handle: '@stylehub', bio: 'Curated fashion for every style and occasion. From casual streetwear to elegant evening wear — we keep you looking your best every day.',
    coverImage: '', logoImage: '',
    rating: 4.6, totalReviews: 1876, reviewCount: 1876, productCount: 32,
    category: 'Fashion', location: 'Mombasa, KE', deliveryEstimate: '45–60 min',
    followers: 9800, isVerified: true, isFollowing: true,
    color: '#CE4002', icon: 'shirt-outline',
    categories: ['Fashion', 'Beauty'],
    joinedDate: '2021-11-20',
  },
  {
    _id: 'v3', name: 'HomeNest', slug: 'homenest', tagline: 'Beautiful home decor',
    handle: '@homenest', bio: 'Transform your living space with our handpicked collection of home decor, furniture, and smart home essentials. Your home, your style.',
    coverImage: '', logoImage: '',
    rating: 4.7, totalReviews: 943, reviewCount: 943, productCount: 21,
    category: 'Home', location: 'Kisumu, KE', deliveryEstimate: '1–2 days',
    followers: 5600, isVerified: false, isFollowing: false,
    color: '#F59E0B', icon: 'home-outline',
    categories: ['Home'],
    joinedDate: '2023-01-08',
  },
  {
    _id: 'v4', name: 'FitZone', slug: 'fitzone', tagline: 'Your fitness partner',
    handle: '@fitzone', bio: 'Gear up for greatness. FitZone stocks premium fitness equipment, activewear, and supplements to help you crush every workout — at every level.',
    coverImage: '', logoImage: '',
    rating: 4.9, totalReviews: 3102, reviewCount: 3102, productCount: 64,
    category: 'Sports', location: 'Nakuru, KE', deliveryEstimate: '30–50 min',
    followers: 18200, isVerified: true, isFollowing: false,
    color: '#37c0b1', icon: 'barbell-outline',
    categories: ['Sports'],
    joinedDate: '2021-06-01',
  },
]

export const MOCK_VENDOR_PRODUCTS: Record<string, Product[]> = {
  v1: [
    {
      _id: '1', name: 'Wireless Headphones Pro', description: 'Premium sound with active noise cancellation and 30h battery life.',
      price: 59.99, originalPrice: 89.99, discountPercentage: 33,
      stock: 50, category: 'Electronics', images: [], image: PIMG.p1,
      averageRating: 4.5, totalReviews: 128,
      vendorId: 'v1', vendorName: 'TechNest', isFeatured: true,
      createdAt: '2024-01-01', updatedAt: '2024-01-01',
    },
    {
      _id: '7', name: 'Mechanical Keyboard', description: 'TKL 75% mechanical keyboard with RGB backlight and Cherry MX switches.',
      price: 89.99, originalPrice: 119.99, discountPercentage: 25,
      stock: 20, category: 'Electronics', images: [], image: PIMG.p7,
      averageRating: 4.4, totalReviews: 89,
      vendorId: 'v1', vendorName: 'TechNest',
      createdAt: '2024-01-07', updatedAt: '2024-01-07',
    },
    {
      _id: '9', name: 'Smart Watch Series X', description: 'Health tracking, GPS, and 7-day battery life in a slim design.',
      price: 129.99, originalPrice: 179.99, discountPercentage: 28,
      stock: 35, category: 'Electronics', images: [], image: PIMG.p9,
      averageRating: 4.7, totalReviews: 567,
      vendorId: 'v1', vendorName: 'TechNest', isFeatured: true,
      createdAt: '2024-01-09', updatedAt: '2024-01-09',
    },
    {
      _id: 'v1p4', name: 'USB-C Hub 7-in-1', description: 'Expand your laptop with HDMI, USB 3.0, SD card and fast charging.',
      price: 34.99, originalPrice: 49.99, discountPercentage: 30,
      stock: 80, category: 'Electronics', images: [], image: PIMG.p11,
      averageRating: 4.6, totalReviews: 214,
      vendorId: 'v1', vendorName: 'TechNest', isNew: true,
      createdAt: '2024-01-11', updatedAt: '2024-01-11',
    },
    {
      _id: 'v1p5', name: 'Portable Bluetooth Speaker', description: 'Waterproof 360° sound with 20h playback and built-in microphone.',
      price: 44.99, originalPrice: 64.99, discountPercentage: 31,
      stock: 60, category: 'Electronics', images: [], image: PIMG.p12,
      averageRating: 4.8, totalReviews: 390,
      vendorId: 'v1', vendorName: 'TechNest', isFeatured: true,
      createdAt: '2024-01-12', updatedAt: '2024-01-12',
    },
    {
      _id: 'v1p6', name: 'Wireless Charging Pad', description: 'Fast 15W wireless charger compatible with Qi-enabled devices.',
      price: 19.99, originalPrice: 28.99, discountPercentage: 31,
      stock: 120, category: 'Electronics', images: [], image: PIMG.p13,
      averageRating: 4.3, totalReviews: 155,
      vendorId: 'v1', vendorName: 'TechNest',
      createdAt: '2024-01-13', updatedAt: '2024-01-13',
    },
  ],
  v2: [
    {
      _id: '2', name: 'Slim Fit Chino Pants', description: 'Comfortable everyday slim-fit chinos in premium stretch cotton.',
      price: 32.00, originalPrice: 45.00, discountPercentage: 29,
      stock: 30, category: 'Fashion', images: [], image: PIMG.p2,
      averageRating: 4.2, totalReviews: 64,
      vendorId: 'v2', vendorName: 'StyleHub', isNew: true,
      createdAt: '2024-01-02', updatedAt: '2024-01-02',
    },
    {
      _id: '5', name: 'Vitamin C Serum', description: 'Brightening 20% vitamin C serum for radiant, even-toned skin.',
      price: 15.99, originalPrice: 22.99, discountPercentage: 30,
      stock: 200, category: 'Beauty', images: [], image: PIMG.p5,
      averageRating: 4.6, totalReviews: 445,
      vendorId: 'v2', vendorName: 'StyleHub',
      createdAt: '2024-01-05', updatedAt: '2024-01-05',
    },
    {
      _id: '10', name: 'Linen Summer Dress', description: 'Effortlessly elegant linen dress perfect for warm weather.',
      price: 38.99, originalPrice: 55.00, discountPercentage: 29,
      stock: 60, category: 'Fashion', images: [], image: PIMG.p10,
      averageRating: 4.5, totalReviews: 234,
      vendorId: 'v2', vendorName: 'StyleHub', isNew: true,
      createdAt: '2024-01-10', updatedAt: '2024-01-10',
    },
    {
      _id: 'v2p4', name: 'Classic White Sneakers', description: 'Clean minimalist sneakers that go with anything in your wardrobe.',
      price: 54.99, originalPrice: 74.99, discountPercentage: 27,
      stock: 45, category: 'Fashion', images: [], image: PIMG.p14,
      averageRating: 4.7, totalReviews: 312,
      vendorId: 'v2', vendorName: 'StyleHub', isFeatured: true,
      createdAt: '2024-01-14', updatedAt: '2024-01-14',
    },
    {
      _id: 'v2p5', name: 'Retinol Night Cream', description: 'Anti-aging night cream with 0.5% retinol for smoother skin overnight.',
      price: 24.99, originalPrice: 36.99, discountPercentage: 32,
      stock: 90, category: 'Beauty', images: [], image: PIMG.p15,
      averageRating: 4.4, totalReviews: 178,
      vendorId: 'v2', vendorName: 'StyleHub',
      createdAt: '2024-01-15', updatedAt: '2024-01-15',
    },
  ],
  v3: [
    {
      _id: '3', name: 'Smart LED Desk Lamp', description: 'Touch-sensitive lamp with colour temperature control and USB charging.',
      price: 22.99, originalPrice: 32.50, discountPercentage: 29,
      stock: 75, category: 'Home', images: [], image: PIMG.p3,
      averageRating: 4.7, totalReviews: 203,
      vendorId: 'v3', vendorName: 'HomeNest',
      createdAt: '2024-01-03', updatedAt: '2024-01-03',
    },
    {
      _id: 'v3p2', name: 'Linen Throw Cushion Set', description: 'Set of 4 premium linen cushion covers in earthy neutral tones.',
      price: 29.99, originalPrice: 42.00, discountPercentage: 29,
      stock: 55, category: 'Home', images: [], image: PIMG.p11,
      averageRating: 4.8, totalReviews: 134,
      vendorId: 'v3', vendorName: 'HomeNest', isNew: true,
      createdAt: '2024-01-16', updatedAt: '2024-01-16',
    },
    {
      _id: 'v3p3', name: 'Bamboo Kitchen Organiser', description: 'Expandable bamboo drawer divider set for a clutter-free kitchen.',
      price: 18.99, originalPrice: 26.99, discountPercentage: 30,
      stock: 40, category: 'Home', images: [], image: PIMG.p12,
      averageRating: 4.5, totalReviews: 88,
      vendorId: 'v3', vendorName: 'HomeNest',
      createdAt: '2024-01-17', updatedAt: '2024-01-17',
    },
    {
      _id: 'v3p4', name: 'Scented Soy Candle Set', description: 'Hand-poured 100% soy candles in vanilla, lavender, and cedar.',
      price: 16.99, originalPrice: 24.99, discountPercentage: 32,
      stock: 100, category: 'Home', images: [], image: PIMG.p13,
      averageRating: 4.9, totalReviews: 267,
      vendorId: 'v3', vendorName: 'HomeNest', isFeatured: true,
      createdAt: '2024-01-18', updatedAt: '2024-01-18',
    },
  ],
  v4: [
    {
      _id: '4', name: 'Yoga Mat Premium', description: 'Non-slip 6 mm thick mat with alignment lines and carry strap.',
      price: 19.99, originalPrice: 28.99, discountPercentage: 31,
      stock: 100, category: 'Sports', images: [], image: PIMG.p4,
      averageRating: 4.8, totalReviews: 312,
      vendorId: 'v4', vendorName: 'FitZone', isFeatured: true,
      createdAt: '2024-01-04', updatedAt: '2024-01-04',
    },
    {
      _id: '8', name: 'Running Shoes Air', description: 'Lightweight breathable shoes with responsive foam cushioning.',
      price: 49.99, originalPrice: 65.00, discountPercentage: 23,
      stock: 45, category: 'Sports', images: [], image: PIMG.p8,
      averageRating: 4.3, totalReviews: 176,
      vendorId: 'v4', vendorName: 'FitZone', isFeatured: true,
      createdAt: '2024-01-08', updatedAt: '2024-01-08',
    },
    {
      _id: 'v4p3', name: 'Resistance Band Set', description: '5-level resistance bands with door anchor, handles, and carry bag.',
      price: 14.99, originalPrice: 22.99, discountPercentage: 35,
      stock: 150, category: 'Sports', images: [], image: PIMG.p14,
      averageRating: 4.6, totalReviews: 489,
      vendorId: 'v4', vendorName: 'FitZone', isNew: true,
      createdAt: '2024-01-19', updatedAt: '2024-01-19',
    },
    {
      _id: 'v4p4', name: 'Adjustable Dumbbell Set', description: 'Space-saving 2–24 kg adjustable dumbbells — perfect for home gyms.',
      price: 119.99, originalPrice: 159.99, discountPercentage: 25,
      stock: 18, category: 'Sports', images: [], image: PIMG.p15,
      averageRating: 4.9, totalReviews: 201,
      vendorId: 'v4', vendorName: 'FitZone', isFeatured: true,
      createdAt: '2024-01-20', updatedAt: '2024-01-20',
    },
    {
      _id: 'v4p5', name: 'Protein Shaker Bottle', description: 'BPA-free 700ml shaker with BlenderBall wire whisk and measurement marks.',
      price: 9.99, originalPrice: 14.99, discountPercentage: 33,
      stock: 200, category: 'Sports', images: [], image: PIMG.p6,
      averageRating: 4.4, totalReviews: 623,
      vendorId: 'v4', vendorName: 'FitZone',
      createdAt: '2024-01-21', updatedAt: '2024-01-21',
    },
    {
      _id: 'v4p6', name: 'Jump Rope Speed Cable', description: 'Ball-bearing speed rope with adjustable cable for HIIT and CrossFit.',
      price: 12.99, originalPrice: 18.99, discountPercentage: 32,
      stock: 80, category: 'Sports', images: [], image: PIMG.p8,
      averageRating: 4.7, totalReviews: 344,
      vendorId: 'v4', vendorName: 'FitZone', isNew: true,
      createdAt: '2024-01-22', updatedAt: '2024-01-22',
    },
  ],
}

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Summer Sale 2025',
    subtitle: 'Up to 60% off on electronics',
    badge: '60% OFF',
    ctaText: 'Shop Now',
    gradientColors: ['#CE4002', '#CE4002'],
    image: IMG_BANNER_1,
  },
  {
    id: 'b2',
    title: 'New Season Fashion',
    subtitle: 'Discover the latest trends',
    badge: 'NEW IN',
    ctaText: 'Explore',
    gradientColors: ['#2c489f', '#312d8a'],
    image: IMG_BANNER_2,
  },
  {
    id: 'b3',
    title: 'Free Delivery Week',
    subtitle: 'Free shipping on orders above $30',
    badge: 'FREE SHIP',
    ctaText: 'Order Now',
    gradientColors: ['#37c0b1', '#2c489f'],
    image: IMG_BANNER_3,
  },
]

export interface PromoBanner {
  id: string
  title: string
  subtitle: string
  color: string
  bg: string
  ctaText: string
}

export const PROMO_BANNERS: PromoBanner[] = [
  { id: 'p1', title: 'Buy 2 Get 1', subtitle: 'On selected fashion items', color: '#fff', bg: '#CE4002', ctaText: 'Claim' },
  { id: 'p2', title: 'Flash Deals', subtitle: 'Today only — prices slashed', color: '#fff', bg: '#312d8a', ctaText: 'View' },
]

export const CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: 'phone-portrait-outline', color: '#312d8a', bg: '#eceef8', image: CIMG.cat1 },
  { id: 'fashion',     name: 'Fashion',     icon: 'shirt-outline',          color: '#CE4002', bg: '#FEF0E6', image: CIMG.cat2 },
  { id: 'home',        name: 'Home',        icon: 'home-outline',           color: '#F59E0B', bg: '#FFFBEB', image: CIMG.cat3 },
  { id: 'sports',      name: 'Sports',      icon: 'barbell-outline',        color: '#37c0b1', bg: '#e3f8f6', image: CIMG.cat4 },
  { id: 'beauty',      name: 'Beauty',      icon: 'sparkles-outline',       color: '#CE4002', bg: '#fce0f2', image: CIMG.cat5 },
  { id: 'books',       name: 'Books',       icon: 'book-outline',           color: '#2c489f', bg: '#e8ecf8', image: CIMG.cat1 },
  { id: 'food',        name: 'Food',        icon: 'fast-food-outline',      color: '#CE4002', bg: '#fdeee9', image: CIMG.cat3 },
  { id: 'toys',        name: 'Toys',        icon: 'game-controller-outline',color: '#B33600', bg: '#fde9e0', image: CIMG.cat2 },
]

export const CATEGORY_META: Record<string, { color: string; icon: string; bg: string }> = {
  Electronics: { color: '#312d8a', icon: 'phone-portrait-outline', bg: '#eceef8' },
  Fashion:     { color: '#CE4002', icon: 'shirt-outline', bg: '#FEF0E6' },
  Home:        { color: '#F59E0B', icon: 'home-outline', bg: '#FFFBEB' },
  Sports:      { color: '#37c0b1', icon: 'barbell-outline', bg: '#e3f8f6' },
  Beauty:      { color: '#CE4002', icon: 'sparkles-outline', bg: '#fce0f2' },
  Books:       { color: '#2c489f', icon: 'book-outline', bg: '#e8ecf8' },
}

export const MOCK_PRODUCTS: Product[] = [
  {
    _id: '1', name: 'Wireless Headphones Pro', description: 'Premium sound with active noise cancellation and 30h battery life.',
    price: 59.99, originalPrice: 89.99, discountPercentage: 33,
    stock: 50, category: 'Electronics', images: [], image: PIMG.p1,
    averageRating: 4.5, totalReviews: 128,
    vendorId: 'v1', vendorName: 'TechNest', isFeatured: true,
    createdAt: '2024-01-01', updatedAt: '2024-01-01',
  },
  {
    _id: '2', name: 'Slim Fit Chino Pants', description: 'Comfortable everyday slim-fit chinos in premium stretch cotton.',
    price: 32.00, originalPrice: 45.00, discountPercentage: 29,
    stock: 30, category: 'Fashion', images: [], image: PIMG.p2,
    averageRating: 4.2, totalReviews: 64,
    vendorId: 'v2', vendorName: 'StyleHub', isNew: true,
    createdAt: '2024-01-02', updatedAt: '2024-01-02',
  },
  {
    _id: '3', name: 'Smart LED Desk Lamp', description: 'Touch-sensitive lamp with colour temperature control and USB charging.',
    price: 22.99, originalPrice: 32.50, discountPercentage: 29,
    stock: 75, category: 'Home', images: [], image: PIMG.p3,
    averageRating: 4.7, totalReviews: 203,
    vendorId: 'v3', vendorName: 'HomeNest',
    createdAt: '2024-01-03', updatedAt: '2024-01-03',
  },
  {
    _id: '4', name: 'Yoga Mat Premium', description: 'Non-slip 6 mm thick mat with alignment lines and carry strap.',
    price: 19.99, originalPrice: 28.99, discountPercentage: 31,
    stock: 100, category: 'Sports', images: [], image: PIMG.p4,
    averageRating: 4.8, totalReviews: 312,
    vendorId: 'v4', vendorName: 'FitZone', isFeatured: true,
    createdAt: '2024-01-04', updatedAt: '2024-01-04',
  },
  {
    _id: '5', name: 'Vitamin C Serum', description: 'Brightening 20% vitamin C serum for radiant, even-toned skin.',
    price: 15.99, originalPrice: 22.99, discountPercentage: 30,
    stock: 200, category: 'Beauty', images: [], image: PIMG.p5,
    averageRating: 4.6, totalReviews: 445,
    vendorId: 'v2', vendorName: 'StyleHub',
    createdAt: '2024-01-05', updatedAt: '2024-01-05',
  },
  {
    _id: '6', name: 'Atomic Habits', description: 'An easy and proven way to build good habits by James Clear.',
    price: 10.99, originalPrice: 14.99, discountPercentage: 27,
    stock: 150, category: 'Books', images: [], image: PIMG.p6,
    averageRating: 4.9, totalReviews: 1024,
    isNew: true,
    createdAt: '2024-01-06', updatedAt: '2024-01-06',
  },
  {
    _id: '7', name: 'Mechanical Keyboard', description: 'TKL 75% mechanical keyboard with RGB backlight and Cherry MX switches.',
    price: 89.99, originalPrice: 119.99, discountPercentage: 25,
    stock: 20, category: 'Electronics', images: [], image: PIMG.p7,
    averageRating: 4.4, totalReviews: 89,
    vendorId: 'v1', vendorName: 'TechNest',
    createdAt: '2024-01-07', updatedAt: '2024-01-07',
  },
  {
    _id: '8', name: 'Running Shoes Air', description: 'Lightweight breathable shoes with responsive foam cushioning.',
    price: 49.99, originalPrice: 65.00, discountPercentage: 23,
    stock: 45, category: 'Sports', images: [], image: PIMG.p8,
    averageRating: 4.3, totalReviews: 176,
    vendorId: 'v4', vendorName: 'FitZone', isFeatured: true,
    createdAt: '2024-01-08', updatedAt: '2024-01-08',
  },
  {
    _id: '9', name: 'Smart Watch Series X', description: 'Health tracking, GPS, and 7-day battery life in a slim design.',
    price: 129.99, originalPrice: 179.99, discountPercentage: 28,
    stock: 35, category: 'Electronics', images: [], image: PIMG.p9,
    averageRating: 4.7, totalReviews: 567,
    vendorId: 'v1', vendorName: 'TechNest', isFeatured: true,
    createdAt: '2024-01-09', updatedAt: '2024-01-09',
  },
  {
    _id: '10', name: 'Linen Summer Dress', description: 'Effortlessly elegant linen dress perfect for warm weather.',
    price: 38.99, originalPrice: 55.00, discountPercentage: 29,
    stock: 60, category: 'Fashion', images: [], image: PIMG.p10,
    averageRating: 4.5, totalReviews: 234,
    vendorId: 'v2', vendorName: 'StyleHub', isNew: true,
    createdAt: '2024-01-10', updatedAt: '2024-01-10',
  },
]

export const MOCK_FLASH_PRODUCTS = MOCK_PRODUCTS.filter(p => p.isFeatured)

export const MOCK_PROMOS: Record<string, PromoCode> = {
  'SAVE10':   { code: 'SAVE10',   type: 'percent',  value: 10, label: '10% off your order' },
  'MAUZO20':  { code: 'MAUZO20',  type: 'percent',  value: 20, label: '20% off your order' },
  'FLAT5':    { code: 'FLAT5',    type: 'flat',     value: 5,  label: '$5 off your order' },
  'FREESHIP': { code: 'FREESHIP', type: 'freeship', value: 0,  label: 'Free delivery on this order' },
}

export const PRODUCT_VARIANTS: Record<string, { sizes?: string[]; colors?: Array<{ label: string; hex: string }> }> = {
  '1': { colors: [{ label: 'Midnight Black', hex: '#111827' }, { label: 'Arctic White', hex: '#F9FAFB' }, { label: 'Navy Blue', hex: '#1E3A5F' }] },
  '2': { sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], colors: [{ label: 'Khaki', hex: '#C8A96E' }, { label: 'Charcoal', hex: '#374151' }, { label: 'Olive', hex: '#4A5240' }] },
  '4': { colors: [{ label: 'Indigo', hex: '#6366F1' }, { label: 'Forest', hex: '#2D5A27' }, { label: 'Slate', hex: '#374151' }] },
  '7': { colors: [{ label: 'Space Grey', hex: '#374151' }, { label: 'Pearl White', hex: '#F9FAFB' }, { label: 'Silver', hex: '#9CA3AF' }] },
  '8': { sizes: ['39', '40', '41', '42', '43', '44', '45'], colors: [{ label: 'Black', hex: '#111827' }, { label: 'White', hex: '#F9FAFB' }, { label: 'Crimson', hex: '#EF4444' }] },
  '9': { colors: [{ label: 'Midnight', hex: '#111827' }, { label: 'Silver', hex: '#9CA3AF' }, { label: 'Gold', hex: '#D97706' }] },
  '10': { sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: [{ label: 'Lemon', hex: '#FEF08A' }, { label: 'Pearl', hex: '#E5E7EB' }, { label: 'Sky', hex: '#BAE6FD' }] },
}

export const MOCK_CART_ITEMS: CartItem[] = [
  { _id: 'c1', product: MOCK_PRODUCTS[0], quantity: 2, vendorId: 'v1', vendorName: 'TechNest' },
  { _id: 'c2', product: MOCK_PRODUCTS[2], quantity: 1, vendorId: 'v3', vendorName: 'HomeNest' },
  { _id: 'c3', product: MOCK_PRODUCTS[4], quantity: 3, vendorId: 'v2', vendorName: 'StyleHub' },
]

export const MOCK_ORDERS: Order[] = [
  {
    _id: 'o1', user: 'u1', clerkId: 'c1',
    orderItems: [{ _id: 'oi1', product: MOCK_PRODUCTS[0], name: MOCK_PRODUCTS[0].name, price: MOCK_PRODUCTS[0].price, quantity: 1, image: '' }],
    shippingAddress: { fullName: 'John Doe', streetAddress: '123 Main St', city: 'Nairobi', state: 'Nairobi County', zipCode: '00100', phoneNumber: '+254700000000' },
    paymentResult: { id: 'pay1', status: 'paid' },
    totalPrice: 59.99, status: 'delivered', hasReviewed: false,
    vendorId: 'v1', vendorName: 'TechNest',
    createdAt: '2024-02-01', updatedAt: '2024-02-05',
  },
  {
    _id: 'o2', user: 'u1', clerkId: 'c1',
    orderItems: [
      { _id: 'oi2', product: MOCK_PRODUCTS[3], name: MOCK_PRODUCTS[3].name, price: MOCK_PRODUCTS[3].price, quantity: 2, image: '' },
      { _id: 'oi3', product: MOCK_PRODUCTS[5], name: MOCK_PRODUCTS[5].name, price: MOCK_PRODUCTS[5].price, quantity: 1, image: '' },
    ],
    shippingAddress: { fullName: 'John Doe', streetAddress: '123 Main St', city: 'Nairobi', state: 'Nairobi County', zipCode: '00100', phoneNumber: '+254700000000' },
    paymentResult: { id: 'pay2', status: 'paid' },
    totalPrice: 50.97, status: 'shipped', hasReviewed: false,
    vendorId: 'v4', vendorName: 'FitZone',
    createdAt: '2024-02-10', updatedAt: '2024-02-11',
  },
  {
    _id: 'o3', user: 'u1', clerkId: 'c1',
    orderItems: [{ _id: 'oi4', product: MOCK_PRODUCTS[6], name: MOCK_PRODUCTS[6].name, price: MOCK_PRODUCTS[6].price, quantity: 1, image: '' }],
    shippingAddress: { fullName: 'John Doe', streetAddress: '123 Main St', city: 'Nairobi', state: 'Nairobi County', zipCode: '00100', phoneNumber: '+254700000000' },
    paymentResult: { id: 'pay3', status: 'paid' },
    totalPrice: 89.99, status: 'pending', hasReviewed: false,
    vendorId: 'v1', vendorName: 'TechNest',
    createdAt: '2024-02-14', updatedAt: '2024-02-14',
  },
]
