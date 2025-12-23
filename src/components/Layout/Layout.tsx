"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  Store,
  Users,
  ShoppingCart,
  Factory,
  Settings,
  Warehouse,
  CircleUser,
  Menu,
  X,
  Boxes,
  CircleQuestionMark,
  Tags,
  Wallet,
  AppWindowMac,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const router = useRouter();
  const { logout } = useAuth();
  
  useEffect(() => {
    if (!sidebarOpen) return;
    const unsubscribe = router.subscribe("onResolved", () => {
      setSidebarOpen(false);
    });
    return unsubscribe;
  }, [sidebarOpen, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    { name: "لوحة التحكم", href: "/", icon: BarChart3 },
    { name: "البانرات", href: "/Banners", icon: AppWindowMac },
    { name: "إدارة المنتجات", href: "/products", icon: Boxes },
    { name: "إداره السلع الرائجه", href: "/featured-products", icon: Tags },
    { name: "إدارة المتاجر", href: "/stores", icon: Store },
    { name: "نظام اداره العمولات", href: "/representatives", icon: Users },
    { name: "المستخدمين", href: "/Users", icon: CircleUser },
    { name: "إدارة الطلبات", href: "/orders", icon: ShoppingCart },
    { name: "طلبات المصنع", href: "/factory-orders", icon: Factory },
    { name: "اداره المصانع في المتجر", href: "/Factories", icon: Warehouse },
    { name: "الحملات والعروض", href: "/CashBack", icon: Wallet },
    { name: " الأسئله الشائعه ", href: "/FAQ", icon: CircleQuestionMark },
    { name: "الإعدادات", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden  ${sidebarOpen ? "block" : "hidden"}`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl overflow-y-auto scroll-smooth">
          <div className="flex h-16 items-center justify-between px-4">
            
            <img
              className="h-12 w-auto"
              src="/tajer-logo.svg"
              alt="Tajer Logo"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive
                      ? "bg-[hsl(var(--primary-10))] text-[hsl(var(--primary))]"
                      : "text-gray-600 hover:bg-[hsl(var(--secondary-10))] hover:text-[hsl(var(--secondary))]"
                  }`}
                >
                  <item.icon className="ml-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
            >
              <LogOut className="ml-3 h-6 w-6 flex-shrink-0" />
              تسجيل الخروج
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-4 py-4 shadow-lg">
          {/* Header with logo and toggle button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className={`flex items-center gap-x-3 transition-all duration-300 ${
              isCollapsed ? 'w-full justify-center' : ''
            }`}>
              {!isCollapsed && (
 <img
                className="h-12 w-auto transition-all duration-300"
                src="/tajer-logo.svg"
                alt="Tajer Logo"
              />
              )}
             
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                  title="طي القائمة"
                >
                  <ChevronRight className="h-5 w-5 transition-transform duration-300" />
                </button>
              )}
            </div>
            
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                title="فتح القائمة"
              >
                <ChevronLeft className="h-5 w-5 transition-transform duration-300" />
              </button>
            )}
          </div>

          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex items-center rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-150 ${
                            isActive
                              ? "bg-[hsl(var(--primary-10))] text-[hsl(var(--primary))]"
                              : "text-gray-700 hover:bg-[hsl(var(--secondary-10))] hover:text-[hsl(var(--secondary))]"
                          } ${isCollapsed ? 'justify-center' : 'gap-x-3'}`}
                          title={isCollapsed ? item.name : ''}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {!isCollapsed && (
                            <span className="transition-opacity duration-200">
                              {item.name}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      onClick={handleLogout}
                      className={`group flex items-center rounded-md p-2 text-sm leading-6 font-semibold text-red-600 hover:bg-red-50 w-full transition-colors duration-150 cursor-pointer ${
                        isCollapsed ? 'justify-center' : 'gap-x-3'
                      }`}
                      title={isCollapsed ? 'تسجيل الخروج' : ''}
                    >
                      <LogOut className="h-6 w-6 shrink-0" />
                      {!isCollapsed && (
                        <span className="transition-opacity duration-200">تسجيل الخروج</span>
                      )}
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:pr-20' : 'lg:pr-72'
      }`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-gray-500 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Toggle button for desktop when sidebar is collapsed */}
    
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;