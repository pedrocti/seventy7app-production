import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import BlogSection from '@/components/BlogSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import TradingVisuals from '@/components/TradingVisuals';
import MarketImpactVisual from '@/components/MarketImpactVisual';
import { Helmet } from 'react-helmet';
import FloatingQuickAccess from '@/components/FloatingQuickAccess';
import CoreOfferingsSection from "@/components/CoreOfferingsSection";

const Home = () => {
  
  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      fontFamily: 'Inter, sans-serif',
      color: 'white',
      backgroundColor: 'var(--bg)',
      overflowX: 'hidden'
    }}>
      <Helmet>
        <title>Seventy7 Kapital | Premium Trading & Financial Empowerment</title>
        <meta name="description" content="Access premium trading mentorship, funding support, and life-changing financial resources with Seventy7 Kapital." />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>
      
      <ParticleBackground />
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        
        <main>
          <HeroSection />
          <CoreOfferingsSection /> 
          <AboutSection />
          <TradingVisuals />
          <MarketImpactVisual />
          <BlogSection />
          <CTASection />
        </main>
        
        <Footer />
        <FloatingQuickAccess />

      </div>
    </div>
  );
};

export default Home;
