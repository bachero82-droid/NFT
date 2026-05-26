import React, { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { setAuthToken } from "../lib/auth";
import { Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    loginMutation.mutate(
      { data: { email: loginEmail, password: loginPassword } },
      {
        onSuccess: (res) => {
          setAuthToken(res.token);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Ошибка входа",
            description: err?.data?.error || "Проверьте email и пароль",
          });
        },
      }
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) return;
    if (regUsername.length < 3) {
      toast({ variant: "destructive", title: "Никнейм слишком короткий", description: "Минимум 3 символа" });
      return;
    }
    if (regPassword.length < 6) {
      toast({ variant: "destructive", title: "Пароль слишком короткий", description: "Минимум 6 символов" });
      return;
    }
    registerMutation.mutate(
      { data: { username: regUsername, email: regEmail, password: regPassword } },
      {
        onSuccess: (res) => {
          setAuthToken(res.token);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Ошибка регистрации",
            description: err?.data?.error || "Что-то пошло не так",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left side brand banner */}
      <div className="lg:flex-1 bg-primary flex flex-col items-center justify-center p-8 lg:p-20 relative overflow-hidden border-b-8 lg:border-b-0 lg:border-r-8 border-black">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent rounded-full blur-[100px] mix-blend-overlay pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[100px] mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 w-full flex flex-col items-start max-w-xl">
          <div className="flex items-center gap-4 mb-6 bg-white px-6 py-3 rounded-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <Zap className="w-10 h-10 text-primary fill-primary" />
            <h1 className="text-5xl md:text-7xl font-black font-display tracking-tighter text-black">VΞX</h1>
          </div>
          <p className="text-white text-3xl md:text-5xl font-black uppercase leading-[1.1] mb-8 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            ЦИФРОВОЙ КОШЕЛЕК И NFT-ИГРЫ <br />
            <span className="text-accent inline-block mt-2 rotate-1">ДЛЯ НОВОГО ПОКОЛЕНИЯ</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="hype-badge bg-white rotate-3">NO DARK MODE</span>
            <span className="hype-badge bg-cyan-300 -rotate-3">NFT КАРТЫ</span>
            <span className="hype-badge bg-purple-300 rotate-2">КРАШ ИГРЫ</span>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="lg:w-[500px] xl:w-[600px] bg-white flex flex-col justify-center p-8 lg:p-16 relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzAwMCIvPgo8L3N2Zz4=')]" />
        
        <div className="hype-panel p-8 md:p-10 relative z-10 bg-gray-50">
          {/* Tabs */}
          <div className="flex gap-4 mb-10">
            <button
              type="button"
              className={`flex-1 py-4 text-sm font-black uppercase border-2 border-black rounded-xl transition-all ${isLogin ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,90,120,1)] -translate-y-1" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"}`}
              onClick={() => setIsLogin(true)}
            >
              ВХОД
            </button>
            <button
              type="button"
              className={`flex-1 py-4 text-sm font-black uppercase border-2 border-black rounded-xl transition-all ${!isLogin ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,90,120,1)] -translate-y-1" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"}`}
              onClick={() => setIsLogin(false)}
            >
              СОЗДАТЬ
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-black uppercase text-black mb-3">EMAIL</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="HYPE@MAIL.COM"
                  autoComplete="email"
                  className="w-full h-14 rounded-xl border-2 border-black px-4 font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase text-black mb-3">ПАРОЛЬ</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-14 rounded-xl border-2 border-black px-4 font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="hype-button w-full h-16 mt-4 text-lg"
              >
                {loginMutation.isPending ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : "ПОГНАЛИ 🔥"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-black uppercase text-black mb-3">НИКНЕЙМ</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="CYBER_NINJA"
                  autoComplete="username"
                  className="w-full h-14 rounded-xl border-2 border-black px-4 font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase text-black mb-3">EMAIL</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="HYPE@MAIL.COM"
                  autoComplete="email"
                  className="w-full h-14 rounded-xl border-2 border-black px-4 font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase text-black mb-3">ПАРОЛЬ</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full h-14 rounded-xl border-2 border-black px-4 font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="hype-button bg-accent text-black w-full h-16 mt-4 text-lg"
              >
                {registerMutation.isPending ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : "СОЗДАТЬ АККАУНТ ⚡"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
