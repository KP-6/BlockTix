import React from 'react';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">How BlockTix Works</h1>
      <div className="space-y-6 text-gray-700 dark:text-gray-300 max-w-3xl">
        <p>
          BlockTix leverages blockchain technology to make ticketing secure, transparent, and user-friendly. 
          Here’s a quick overview of the experience:
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Browse events on the platform and choose from available categories such as General, VIP, etc.
          </li>
          <li>
            Connect your wallet or use email-based checkout to reserve your tickets.
          </li>
          <li>
            Complete purchase securely. Your order is recorded and a receipt is generated.
          </li>
          <li>
            Tickets can be transferred or resold (if allowed by event rules) in a compliant way.
          </li>
        </ol>
        <p>
          Organizers can manage events, configure resale/transfer rules, and view analytics from the admin dashboard.
        </p>
      </div>
    </div>
  );
};

export default HowItWorksPage;
