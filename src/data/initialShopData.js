// Initial categories with subcategories for Ranaji Royal Showroom
export const defaultCategories = [
  {
    id: 'groom',
    name: 'Groom Collection',
    slug: 'groom',
    description: 'Regal wedding attire for royal grooms including Sherwanis, Jodhpuris, Achkans, and Bandhgalas',
    image: '/images/468620690_18338704426195142_1504528542693550564_n.jpg',
    subcategories: ['Sherwani', 'Jodhpuri Suit', 'Band Gala', 'Achkan', 'Kurta Pajama'],
    isActive: true,
  },
  {
    id: 'bride',
    name: 'Bride Collection',
    slug: 'bride',
    description: 'Authentic royal Rajasthani bridal poshaks, lehengas, and odhnas with intricate zari & gota patti work',
    image: '/images/57914fa103583fa779bdba247cf59540.jpg',
    subcategories: ['Rajasthani Poshak', 'Bridal Poshak', 'Royal Lehenga', 'Designer Anarkali'],
    isActive: true,
  },
  {
    id: 'accessories',
    name: 'Royal Accessories',
    slug: 'accessories',
    description: 'Traditional ceremonial safas, talwars, flags, and heritage Rajasthani handicrafts',
    image: '/images/image2.png',
    subcategories: ['Saafa / Paag', 'Ceremonial Talwar', 'Rajputi Flag (Nishan)', 'Handicrafts & Decor'],
    isActive: true,
  },
];

