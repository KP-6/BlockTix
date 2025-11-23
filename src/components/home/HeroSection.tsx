import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { Ticket, Wallet } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { isConnected, connectWallet } = useWeb3();

  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-accent-900/90 z-10"></div>
      
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg" 
          alt="Concert crowd" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in">
            Decentralized Ticketing on{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Polygon
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl animate-slide-up">
            Buy, sell, and trade event tickets securely using blockchain technology. 
            No intermediaries, no fraud, just seamless experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link 
              to="/events" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Ticket className="h-5 w-5 mr-2" />
              Browse Events
            </Link>
            
            {!isConnected && (
              <button 
                onClick={connectWallet}
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-white/10 transition-colors"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>
          
          <div className="mt-8 flex items-center space-x-4 text-white/80 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="ml-2 text-sm sm:text-base">Secure & Transparent</span>
            </div>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H17V15H11V7Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="ml-2 text-sm sm:text-base">Instant Delivery</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave shape divider */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;