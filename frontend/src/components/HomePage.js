import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import SearchSection from './SearchSection';
import FeaturedCars from './FeaturedCars';
import AboutSection from './AboutSection';
import ProcessSection from './ProcessSection';
import Footer from './Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <HeroSection />
      <SearchSection />
      <FeaturedCars />
      <AboutSection />
      <ProcessSection />
      <Footer />
    </div>
  );
};

export default HomePage;