// Rich initial product collection with purchase price, rental price, subcategories, sizes, and specs
export const defaultProducts = [
  // GROOM PRODUCTS
  {
    id: 1,
    name: 'The Maharaja Sherwani',
    category: 'groom',
    subcategory: 'Sherwani',
    price: 15000,
    rentPrice: 4500,
    priceType: 'Complete Set',
    description: 'Premium embroidered royal sherwani in deep maroon with antique gold zari work and handcrafted pearl detailing, crafted for the royal groom.',
    image: '/images/468620690_18338704426195142_1504528542693550564_n.jpg',
    images: [
      '/images/468620690_18338704426195142_1504528542693550564_n.jpg',
      '/images/image10.png'
    ],
    available: ['rent', 'purchase'],
    sizes: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)', 'Custom Fit'],
    fabric: 'Raw Silk & Velvet Zari',
    color: 'Deep Royal Maroon & Antique Gold',
    stock: 5,
    featured: true,
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Bestseller'
  },
  {
    id: 2,
    name: 'Royal Jodhpuri Suit',
    category: 'groom',
    subcategory: 'Jodhpuri Suit',
    price: 12000,
    rentPrice: 3800,
    priceType: 'Two-piece Suit',
    description: 'Authentic Jodhpuri bandhgala suit with traditional Rajasthani hand embroidery, mother-of-pearl buttons, and structured silhouette.',
    image: '/images/469045680_18338704624195142_6868154674655748113_n.jpg',
    images: [
      '/images/469045680_18338704624195142_6868154674655748113_n.jpg'
    ],
    available: ['rent', 'purchase'],
    sizes: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)', 'Custom Fit'],
    fabric: 'Italian Wool Blend & Raw Silk',
    color: 'Midnight Blue & Gold Accents',
    stock: 6,
    featured: true,
    rating: 4.8,
    reviewsCount: 29,
    badge: 'Royal Classic'
  },
  {
    id: 3,
    name: 'Regal Band Gala',
    category: 'groom',
    subcategory: 'Band Gala',
    price: 14000,
    rentPrice: 4200,
    priceType: 'Jacket & Trouser',
    description: 'Classic Band Gala (Bandhgala) jacket with intricate gota patti handwork and royal collar, a timeless symbol of Rajput nobility.',
    image: '/images/OIP.webp',
    images: [
      '/images/OIP.webp'
    ],
    available: ['rent', 'purchase'],
    sizes: ['38 (M)', '40 (L)', '42 (XL)', 'Custom Fit'],
    fabric: 'Brocade & Silk',
    color: 'Imperial Gold & Ivory',
    stock: 4,
    featured: false,
    rating: 4.7,
    reviewsCount: 19,
    badge: 'Heritage'
  },
  {
    id: 4,
    name: 'Traditional Achkan',
    category: 'groom',
    subcategory: 'Achkan',
    price: 16000,
    rentPrice: 5000,
    priceType: 'Achkan with Churidar',
    description: 'Long flowing Achkan with traditional Mewari floral motifs, royal front slit, and bespoke gold buttons, perfect for Udaipur royal ceremonies.',
    image: '/images/image.png',
    images: [
      '/images/image.png'
    ],
    available: ['rent', 'purchase'],
    sizes: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)', 'Custom Fit'],
    fabric: 'Heavy Banarasi Silk',
    color: 'Crimson & Gold',
    stock: 3,
    featured: true,
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Featured Groom'
  },
  {
    id: 5,
    name: 'Groom Cream Sherwani',
    category: 'groom',
    subcategory: 'Sherwani',
    price: 18000,
    rentPrice: 5500,
    priceType: 'Full Ensemble',
    description: 'Royal cream and ivory sherwani complemented with ruby red royal dupatta, safa matching trim, and rich dabka work for the complete Dulha look.',
    image: '/images/image10.png',
    images: [
      '/images/image10.png'
    ],
    available: ['rent', 'purchase'],
    sizes: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)', 'Custom Fit'],
    fabric: 'Tussar Silk with Dabka Zari',
    color: 'Royal Ivory & Crimson Red',
    stock: 5,
    featured: true,
    rating: 4.9,
    reviewsCount: 34,
    badge: 'Dulha Special'
  },

  // BRIDE PRODUCTS
  {
    id: 6,
    name: 'Rajasthani Bridal Poshak',
    category: 'bride',
    subcategory: 'Rajasthani Poshak',
    price: 18000,
    rentPrice: 5500,
    priceType: 'Full 4-Piece Poshak',
    description: 'Traditional authentic Rajasthani poshak in vibrant emerald green with silver gota work, heavy thread embroidery, kundan stones, and matching odhna.',
    image: '/images/3b4167748d5c5593bc91a962e27b38fb.jpg',
    images: [
      '/images/3b4167748d5c5593bc91a962e27b38fb.jpg'
    ],
    available: ['rent', 'purchase'],
    sizes: ['Free Size (Stitched)', 'Semi-Stitched', 'Custom Tailored'],
    fabric: 'Pure Georgette & Satin with Gota Patti',
    color: 'Emerald Green & Silver',
    stock: 4,
    featured: true,
    rating: 4.9,
    reviewsCount: 51,
    badge: 'Royal Bride'
  },
  {
    id: 7,
    name: 'Royal Red Bridal Poshak',
    category: 'bride',
    subcategory: 'Bridal Poshak',
    price: 25000,
    rentPrice: 7500,
    priceType: 'Complete Bridal Set',
    description: 'Exquisite red bridal poshak with real gold zari work, pearls, magji border, and traditional Rajputi royal odhna, honoring Mewari wedding heritage.',
    image: '/images/57914fa103583fa779bdba247cf59540.jpg',
    images: [
      '/images/57914fa103583fa779bdba247cf59540.jpg'
    ],
    available: ['rent', 'purchase'],
    sizes: ['Free Size (Stitched)', 'Semi-Stitched', 'Custom Tailored'],
    fabric: 'Pure Silk & Handcrafted Zardozi',
    color: 'Gulabi Red & Royal Gold',
    stock: 3,
    featured: true,
    rating: 5.0,
    reviewsCount: 64,
    badge: 'Crown Jewel'
  },
  {
    id: 8,
    name: 'Blue Rajputi Poshak',
    category: 'bride',
    subcategory: 'Rajasthani Poshak',
    price: 22000,
    rentPrice: 6500,
    priceType: '4-Piece Poshak',
    description: 'Stunning royal sapphire blue Rajputi poshak featuring intricate silver and gold floral embroidery, embellished borders, and lightweight flowing odhna.',
    image: '/images/48d3eda980b76a67c385413034b01b0c.jpg',
    images: [
      '/images/48d3eda980b76a67c385413034b01b0c.jpg'
    ],
    available: ['rent', 'purchase'],
    sizes: ['Free Size (Stitched)', 'Semi-Stitched', 'Custom Tailored'],
    fabric: 'Georgette & Chiffon',
    color: 'Sapphire Blue & Silver Gota',
    stock: 4,
    featured: false,
    rating: 4.8,
    reviewsCount: 27,
    badge: 'Popular'
  },
  {
    id: 9,
    name: 'Designer Anarkali',
    category: 'bride',
    subcategory: 'Designer Anarkali',
    price: 15000,
    rentPrice: 4200,
    priceType: '3-Piece Set',
    description: 'Grand floor-length designer anarkali with intricate gold embroidery, Rajasthani hand-cut mirror work, and richly flared hemline for sangeet & mehendi.',
    image: '/images/OIP (1).webp',
    images: [
      '/images/OIP (1).webp'
    ],
    available: ['rent', 'purchase'],
    sizes: ['S', 'M', 'L', 'XL', 'Custom Fit'],
    fabric: 'Chanderi Silk & Net Dupatta',
    color: 'Dusty Rose & Antique Gold',
    stock: 5,
    featured: true,
    rating: 4.7,
    reviewsCount: 31,
    badge: 'Festive Favorite'
  },

  // ACCESSORIES PRODUCTS
  {
    id: 10,
    name: 'Rajasthani Saafa / Paag',
    category: 'accessories',
    subcategory: 'Saafa / Paag',
    price: 2500,
    rentPrice: 900,
    priceType: 'Single Piece',
    description: 'Traditional Rajasthani hand-tied safa/paagdi adorned with pearl string, gold brooch (sarpech), and royal peacock feather embellishment.',
    image: '/images/image2.png',
    images: [
      '/images/image2.png'
    ],
    available: ['rent', 'purchase'],
    sizes: ['Standard Head Fit (Adjustable)'],
    fabric: 'Pure Bandhani Silk / Cotton Malmal',
    color: 'Kesariya (Saffron) & Rani Pink',
    stock: 15,
    featured: true,
    rating: 4.9,
    reviewsCount: 88,
    badge: 'Essential'
  },
  {
    id: 11,
    name: 'Rajputi Talwar (Ceremonial)',
    category: 'accessories',
    subcategory: 'Ceremonial Talwar',
    price: 3500,
    rentPrice: 1200,
    priceType: 'Sword with Scabbard',
    description: 'Ornate ceremonial Rajputi talwar with brass lion hilt, engraved scabbard with velvet casing, an essential royal artifact for groom baraat entry.',
    image: '/images/image5.png',
    images: [
      '/images/image5.png'
    ],
    available: ['rent', 'purchase'],
    sizes: ['Standard 34-inch Ceremonial'],
    fabric: 'Engraved Brass & Velvet Sheath',
    color: 'Gold & Crimson Velvet',
    stock: 8,
    featured: true,
    rating: 4.9,
    reviewsCount: 72,
    badge: 'Ceremonial'
  },
  {
    id: 12,
    name: 'Rajputi Flag (Nishan)',
    category: 'accessories',
    subcategory: 'Rajputi Flag (Nishan)',
    price: 1500,
    rentPrice: 500,
    priceType: 'Flag with Brass Pole Finial',
    description: 'Traditional Rajputi saffron nishan featuring royal Sun (Surya) dynasty emblem and gold tassels, carried with honor during the wedding procession.',
    image: '/images/a4d95777f41ab35a82b3b5028c350519.webp',
    images: [
      '/images/a4d95777f41ab35a82b3b5028c350519.webp'
    ],
    available: ['purchase'],
    sizes: ['Large (3x5 ft)'],
    fabric: 'Satin Silk with Golden Zari Print',
    color: 'Saffron & Gold',
    stock: 20,
    featured: false,
    rating: 4.6,
    reviewsCount: 15,
    badge: 'Tradition'
  },
  {
    id: 13,
    name: 'Rajasthani Handicrafts & Shagun Box',
    category: 'accessories',
    subcategory: 'Handicrafts & Decor',
    price: 1200,
    rentPrice: 400,
    priceType: 'Set of 2',
    description: 'Authentic handcrafted Mewari shagun jewelry boxes with meenakari hand-painted detailing and velvet interior for royal gifts.',
    image: '/images/image11.png',
    images: [
      '/images/image11.png'
    ],
    available: ['purchase'],
    sizes: ['Standard Gift Box'],
    fabric: 'Teak Wood, Brass & Enamel Paint',
    color: 'Royal Multi-color & Gold',
    stock: 25,
    featured: false,
    rating: 4.8,
    reviewsCount: 22,
    badge: 'Handcrafted'
  }
];
