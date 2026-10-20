require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const connectDB = require("../src/config/database");
const Category = require("../src/models/Category");
const Product = require("../src/models/product");
const Service = require("../src/models/Service");
const Testimonial = require("../src/models/Testimonial");
const Gallery = require("../src/models/Gallery");
const Customer = require("../src/models/Customer");

const initialCategories = [
  {
    name: "Groom Collection",
    slug: "groom",
    description: "Regal wedding attire for royal grooms including Sherwanis, Jodhpuris, Achkans, and Bandhgalas",
    image: "/images/468620690_18338704426195142_1504528542693550564_n.jpg",
    subcategories: ["Sherwani", "Jodhpuri Suit", "Band Gala", "Achkan", "Kurta Pajama"],
    isActive: true,
    featured: true
  },
  {
    name: "Bride Collection",
    slug: "bride",
    description: "Authentic royal Rajasthani bridal poshaks, lehengas, and odhnas with intricate zari & gota patti work",
    image: "/images/57914fa103583fa779bdba247cf59540.jpg",
    subcategories: ["Rajasthani Poshak", "Bridal Poshak", "Royal Lehenga", "Designer Anarkali"],
    isActive: true,
    featured: true
  },
  {
    name: "Royal Accessories",
    slug: "accessories",
    description: "Traditional ceremonial safas, talwars, flags, and heritage Rajasthani handicrafts",
    image: "/images/image2.png",
    subcategories: ["Saafa / Paag", "Ceremonial Talwar", "Rajputi Flag (Nishan)", "Handicrafts & Decor"],
    isActive: true,
    featured: true
  }
];

