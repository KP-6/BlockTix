import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-6 text-gray-700 dark:text-gray-300 max-w-3xl">
        <p>
          By using BlockTix, you agree to the following terms. Please read them carefully.
        </p>
        <h2 className="text-xl font-semibold">Use of Service</h2>
        <p>
          You agree not to misuse the platform and to comply with applicable laws. Tickets may be subject to event-specific rules.
        </p>
        <h2 className="text-xl font-semibold">Purchases and Refunds</h2>
        <p>
          All purchases are subject to the event organizer's policies. Refunds, if any, are governed by event rules.
        </p>
        <h2 className="text-xl font-semibold">Liability</h2>
        <p>
          BlockTix provides the platform as-is and is not responsible for event changes or cancellations by organizers.
        </p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
