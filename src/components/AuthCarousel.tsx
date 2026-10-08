import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface CarouselSlide {
  title: string;
  description: string;
  image: string;
}

export const AUTH_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    title: "Support The Power Of Education",
    description: "Your support provides students with essential tools for lifelong learning.",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200&q=80"
  },
  {
    title: "Strengthen Our Communities",
    description: "Help ensure every family has access to the support they deserve by creating long-lasting impact.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
  },
  {
    title: "Empower Our Youth To Lead",
    description: "Help youth build skills, advocate for themselves, and transform their communities.",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80"
  }
];

export default function AuthCarousel({ slides = AUTH_CAROUSEL_SLIDES }: { slides?: CarouselSlide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hidden lg:block w-1/2 h-full py-12 pl-0 pr-[40px]">
      <div className="relative h-full w-full rounded-[5px] overflow-hidden group bg-black">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <motion.div
            key={`text-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-serif font-bold mb-4 leading-tight tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button 
                key={i} 
                type="button"
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1 rounded-full transition-all duration-500 cursor-pointer",
                  currentSlide === i ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                )} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
