import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  // Wallet removed for INR-only mode

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Experience Decentralized Ticketing?
            </h2>
            <p className="text-white/90 text-lg max-w-lg">
              Join thousands of event-goers who are already enjoying secure, transparent, and hassle-free ticket purchases.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/events" 
                className={`inline-flex items-center justify-center px-6 py-3 border border-white text-white bg-transparent hover:bg-white/10 text-base font-medium rounded-lg transition-colors`}
              >
                Browse Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 md:pl-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-success-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">50+ Events Available</h3>
                  <p className="text-white/80">Browse our diverse catalog of events</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-success-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">5,000+ Users</h3>
                  <p className="text-white/80">Join our growing community</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-success-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Secure & Transparent</h3>
                  <p className="text-white/80">Safe INR payments with clear records</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;