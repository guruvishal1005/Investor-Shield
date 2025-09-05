import { useState } from "react";
import { Shield, UserCheck, Smartphone, MessageSquare, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth";
import { useLocation } from "wouter";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = authService.getAuthState();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    authService.clearAuthState();
    setLocation("/");
  };

  const navItems = [
    { id: "verify-advisor", label: "Verify Advisor", icon: UserCheck },
    { id: "app-detector", label: "App Detector", icon: Smartphone },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ];

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-blue-600">Investor Shield</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                        activeTab === item.id
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      data-testid={`nav-${item.id}`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              data-testid="button-theme-toggle"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium" data-testid="text-user-name">
                  {user?.name}
                </span>
                <span className="text-xs text-slate-500" data-testid="text-user-email">
                  {user?.email}
                </span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`block px-3 py-2 text-base font-medium w-full text-left rounded-md transition-colors ${
                  activeTab === item.id
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
                data-testid={`nav-mobile-${item.id}`}
              >
                <IconComponent className="w-4 h-4 mr-2 inline" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
