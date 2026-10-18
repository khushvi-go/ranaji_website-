import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Crown, Sparkles, Check, Info } from 'lucide-react';

const sherwaniSizes = [
  { size: '38 (M)', chest: '38" – 40"', shoulder: '17.5"', length: '42"', waist: '32" – 34"' },
  { size: '40 (L)', chest: '40" – 42"', shoulder: '18.5"', length: '43"', waist: '34" – 36"' },
  { size: '42 (XL)', chest: '42" – 44"', shoulder: '19.5"', length: '44"', waist: '36" – 38"' },
  { size: '44 (XXL)', chest: '44" – 46"', shoulder: '20.5"', length: '45"', waist: '38" – 40"' },
];

const poshakSizes = [
  { part: 'Kurti-Kanchali', fit: 'Tailored fit according to bust (32" – 44")', notes: 'Adjustable inner ties for regal posture' },
  { part: 'Ghagra / Lehenga', fit: 'Flared royal circumference (40" – 43" length)', notes: 'Drawstring fastening with heavy latkan' },
  { part: 'Odhna', fit: 'Standard 2.5 meters length with Kiran gota', notes: 'Traditional Mewari draping' },
];

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-night/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-night-light border border-gold/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-night">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Ruler size={20} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-cream font-medium flex items-center gap-2">
                  Royal Sizing & Fitting Guide
                  <Crown size={16} className="text-gold" />
                </h3>
                <p className="text-xs text-cream/50 font-body">
                  Ranaji Udaipur Tailoring Standards (Inches)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-cream/50 hover:text-gold transition-colors p-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
            {/* Groom Sherwani / Bandhgala Chart */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gold text-xs font-body uppercase tracking-wider font-semibold">
                <Sparkles size={14} />
                Groom Ensembles (Sherwani, Jodhpuri, Achkan)
              </div>
              <div className="overflow-x-auto rounded-xl border border-gold/20 bg-night">
                <table className="w-full text-left text-xs font-body">
                  <thead className="bg-night-light border-b border-gold/15 text-gold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Standard Size</th>
                      <th className="py-3 px-4">Chest</th>
                      <th className="py-3 px-4">Shoulder</th>
                      <th className="py-3 px-4">Length</th>
                      <th className="py-3 px-4">Waist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10 text-cream/80">
                    {sherwaniSizes.map((row) => (
                      <tr key={row.size} className="hover:bg-gold/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-cream">{row.size}</td>
                        <td className="py-3 px-4">{row.chest}</td>
                        <td className="py-3 px-4">{row.shoulder}</td>
                        <td className="py-3 px-4">{row.length}</td>
                        <td className="py-3 px-4">{row.waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bridal Poshak Chart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-gold text-xs font-body uppercase tracking-wider font-semibold">
                <Crown size={14} />
                Bridal & Rajputi Poshak Dimensions
              </div>
              <div className="space-y-2">
                {poshakSizes.map((row) => (
                  <div key={row.part} className="p-3.5 rounded-xl bg-night border border-gold/15 text-xs font-body flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-serif text-cream font-medium block text-sm">{row.part}</span>
                      <span className="text-cream/60">{row.fit}</span>
                    </div>
                    <span className="text-gold/80 italic text-[11px]">{row.notes}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Person Udaipur Showroom Trial Note */}
            <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 flex items-start gap-3 text-xs text-cream/80">
              <Info size={18} className="text-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-gold block mb-0.5">Complimentary In-Store Tailoring</strong>
                All rental and purchased garments include a free personal fitting session at our showroom (Near Suzuki Bike Showroom, Surajpole, Udaipur). Our master tailors make custom waist, sleeve, and shoulder adjustments within 24 hours.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 bg-night border-t border-gold/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gold text-night font-body text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-copper transition-all shadow"
            >
              Understood
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SizeGuideModal;
