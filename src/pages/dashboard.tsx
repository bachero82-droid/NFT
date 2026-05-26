import React from "react";
import { useGetMe, useGetTransactions, useGetMyCards } from "@workspace/api-client-react";
import { CardItem } from "@/components/ui/card-item";
import { ArrowUpRight, ArrowDownRight, CreditCard, Gamepad2, ShoppingCart, Send, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: cards } = useGetMyCards();
  const { data: transactions } = useGetTransactions();

  const primaryCard = cards?.find(c => c.isPrimary) || cards?.[0];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'game_win': return <ArrowUpRight className="text-emerald-500" />;
      case 'game_loss': return <ArrowDownRight className="text-rose-500" />;
      case 'transfer': return <Send className="text-blue-500" />;
      case 'card_sale': return <ShoppingCart className="text-purple-500" />;
      case 'card_purchase': return <CreditCard className="text-amber-500" />;
      default: return <Zap className="text-gray-900" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'game_win': return "ВЫИГРЫШ";
      case 'game_loss': return "ПРОИГРЫШ";
      case 'transfer': return "ПЕРЕВОД";
      case 'card_sale': return "ПРОДАЖА";
      case 'card_purchase': return "ПОКУПКА";
      case 'initial_balance': return "ПОПОЛНЕНИЕ";
      default: return "ОПЕРАЦИЯ";
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,90,120,0.5)]">ТЕРМИНАЛ</h1>
          <p className="text-xl font-bold uppercase mt-2 bg-accent inline-block px-3 py-1 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            С ВОЗВРАЩЕНИЕМ, {user?.username}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Balance & Card */}
          <section className="hype-panel p-6 md:p-10 relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-300 rounded-full blur-[80px] opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-[80px] opacity-20 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="flex-1 text-center md:text-left">
                <h2 className="hype-badge inline-block mb-6 rotate-[-3deg] bg-yellow-300">ОСНОВНОЙ БАЛАНС</h2>
                <div className="text-6xl md:text-7xl font-black font-mono text-black tracking-tighter mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  {user?.balance.toFixed(2)}
                </div>
                <div className="text-2xl font-black text-primary border-4 border-black px-4 py-2 inline-block rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white -rotate-2">
                  VEX COIN
                </div>
              </div>

              <div className="flex-1 w-full max-w-[320px]">
                {primaryCard ? (
                  <CardItem card={primaryCard} showDetails={false} />
                ) : (
                  <div className="aspect-[1.586/1] border-4 border-dashed border-black rounded-3xl flex flex-col items-center justify-center text-black bg-gray-50">
                    <CreditCard size={48} className="mb-4 text-gray-400" />
                    <p className="font-black uppercase tracking-widest text-sm mb-4">НЕТ АКТИВНОЙ КАРТЫ</p>
                    <Link href="/cards/create" className="hype-button px-6 py-3 text-sm">
                      СОЗДАТЬ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-3xl font-black font-display uppercase tracking-tight mb-6 flex items-center gap-3">
              <Zap className="text-primary fill-primary" /> ДЕЙСТВИЯ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Link href="/transactions">
                <div className="hype-panel bg-blue-100 p-6 flex flex-col items-center justify-center gap-4 group hover:bg-blue-200 cursor-pointer h-full">
                  <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                    <Send className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="text-sm font-black tracking-widest uppercase">ПЕРЕВОД</span>
                </div>
              </Link>
              <Link href="/cards">
                <div className="hype-panel bg-purple-100 p-6 flex flex-col items-center justify-center gap-4 group hover:bg-purple-200 cursor-pointer h-full">
                  <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                    <CreditCard className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="text-sm font-black tracking-widest uppercase">КАРТЫ</span>
                </div>
              </Link>
              <Link href="/marketplace">
                <div className="hype-panel bg-yellow-100 p-6 flex flex-col items-center justify-center gap-4 group hover:bg-yellow-200 cursor-pointer h-full">
                  <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                    <ShoppingCart className="w-8 h-8 text-amber-600" />
                  </div>
                  <span className="text-sm font-black tracking-widest uppercase">МАРКЕТ</span>
                </div>
              </Link>
              <Link href="/games">
                <div className="hype-panel bg-emerald-100 p-6 flex flex-col items-center justify-center gap-4 group hover:bg-emerald-200 cursor-pointer h-full">
                  <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                    <Gamepad2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <span className="text-sm font-black tracking-widest uppercase">ИГРЫ</span>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* Recent Transactions */}
        <div className="lg:h-full">
          <section className="hype-panel bg-white p-6 md:p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
              <h2 className="text-2xl font-black font-display uppercase tracking-tight">ИСТОРИЯ</h2>
              <Link href="/transactions" className="hype-badge bg-black text-white hover:bg-primary transition-colors cursor-pointer rotate-2">ВСЕ</Link>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {transactions?.slice(0, 7).map((tx) => {
                const isPositive = tx.receiverUsername === user?.username || tx.type === 'game_win' || tx.type === 'card_sale' || tx.type === 'initial_balance';
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-gray-50 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="font-black text-sm uppercase">{getTransactionLabel(tx.type)}</div>
                        <div className="text-xs text-gray-500 font-bold">
                          {new Date(tx.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className={`font-mono font-black text-lg px-2 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isPositive ? 'bg-green-300 text-black' : 'bg-red-300 text-black'}`}>
                      {isPositive ? '+' : '-'}{tx.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
              
              {(!transactions || transactions.length === 0) && (
                <div className="text-center text-gray-500 font-bold py-12 uppercase">
                  НЕТ ТРАНЗАКЦИЙ
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
