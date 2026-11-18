import { motion } from 'framer-motion';
import { 
  Crown, 
  Sparkles, 
  Award, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Heart,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';
import SectionHeading from '../components/UI/SectionHeading';
import OrnamentalDivider from '../components/UI/OrnamentalDivider';

const craftsmanshipPillars = [
  {
    title: 'Zardozi Gold Threadwork',
    subtitle: 'Centuries of Royal Karigari',
    desc: 'Metallic threads of antique gold and silver hand-sewn into royal motifs—peacocks, lotus medallions, and Mewari crests that catch the temple light.',
    icon: Sparkles
  },
  {
    title: 'The Art of the Mewari Saafa',
    subtitle: 'Symbol of Honor & Chivalry',
    desc: 'The turban is a crown in Rajasthan. Our master saafa folders hand-tie each pagri using pachrangi, kesariya, and pure silk chiffon with ancestral folds.',
    icon: Crown
  },
  {
    title: 'Gota Patti & Danka Craft',
    subtitle: 'Heirloom Rajputi Bridalwear',
    desc: 'Pure gold ribbons hammered and stitched with precision onto fine georgette and silk dupion to produce the iconic shimmer of a Maharani’s poshak.',
    icon: Award
  },
  {
    title: 'Noble Silks & Royal Velvets',
    subtitle: 'Hand-Selected Heirloom Weaves',
    desc: 'From rich Banarasi brocades to heavy silk velvets that drape with commanding weight, our textiles are sourced directly from India’s master weavers.',
    icon: ShieldCheck
  }
];

const timelineMilestones = [
  {
    year: '2016',
    title: 'The Foundation in Surajpole',
    desc: 'Ranaji was born in the historic wedding heart of Udaipur, with a singular mission to dress modern couples in authentic Mewari royal ensembles.'
  },
  {
    year: '2019',
    title: 'The Royal Rental Initiative',
    desc: 'Pioneered premium luxury wedding rentals in Udaipur, enabling patrons to wear museum-grade handcrafted royal garments without excessive expense.'
  },
  {
    year: '2022',
    title: 'The Bridal Poshak Atelier',
    desc: 'Expanded our bespoke division to craft traditional four-piece Rajputi poshaks and bridal couture with master Gota Patti artisans.'
  },
  {
    year: '2026',
    title: 'Digital Showroom & Global Patrons',
    desc: 'Now serving destination wedding clients from around the globe celebrating their nuptials across Udaipur’s heritage palace hotels.'
  }
];

const LegacyPage = () => {
  return (
    <div className="bg-night text-cream min-h-screen selection:bg-gold selection:text-night">
      <Navbar />

      <main className="pt-24 md:pt-32 pb-24">
        {/* Editorial Header */}
        <section className="relative py-12 md:py-20 border-b border-gold/15 bg-gradient-to-b from-night-light/40 via-night to-night">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-body text-cream/50 mb-6">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gold">Legacy</span>
            </div>

            <div className="max-w-3xl">
              <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Crown size={15} />
                <span>Est. 2016 · Udaipur, Rajasthan</span>
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-cream font-light leading-tight mb-6">
                A Heritage of <span className="text-gold font-normal">Royal Dressing</span>
              </h1>
              <p className="font-body text-cream/70 text-base md:text-lg leading-relaxed">
                In Mewar, dressing is not merely fashion—it is a sacred coronation. Discover the heritage, 
                craftsmanship, and enduring romance that define the House of Ranaji.
              </p>
            </div>
          </div>
        </section>

        {/* Narrative & Atelier Story */}
        <section className="py-20 bg-night border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <SectionHeading
                  subtitle="The Spirit of Mewar"
                  title="Where History Meets High Couture"
                  centered={false}
                  className="text-left"
                />

                <p className="font-body text-cream/80 text-base leading-relaxed">
                  Surajpole, named after the historic Sun Gate of Udaipur’s fortified city, has for centuries 
                  been the center of royal textile merchants. Here, surrounded by the lakes and marble courtyards 
                  of the Sisodia dynasty, Ranaji continues a centuries-old tradition.
                </p>

                <p className="font-body text-cream/70 text-sm leading-relaxed">
                  Every sherwani, achkan, and poshak created in our showroom honors the aesthetic proportions 
                  prescribed by Rajput court chronicles: broad shoulders, a sculpted waistline, the sweeping 
                  flare of the skirt, and the proud tilt of the saafa crowned with an antique feather kalgi.
                </p>

                <div className="p-6 rounded-2xl bg-cream/5 border border-gold/25 space-y-2">
                  <p className="font-serif text-gold text-lg italic">
                    &quot;Your wedding day is your coronation—and we are deeply honored to dress you for it.&quot;
                  </p>
                  <p className="font-body text-cream/60 text-xs tracking-wider uppercase">
                    — The Ranaji Royal Atelier, Udaipur
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-gold/40 shadow-2xl aspect-[4/3] bg-night-light">
                  <img
                    src="/images/gallery-2.jpg"
                    alt="Royal Heritage Craftsmanship"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="font-serif text-xs text-gold uppercase tracking-widest">Handcrafted in Udaipur</span>
                    <p className="font-serif text-xl text-cream font-medium">Centuries of Master Rajput Craftsmanship</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* The 4 Pillars of Craftsmanship */}
        <section className="py-20 bg-night-light/20 border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              subtitle="The Master Artisans"
              title="Four Pillars of Craftsmanship"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {craftsmanshipPillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 rounded-2xl bg-night border border-gold/25 flex flex-col justify-between shadow-xl hover:border-gold/60 transition-all duration-300"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-6">
                        <IconComponent size={22} />
                      </div>
                      <span className="text-[10px] font-body text-gold uppercase tracking-widest">{pillar.subtitle}</span>
                      <h3 className="font-serif text-xl text-cream font-medium mt-1 mb-3">{pillar.title}</h3>
                      <p className="font-body text-cream/60 text-xs leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline of the House */}
        <section className="py-20 bg-night border-b border-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              subtitle="Our Journey"
              title="The Ranaji Chronicle"
            />

            <div className="max-w-3xl mx-auto mt-14 space-y-8 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-gold/20">
              {timelineMilestones.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-night border-2 border-gold text-gold font-serif text-sm font-bold flex items-center justify-center shrink-0 z-10 shadow-lg">
                    {item.year}
                  </div>
                  <div className="flex-1 p-6 rounded-2xl bg-night-light/60 border border-gold/20">
                    <h4 className="font-serif text-xl text-cream font-medium mb-1">{item.title}</h4>
                    <p className="font-body text-cream/70 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Udaipur Connection Banner */}
        <section className="py-20 bg-gradient-to-t from-night-light/50 via-night to-night">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-gold/40 bg-night-light/80 p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xl space-y-6">
              <span className="font-serif text-xs text-gold uppercase tracking-widest flex items-center justify-center gap-2">
                <MapPin size={16} />
                <span>Surajpole · Udaipur · The City of Palaces</span>
              </span>

              <h3 className="font-serif text-3xl sm:text-4xl text-cream font-light">
                Experience the Heritage in Person
              </h3>

              <p className="font-body text-cream/70 text-sm max-w-2xl mx-auto leading-relaxed">
                Step into our showroom to touch our heritage fabrics, try our master-crafted sherwanis and poshaks, 
                and receive a personal royal styling consultation with our master designers.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="px-8 py-3.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold hover:bg-copper transition-all shadow-xl"
                >
                  Visit Showroom
                </Link>
                <Link
                  to="/collections"
                  className="px-8 py-3.5 rounded-xl bg-cream/10 hover:bg-cream/15 text-cream border border-gold/30 font-serif text-xs uppercase tracking-widest font-semibold transition-all"
                >
                  View Wardrobe
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LegacyPage;
