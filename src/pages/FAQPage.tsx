import React from 'react';

const FAQPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-xl font-semibold mb-2">What is BlockTix?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            BlockTix is a blockchain-powered ticketing platform that helps you buy and manage event tickets securely.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Do I need a crypto wallet?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You can connect a wallet for advanced features. For basic purchases, email-based checkout is supported in this build.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Can I resell or transfer tickets?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Yes, if the organizer enables it. Rules like maximum resale price and transfer permissions are enforced per event.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Is my data secure?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We follow best practices and only store necessary information. See our Privacy Policy for details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
