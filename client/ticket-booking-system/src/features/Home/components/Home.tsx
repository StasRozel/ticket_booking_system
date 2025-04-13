import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AppPromo from '../components/AppPromo';
import '../styles/css/Home.css';
import Footer from './Footer';
import Schedule from './Schedule';

const Home: React.FC = () => {
  return (
    <div className="home">
      <Header />
      <Hero />
      <Schedule />
      <AppPromo />
      <Footer />
    </div>
  );
};

export default Home;

