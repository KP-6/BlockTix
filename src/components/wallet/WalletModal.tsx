import React from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { Wallet, AlertCircle, Check, ExternalLink } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { isConnected, isConnecting, account, balance, connectWallet, disconnectWallet, error } = useWeb3();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet Connection</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-success-600 mr-2" />
                  <span className="text-sm font-medium text-success-700">Connected</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{account}</p>
                    <a 
                      href={`https://polygonscan.com/address/${account}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{balance} MATIC</p>
                </div>
              </div>

              <button
                onClick={disconnectWallet}
                className="w-full py-2.5 px-4 text-sm font-medium text-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your wallet to access decentralized features and purchase tickets securely using blockchain technology.
              </p>

              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full py-2.5 px-4 text-sm font-medium text-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect MetaMask
                  </div>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By connecting, you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;