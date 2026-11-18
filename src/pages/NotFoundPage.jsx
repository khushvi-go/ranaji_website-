import { Crown, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import Footer from '../components/Footer/Footer';

const NotFoundPage = () => {
  return (
    <div className="bg-night text-cream min-h-screen selection:bg-gold selection:text-night flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center space-y-8 rounded-3xl border border-gold/30 bg-night-light/60 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          {/* Subtle gold glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold shadow-lg">
            <Crown size={36} />
          </div>

          <div className="space-y-3">
            <p className="font-serif text-6xl sm:text-7xl text-gold font-light tracking-wider">
              404
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-cream font-medium">
              The Royal Path is Hidden
            </h1>
            <p className="font-body text-cream/60 text-sm max-w-md mx-auto leading-relaxed">
              The page or palace corridor you are seeking does not exist or has been moved to another quarter of the showroom.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gold text-night font-serif text-xs uppercase tracking-widest font-bold hover:bg-copper transition-all shadow-xl"
            >
              <ArrowLeft size={16} />
              <span>Return to Home</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cream/10 hover:bg-cream/15 text-cream border border-gold/30 font-serif text-xs uppercase tracking-widest font-semibold transition-all"
            >
              <ShoppingBag size={16} className="text-gold" />
              <span>Browse Royal Shop</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
