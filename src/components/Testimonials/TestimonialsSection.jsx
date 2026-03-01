import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import SectionHeading from '../UI/SectionHeading';
import { testimonials } from '../../data/testimonials';

import 'swiper/css';
import 'swiper/css/pagination';

const TestimonialsSection = () => {
  const swiperRef = useRef(null);

  return (
    <section className="relative py-24 md:py-32" style={{ backgroundColor: '#1E140A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="What Our Clients Say"
          title="Royal Words"
        />

        {/* Testimonials Carousel */}
        <div className="mt-16">
          <Swiper
            ref={swiperRef}
            modules={[Pagination, Autoplay]}
            spaceBetween={32}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, pauseOnMouseEnter: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
            }}
            className="!pb-14"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative h-full"
                >
                  <div className="relative bg-night/30 backdrop-blur-sm p-8 h-full border border-gold/20">
                    {/* Quote Icon */}
                    <Quote 
                      className="absolute top-6 right-6 text-gold/30" 
                      size={48} 
                    />

                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          className="fill-gold text-gold" 
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <blockquote className="font-serif text-lg text-cream/90 italic leading-relaxed mb-8">
                      &ldquo;{testimonial.text}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gold-gradient flex items-center justify-center text-night font-display font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-body font-medium text-cream">
                          {testimonial.name}
                        </p>
                        <p className="font-body text-sm text-cream/60">
                          {testimonial.occasion}
                        </p>
                        <p className="font-body text-xs text-gold mt-0.5">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>

                    {/* Decorative Bottom Border */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <div className="w-12 h-px bg-gold/30" />
                      <div className="w-2 h-2 rotate-45 bg-gold/50" />
                      <div className="w-12 h-px bg-gold/30" />
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          <div className="text-center">
            <p className="font-serif text-4xl text-gold font-light">4.5</p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < 4 ? "fill-gold text-gold" : "fill-gold/50 text-gold/50"} 
                />
              ))}
            </div>
            <p className="font-body text-xs text-cream/60 mt-1">Google Rating</p>
          </div>
          <div className="h-12 w-px bg-gold/20 hidden md:block" />
          <div className="text-center">
            <p className="font-serif text-4xl text-gold font-light">500+</p>
            <p className="font-body text-xs text-cream/60 mt-1">Happy Customers</p>
          </div>
          <div className="h-12 w-px bg-gold/20 hidden md:block" />
          <div className="text-center">
            <p className="font-serif text-4xl text-gold font-light">8+</p>
            <p className="font-body text-xs text-cream/60 mt-1">Years Experience</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
