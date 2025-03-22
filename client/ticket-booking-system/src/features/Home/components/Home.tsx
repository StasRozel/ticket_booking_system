import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PopularDirections from '../components/PopularDirections';
import AppPromo from '../components/AppPromo';
import '../styles/css/Home.css';
import Footer from './Footer';

const Home: React.FC = () => {
  return (
    <div className="home">
      <Header />
      <Hero />
      <PopularDirections />
      <AppPromo />
      <Footer />
    </div>
  );
};

export default Home;