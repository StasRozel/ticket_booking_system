import React from 'react';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import '../styles/css/MapPage.css';

interface StatusLoad {
  status: string;
  error?: string | null;
}


const StatusComponent: React.FC<StatusLoad> = ({status, error}) => {
        return (
            <>
                <Header />
                <section className="map-page">
                    <div className="container">
                        <div className={`map-${status}`}>{status === 'loading' ? 'Загрузка карты...' : error}</div>
                    </div>
                </section>
                <Footer />
            </>
        );
};

export default StatusComponent;