const initialProducts = [
  {
    name: "The Maharaja Sherwani",
    categorySlug: "groom",
    subcategory: "Sherwani",
    price: 15000,
    rentPrice: 4500,
    priceType: "Complete Set",
    description: "Premium embroidered royal sherwani in deep maroon with antique gold zari work and handcrafted pearl detailing, crafted for the royal groom.",
    image: "/images/468620690_18338704426195142_1504528542693550564_n.jpg",
    available: ["rent", "purchase"],
    sizes: ["38 (M)", "40 (L)", "42 (XL)", "44 (XXL)", "Custom Fit"],
    fabric: "Raw Silk & Velvet Zari",
    color: "Deep Royal Maroon & Antique Gold",
    stock: 8,
    sku: "RNJ-GRM-001",
    featured: true,
    badge: "Bestseller"
  },
  {
    name: "Heritage Jodhpuri Suit",
    categorySlug: "groom",
    subcategory: "Jodhpuri Suit",
    price: 12500,
    rentPrice: 3800,
    priceType: "Starting Price",
    description: "Classic royal tailored royal blue Jodhpuri ensemble featuring hand-carved brass buttons and silk thread borders.",
    image: "/images/469045680_18338704624195142_6868154674655748113_n.jpg",
    available: ["rent", "purchase"],
    sizes: ["38 (M)", "40 (L)", "42 (XL)", "Custom Fit"],
    fabric: "Italian Wool & Raw Silk",
    color: "Midnight Royal Blue",
    stock: 6,
    sku: "RNJ-GRM-002",
    featured: true,
    badge: "Royal Classic"
  },
  {
    name: "Imperial Band Gala Suit",
    categorySlug: "groom",
    subcategory: "Band Gala",
    price: 14000,
    rentPrice: 4200,
    priceType: "Starting Price",
    description: "Sophisticated charcoal and gold bandgala jacket with pocket square and silk tapered trousers.",
    image: "/images/City-Palace-Udaipur.jpg",
    available: ["rent", "purchase"],
    sizes: ["40 (L)", "42 (XL)", "Custom Fit"],
    fabric: "Brocade Silk",
    color: "Charcoal & Royal Gold",
    stock: 5,
    sku: "RNJ-GRM-003",
    featured: false,
    badge: "New Arrival"
  },
  {
    name: "Rajputana Achkan",
    categorySlug: "groom",
    subcategory: "Achkan",
    price: 16500,
    rentPrice: 5000,
    priceType: "Full Ensemble",
    description: "Traditional knee-length achkan with rich resham thread work, paired with matching churidar and stole.",
    image: "/images/OIP.webp",
    available: ["rent", "purchase"],
    sizes: ["38 (M)", "40 (L)", "42 (XL)", "Custom Fit"],
    fabric: "Pure Banarasi Silk",
    color: "Ivory & Antique Gold",
    stock: 4,
    sku: "RNJ-GRM-004",
    featured: true,
    badge: "Signature"
  },
  {
    name: "Royal Silk Kurta Pajama",
    categorySlug: "groom",
    subcategory: "Kurta Pajama",
    price: 6500,
    rentPrice: 2000,
    priceType: "Starting Price",
    description: "Lightweight festive pure silk kurta with subtle embroidery on placket, ideal for haldi or sangeet.",
    image: "/images/image.png",
    available: ["rent", "purchase"],
    sizes: ["38 (M)", "40 (L)", "42 (XL)", "44 (XXL)"],
    fabric: "Tussar Silk",
    color: "Mustard Gold & Pearl White",
    stock: 12,
    sku: "RNJ-GRM-005",
    featured: false,
    badge: "Festive"
  },
  {
    name: "Royal Emerald Bridal Poshak",
    categorySlug: "bride",
    subcategory: "Rajasthani Poshak",
    price: 25000,
    rentPrice: 7500,
    priceType: "Full 4-Piece Set",
    description: "Heritage Mewari green bridal poshak with heavy dabka, sitara, and authentic hand-embroidered gota patti work.",
    image: "/images/3b4167748d5c5593bc91a962e27b38fb.jpg",
    available: ["rent", "purchase"],
    sizes: ["Free Size (Customizable)"],
    fabric: "Pure Georgette & Satin Silk",
    color: "Emerald Royal Green & Gold",
    stock: 4,
    sku: "RNJ-BRD-001",
    featured: true,
    badge: "Mewar Heritage"
  },
  {
    name: "Rani Padmavati Crimson Poshak",
    categorySlug: "bride",
    subcategory: "Bridal Poshak",
    price: 28000,
    rentPrice: 8500,
    priceType: "Complete Bridal Ensemble",
    description: "Exquisite bridal red poshak with intricate royal jaal embroidery, real silver-gold plating highlights, and embellished odhna.",
    image: "/images/57914fa103583fa779bdba247cf59540.jpg",
    available: ["rent", "purchase"],
    sizes: ["Free Size (Customizable)"],
    fabric: "Pure Crepe & Chiffon",
    color: "Traditional Royal Crimson Red",
    stock: 5,
    sku: "RNJ-BRD-002",
    featured: true,
    badge: "Masterpiece"
  },
  {
    name: "Lake Palace Designer Anarkali",
    categorySlug: "bride",
    subcategory: "Designer Anarkali",
    price: 18500,
    rentPrice: 5500,
    priceType: "Set with Dupatta",
    description: "Flowing royal sapphire anarkali with intricate neckline zardozi and cascading silk flare for wedding receptions.",
    image: "/images/48d3eda980b76a67c385413034b01b0c.jpg",
    available: ["rent", "purchase"],
    sizes: ["36 (S)", "38 (M)", "40 (L)", "42 (XL)"],
    fabric: "Organza & Mulberry Silk",
    color: "Royal Sapphire Blue",
    stock: 6,
    sku: "RNJ-BRD-003",
    featured: false,
    badge: "Trending"
  },
  {
    name: "Rajputi Pachranga Saafa",
    categorySlug: "accessories",
    subcategory: "Saafa / Paag",
    price: 3500,
    rentPrice: 1000,
    priceType: "Tied or Fabric",
    description: "Authentic five-colored Rajasthani ceremonial wedding saafa tied in Mewari royal durbar style, complete with feather kalgi broach.",
    image: "/images/587771552_18385644520195142_1280633816568335167_n.jpg",
    available: ["rent", "purchase"],
    sizes: ["Standard Royal Fit (Adjustable)"],
    fabric: "Chanderi Cotton Silk",
    color: "Multicolor Pachranga with Gold Border",
    stock: 25,
    sku: "RNJ-ACC-001",
    featured: true,
    badge: "Essential"
  },
  {
    name: "Ceremonial Rajputi Talwar",
    categorySlug: "accessories",
    subcategory: "Ceremonial Talwar",
    price: 8500,
    rentPrice: 2500,
    priceType: "Starting Price",
    description: "Blunt ceremonial wedding sword with intricately engraved brass hilt, red velvet scabbard, and gold filigree.",
    image: "/images/image2.png",
    available: ["rent", "purchase"],
    sizes: ["Full 36-Inch Length"],
    fabric: "Tempered Brass & Velvet Scabbard",
    color: "Gold & Royal Red",
    stock: 7,
    sku: "RNJ-ACC-002",
    featured: true,
    badge: "Ceremonial"
  }
];

