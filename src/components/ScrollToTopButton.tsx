import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-gradient-to-l from-blue-600 to-blue-300 hover:from-blue-400 hover:to-blue-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 group"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6 group-hover:animate-bounce" />
    </button>
  );
};

export default ScrollToTopButton;
