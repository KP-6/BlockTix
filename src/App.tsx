import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import ErrorBoundary from './components/common/ErrorBoundary';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminKeyGate from './components/admin/AdminKeyGate';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEvents from './pages/admin/Events';
import AdminRules from './pages/admin/Rules';
import AdminAccess from './pages/admin/Access';
import AdminTransactions from './pages/admin/Transactions';
import CategoryAnalytics from './pages/admin/CategoryAnalytics';
import OrdersPage from './pages/OrdersPage';
import OrderReceiptPage from './pages/OrderReceiptPage';
import VerifyTicketPage from './pages/VerifyTicketPage';
import TicketDisplayPage from './pages/TicketDisplayPage';
import UserDashboard from './pages/UserDashboard';
import PaymentCheckout from './pages/PaymentCheckout';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <Router>
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:orderId" element={<OrderReceiptPage />} />
                  <Route path="/verify-ticket/:orderId" element={<VerifyTicketPage />} />
                  <Route path="/ticket" element={<TicketDisplayPage />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/payment-checkout" element={<PaymentCheckout />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminKeyGate>
                        <AdminLayout />
                      </AdminKeyGate>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="rules" element={<AdminRules />} />
                    <Route path="access" element={<AdminAccess />} />
                    <Route path="tx" element={<AdminTransactions />} />
                    <Route path="analytics-categories" element={<CategoryAnalytics />} />
                  </Route>
                </Routes>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </Router>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;