const initialServices = [
  {
    title: "Royal Rental Service",
    description: "Wear royalty for your wedding and return it gracefully. Our curated rental ensemble lets grooms, brides, and baraatis enjoy luxury wedding ensembles.",
    icon: "rental",
    order: 1,
    isActive: true,
    features: [
      "Premium dry-cleaned garments",
      "Hassle-free security deposit refund",
      "Multi-day wedding event reservations",
      "Complete accessory matching"
    ]
  },
  {
    title: "Personalized Royal Fitting",
    description: "Every patron is unique. Our Udaipur master tailors take your measurements to craft a look uniquely suited to your posture and style.",
    icon: "fitting",
    order: 2,
    isActive: true,
    features: [
      "Showroom fitting sessions in Udaipur",
      "Measurement archive for future orders",
      "Custom sleeves, collar & waist adjustments",
      "Expert turban and drapery styling"
    ]
  },
  {
    title: "Complete Wedding Ensemble",
    description: "From the Dulha's sherwani and Rajputi saafa to the Dulhan's poshak and baraati packages, coordinate your family in royal Mewar splendor.",
    icon: "ensemble",
    order: 3,
    isActive: true,
    features: [
      "Baraati bulk packages (up to 50+ safas)",
      "Theme-coordinated bride & groom sets",
      "Showroom private viewing appointments",
      "Pan-India dispatch & showroom pickup"
    ]
  }
];

const initialTestimonials = [
  {
    name: "Vikram Singh Ranawat",
    location: "Udaipur, Rajasthan",
    occasion: "Royal Groom - Dec 2025",
    rating: 5,
    text: "Ranaji made me feel like a true Maharaja on my wedding day. The sherwani fit was impeccable and the staff in the Udaipur showroom was exceptionally helpful. The gold zari craftsmanship was praised by all our guests.",
    avatar: "VS",
    isActive: true
  },
  {
    name: "Amit Rathore",
    location: "Jaipur, Rajasthan",
    occasion: "Baraati Group Package",
    rating: 5,
    text: "Rented 35 coordinated safas and Jodhpuri suits for our baraat. The quality was outstanding, the fittings were sharp, and the rental return was seamless. The best wedding showroom in Udaipur!",
    avatar: "AR",
    isActive: true
  },
  {
    name: "Suresh Menaria",
    location: "Mumbai, Maharashtra",
    occasion: "Groom Wedding Ensemble",
    rating: 5,
    text: "The ceremonial saafa styling and custom achkan fitting alone were worth traveling to Udaipur for. They understand authentic Mewari tradition inside out.",
    avatar: "SM",
    isActive: true
  },
  {
    name: "Priya Deora",
    location: "Udaipur, Rajasthan",
    occasion: "Bridal Poshak Collection",
    rating: 5,
    text: "Exquisite bridal poshak with genuine gota patti work. The team helped us coordinate our entire family's wedding attire effortlessly. Highly recommended!",
    avatar: "PD",
    isActive: true
  }
];

const initialGallery = [
  {
    src: "/images/468620690_18338704426195142_1504528542693550564_n.jpg",
    category: "groom",
    title: "Royal Sherwani with Pearl Mala & Saafa",
    aspectRatio: "portrait",
    isActive: true
  },
  {
    src: "/images/469045680_18338704624195142_6868154674655748113_n.jpg",
    category: "groom",
    title: "Heritage Jodhpuri Collection",
    aspectRatio: "landscape",
    isActive: true
  },
  {
    src: "/images/3b4167748d5c5593bc91a962e27b38fb.jpg",
    category: "bride",
    title: "Rajasthani Bridal Emerald Green Poshak",
    aspectRatio: "portrait",
    isActive: true
  },
  {
    src: "/images/57914fa103583fa779bdba247cf59540.jpg",
    category: "bride",
    title: "Crimson Red Bridal Zari Poshak",
    aspectRatio: "portrait",
    isActive: true
  },
  {
    src: "/images/587771552_18385644520195142_1280633816568335167_n.jpg",
    category: "accessories",
    title: "Traditional Rajputi Ceremonial Saafa",
    aspectRatio: "portrait",
    isActive: true
  },
  {
    src: "/images/48d3eda980b76a67c385413034b01b0c.jpg",
    category: "bride",
    title: "Royal Sapphire Designer Anarkali",
    aspectRatio: "portrait",
    isActive: true
  },
  {
    src: "/images/OIP.webp",
    category: "groom",
    title: "Ivory & Gold Groom Achkan",
    aspectRatio: "portrait",
    isActive: true
  },
  {
    src: "/images/City-Palace-Udaipur.jpg",
    category: "group",
    title: "Udaipur Royal Wedding Backdrop",
    aspectRatio: "landscape",
    isActive: true
  }
];

