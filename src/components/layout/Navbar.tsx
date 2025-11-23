import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useAuth } from '../../contexts/AuthContext';
import { Wallet, Ticket, User, Menu, X } from 'lucide-react';
import WalletModal from '../wallet/WalletModal';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected, account, balance } = useWeb3();
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                BlockTix
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium hover:text-primary-600 transition-colors ${
                  location.pathname === '/' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/events" 
                className={`text-sm font-medium hover:text-primary-600 transition-colors ${
                  location.pathname === '/events' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                Events
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm font-medium hover:text-primary-600 transition-colors ${
                  location.pathname === '/contact' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isConnected ? (
                <button 
                  onClick={toggleWalletModal}
                  className="flex items-center px-3 py-2 text-sm rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="hidden xl:inline mr-1">{account?.substring(0, 6)}...{account?.substring(account.length - 4)}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary-100 rounded-full">{balance} MATIC</span>
                </button>
              ) : (
                <button 
                  onClick={toggleWalletModal}
                  className="flex items-center px-3 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </button>
              )}

              {currentUser ? (
                <div className="relative group">
                  <button className="flex items-center px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    <span className="max-w-[100px] truncate">{currentUser.displayName || currentUser.email}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-3 py-2 text-sm rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={toggleMenu}
              className="md:hidden flex items-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden ${
            isMenuOpen ? 'max-h-screen py-4 border-t border-gray-200 dark:border-gray-700' : 'max-h-0 overflow-hidden border-t-0'
          } transition-all duration-300 ease-in-out`}
        >
          <div className="container mx-auto px-4 sm:px-6 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-sm font-medium p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  location.pathname === '/' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/events" 
                className={`text-sm font-medium p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  location.pathname === '/events' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                Events
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm font-medium p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  location.pathname === '/contact' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                Contact
              </Link>
            </nav>

            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {isConnected ? (
                <button 
                  onClick={toggleWalletModal}
                  className="flex items-center justify-between p-3 text-sm rounded-lg bg-primary-50 text-primary-700"
                >
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    <span>{account?.substring(0, 6)}...{account?.substring(account.length - 4)}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-primary-100 rounded-full">{balance} MATIC</span>
                </button>
              ) : (
                <button 
                  onClick={toggleWalletModal}
                  className="flex items-center justify-center p-3 text-sm rounded-lg bg-primary-600 text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </button>
              )}

              {currentUser ? (
                <>
                  <div className="flex items-center p-3 text-sm rounded-lg bg-gray-100 dark:bg-gray-800">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">{currentUser.displayName || currentUser.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-3 text-sm rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="p-3 text-center text-sm rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="p-3 text-center text-sm rounded-lg bg-accent-600 text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20"></div>

      {/* Wallet Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={toggleWalletModal} />
    </>
  );
};

export default Navbar;