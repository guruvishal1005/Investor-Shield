import { useState } from "react";
import Navbar from "@/components/navbar";
import AdvisorVerification from "@/components/advisor-verification";
import AppDetector from "@/components/app-detector";
import ReviewsSection from "@/components/reviews-section";

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
      default:
        return <AdvisorVerification />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2" data-testid="heading-dashboard">
            Investment Protection Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300" data-testid="text-dashboard-description">
            Verify financial advisors, detect fake apps, and access community insights to protect your investments.
          </p>
        </div>

        {/* Content */}
        <div data-testid={`section-${activeTab}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
