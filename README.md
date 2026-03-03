# Ranaji - Royal Wedding Showroom Website

🌐 **Live Website:** https://ranaji.store

An exclusive royal wedding showroom website for Ranaji, featuring premium sherwanis, poshaks, turbans, and complete wedding ensembles for sale and rent in Udaipur, Rajasthan.

---

## 📋 Project Overview

**Client:** Ranaji - An Exclusive Royal Wedding Showroom  
**Location:** Udaipur, Rajasthan, India  
**Website Type:** Business / E-commerce Showcase  
**Developed By:** Abhiraj Singh Bhati,Khushveer Singh Goud.  
**Completion Date:** ~~On process~~

---

## ✨ Features Implemented

### 🎨 Design & UI
- **Royal Theme:** Dark luxury aesthetic with gold accents
- **Animated Hero Section:** Gold particle effects with Jali background pattern
- **Flip Card Effects:** Interactive service cards with 3D flip animation
- **Smooth Scroll:** Lenis smooth scrolling throughout the site
- **Responsive Design:** Mobile-first, works on all devices
- **Preloader:** Animated logo preloader with mandala design

### 🛍️ Product Showcase
- **13 Product Collections:**
  - 5 Groom items (Sherwani, Jodhpuri, Band Gala, Achkan)
  - 4 Bride items (Rajasthani Poshak, Bridal Poshak, Anarkali)
  - 4 Accessories (Saafa/Paag, Talwar, Rajputi Flag, Handicrafts)
- **Category Filtering:** All, Groom, Bride, Accessories
- **Hover Effects:** Elegant animations on product cards

### 📞 Contact & Booking
- **WhatsApp Integration:** Contact form sends messages directly to WhatsApp
- **Google Maps:** Location integration with exact store location
- **Social Media Links:** Instagram, Facebook, WhatsApp buttons

### 🔍 SEO Optimization
- **Meta Tags:** Complete SEO setup (title, description, keywords)
- **Open Graph:** Facebook/Twitter sharing optimization
- **Local SEO:** Geo tags for Udaipur, Rajasthan
- **Sitemap:** XML sitemap submitted to Google
- **Robots.txt:** Search engine crawling configuration

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | Frontend framework |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 3** | Styling & responsive design |
| **Framer Motion** | Animations & transitions |
| **GSAP** | Advanced scroll animations |
| **Lucide React** | Icons |
| **Swiper** | Image sliders |

---

## 📁 Project Structure

```
Ranaji_website-/
├── public/
│   ├── images/          # Product & gallery images
│   ├── sitemap.xml      # SEO sitemap
│   └── robots.txt       # Search engine config
├── src/
│   ├── components/      # React components
│   │   ├── About/
│   │   ├── Collections/
│   │   ├── Contact/
│   │   ├── Cultural/
│   │   ├── Footer/
│   │   ├── Gallery/
│   │   ├── Hero/
│   │   ├── Navigation/
│   │   ├── Preloader/
│   │   ├── Services/
│   │   ├── Testimonials/
│   │   └── UI/
│   ├── data/            # Product data
│   ├── hooks/           # Custom React hooks
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── index.html           # HTML template with SEO
├── package.json         # Dependencies
└── README.md            # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd Ranaji_website-
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

---

## 📱 Website Sections

| Section | Description |
|---------|-------------|
| **Hero** | Animated landing with gold particles |
| **Collections** | Product showcase with filtering |
| **Services** | Flip cards for Rental, Fitting, Ensemble |
| **About** | Legacy section with Ranaji story |
| **Gallery** | Image gallery with categories |
| **Testimonials** | Customer reviews |
| **Contact** | Form with WhatsApp integration |
| **Footer** | Links, contact info, social media |

---

## 📞 Contact Information

**Business Name:** Ranaji - An Exclusive Royal Wedding Showroom  
**Address:** 24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001  
**Phone:** +91 98765 43210  
**Email:** info@ranajiudaipur.com  
**Website:** https://ranaji.store

**Social Media:**
- Instagram: https://www.instagram.com/ranaji_udaipur
- Facebook: https://www.facebook.com/share/18PhEG4c3J/

---

## 🔧 Maintenance & Updates

### How to Update Product Images
1. Add new images to `/public/images/` folder
2. Update image paths in `/src/data/collections.js`
3. Rebuild and redeploy

### How to Update Prices
1. Edit `/src/data/collections.js`
2. Find the product and update the `price` field
3. Rebuild and redeploy

### How to Add New Products
1. Add product image to `/public/images/`
2. Add new object to `collections` array in `/src/data/collections.js`
3. Follow the existing format:
```javascript
{
  id: [next-number],
  name: "Product Name",
  category: "groom/bride/accessories",
  price: "₹XX,XXX",
  priceType: "Starting Price",
  description: "Product description",
  image: "/images/filename.jpg",
  available: ["rent", "purchase"]
}
```

---

## 📈 SEO Status

✅ **Completed:**
- Google Search Console setup
- Sitemap submitted
- Indexing requested
- Meta tags optimized
- Local SEO (Udaipur) configured

⏳ **Expected Timeline:**
- 1-3 days: Site appears in Google search
- 1 week: Searchable for "ranaji udaipur"
- 2-4 weeks: Improved rankings

---

## 🆘 Support

For technical support or updates, contact:  
**[Your Name]**  
**Email:** [your-email]  
**Phone:** [your-phone]

**30 days free support** included for bug fixes and minor changes.

---

## 📄 License

This project is proprietary and developed exclusively for Ranaji. All rights reserved.

---

**Thank you for choosing my services! 🙏**
