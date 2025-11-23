import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-gray-700 dark:text-gray-300 max-w-3xl">
        <p>
          We value your privacy. This Privacy Policy explains what data we collect, why we collect it, and how we handle it.
        </p>
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Basic account info such as name and email when you sign up or purchase.</li>
          <li>Event and order information related to your purchases and transfers.</li>
        </ul>
        <h2 className="text-xl font-semibold">How We Use Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To provide and improve the BlockTix service.</li>
          <li>To communicate transactional information such as order receipts.</li>
        </ul>
        <h2 className="text-xl font-semibold">Data Security</h2>
        <p>
          We implement security best practices and limit access to personal data. Contact us with any concerns.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