const initialCustomers = [
  {
    name: "Kunwar Raghuveer Singh",
    phone: "9829012345",
    email: "raghuveer@example.com",
    city: "Udaipur",
    address: "Saheli Nagar, Udaipur – 313001",
    totalSpent: 42000,
    ordersCount: 2,
    balance: 0,
    measurements: {
      chest: "42",
      shoulder: "18.5",
      sleeveLength: "25",
      waist: "36",
      height: "5ft 11in",
      notes: "Prefers relaxed fit under arms"
    },
    notes: "VIP Patron for Royal Wedding ensembles"
  },
  {
    name: "Dr. Arvind Chundawat",
    phone: "9414056789",
    email: "arvind.chundawat@example.com",
    city: "Jaipur",
    address: "C-Scheme, Jaipur",
    totalSpent: 18500,
    ordersCount: 1,
    balance: 0,
    measurements: {
      chest: "40",
      shoulder: "17.5",
      sleeveLength: "24",
      waist: "34",
      height: "5ft 9in",
      notes: "Fitted Jodhpuri silhouette"
    },
    notes: "Baraat package coordinator"
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log("🌱 Checking MongoDB Atlas database collections...");

    // 1. Seed Categories if empty
    const catCount = await Category.countDocuments();
    let categoryMap = {};
    if (catCount === 0) {
      console.log("📦 Seeding initial categories into MongoDB Atlas...");
      for (const cat of initialCategories) {
        const created = await Category.create(cat);
        categoryMap[cat.slug] = created._id;
      }
      console.log(`✅ Seeded ${initialCategories.length} categories.`);
    } else {
      console.log(`ℹ️ Categories already populated (${catCount} existing). Preserving data.`);
      const cats = await Category.find();
      cats.forEach((c) => {
        categoryMap[c.slug] = c._id;
      });
    }

    // 2. Seed Products if empty
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      console.log("👗 Seeding initial royal products into MongoDB Atlas...");
      for (const p of initialProducts) {
        const categoryId = categoryMap[p.categorySlug] || (await Category.findOne({ slug: p.categorySlug }))?._id;
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        await Product.create({
          name: p.name,
          slug,
          description: p.description,
          category: categoryId,
          subcategory: p.subcategory,
          price: {
            purchasePrice: p.price,
            rentPrice: p.rentPrice
          },
          priceType: p.priceType,
          images: [{ url: p.image, publicId: "" }],
          sizes: p.sizes,
          fabric: p.fabric,
          color: p.color,
          stock: p.stock,
          sku: p.sku,
          featured: p.featured,
          badge: p.badge,
          availableFor: p.available,
          status: "published"
        });
      }
      console.log(`✅ Seeded ${initialProducts.length} royal ensembles into MongoDB Atlas.`);
    } else {
      console.log(`ℹ️ Products already populated (${prodCount} existing). Preserving data.`);
    }

    // 3. Seed Services if empty
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log("🛎️ Seeding services into MongoDB Atlas...");
      await Service.insertMany(initialServices);
      console.log(`✅ Seeded ${initialServices.length} services.`);
    } else {
      console.log(`ℹ️ Services already populated (${serviceCount} existing). Preserving data.`);
    }

    // 4. Seed Testimonials if empty
    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      console.log("💬 Seeding testimonials into MongoDB Atlas...");
      await Testimonial.insertMany(initialTestimonials);
      console.log(`✅ Seeded ${initialTestimonials.length} testimonials.`);
    } else {
      console.log(`ℹ️ Testimonials already populated (${testCount} existing). Preserving data.`);
    }

    // 5. Seed Gallery if empty
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      console.log("🖼️ Seeding gallery images into MongoDB Atlas...");
      await Gallery.insertMany(initialGallery);
      console.log(`✅ Seeded ${initialGallery.length} gallery images.`);
    } else {
      console.log(`ℹ️ Gallery already populated (${galleryCount} existing). Preserving data.`);
    }

    // 6. Seed initial VIP showroom patrons if empty
    const custCount = await Customer.countDocuments();
    if (custCount === 0) {
      console.log("👥 Seeding initial showroom clients into MongoDB Atlas...");
      await Customer.insertMany(initialCustomers);
      console.log(`✅ Seeded ${initialCustomers.length} initial showroom clients.`);
    } else {
      console.log(`ℹ️ Customers already populated (${custCount} existing). Preserving data.`);
    }

    console.log("🎉 MongoDB Atlas database is verified and fully seeded with real application data!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
