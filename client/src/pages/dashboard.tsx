import { useState } from "react";
import Navbar from "@/components/navbar";
import AdvisorVerification from "@/components/advisor-verification";
import AppDetector from "@/components/app-detector";
import ReviewsSection from "@/components/reviews-section";
import Profile from "@/pages/profile";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("verify-advisor");

  const renderContent = () => {
    switch (activeTab) {
      case "verify-advisor":
        return <AdvisorVerification />;
      case "app-detector":
        return <AppDetector />;
      case "reviews":
        return <ReviewsSection />;
      case "profile":
        return <Profile />;
      default:
        return <AdvisorVerification />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-12 text-center slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4" data-testid="heading-dashboard">
            Investment Protection Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto" data-testid="text-dashboard-description">
            Verify financial advisors, detect fake apps, and access community insights to protect your investments from fraud.
          </p>
        </div>

        {/* Content */}
        <div className="scale-in" data-testid={`section-${activeTab}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
