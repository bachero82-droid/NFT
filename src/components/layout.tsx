import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { removeAuthToken } from "../lib/auth";
import { Home, CreditCard, ShoppingCart, Gamepad2, History, User, LogOut, Loader2, Menu, X, Zap } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      retry: false,
    }
  });
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isError) {
      removeAuthToken();
      setLocation("/");
    }
  }, [isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        removeAuthToken();
        setLocation("/");
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "ТЕРМИНАЛ", icon: Home, color: "text-blue-600" },
    { href: "/cards", label: "КОЛЛЕКЦИЯ", icon: CreditCard, color: "text-purple-600" },
    { href: "/marketplace", label: "МАРКЕТ", icon: ShoppingCart, color: "text-yellow-500" },
    { href: "/games", label: "ИГРЫ", icon: Gamepad2, color: "text-emerald-500" },
    { href: "/transactions", label: "ИСТОРИЯ", icon: History, color: "text-rose-500" },
    { href: "/profile", label: "ПРОФИЛЬ", icon: User, color: "text-cyan-500" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b-4 border-black z-50 sticky top-0 shadow-md">
        <div className="font-display font-black text-3xl tracking-tighter text-black flex items-center gap-1">
          <Zap className="text-primary fill-primary" /> VΞX
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-black p-2 bg-accent rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu */}
      <div className={`
        fixed inset-0 md:static md:w-72 md:flex flex-col
        bg-white border-r-4 border-black z-40
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-8 hidden md:flex items-center gap-2 border-b-4 border-black bg-yellow-300">
          <Zap className="text-black fill-black w-8 h-8" />
          <div className="font-display font-black text-5xl tracking-tighter text-black">VΞX</div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-3 bg-white">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <div className={`
                  flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 border-black
                  ${isActive ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,90,120,1)] -translate-y-1" : "bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"}
                `}>
                  <Icon size={24} className={isActive ? "text-primary" : item.color} />
                  <span className="font-black tracking-wider text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t-4 border-black bg-blue-100 mt-auto">
          <div className="flex items-center gap-4 mb-6 bg-white p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 rounded-xl bg-purple-200 border-2 border-black flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-black" />
              )}
            </div>
            <div>
              <div className="font-black text-lg text-black truncate w-32">{user.username}</div>
              <div className="text-sm text-primary font-mono font-bold bg-white px-2 py-0.5 rounded border border-black inline-block mt-1">{user.balance.toFixed(2)} VEX</div>
            </div>
          </div>
          <Button 
            className="w-full h-12 bg-white text-black hover:bg-red-50 font-black tracking-widest border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:text-red-600 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            ВЫЙТИ
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10 h-[calc(100dvh-72px)] md:h-[100dvh]">
        <main className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-full">
          {children}
        </main>
      </div>
    </div>
  );
}