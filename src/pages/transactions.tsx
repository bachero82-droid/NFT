import React, { useState } from "react";
import { useGetTransactions, useTransfer, useGetMe, getGetTransactionsQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownRight, CreditCard, Gamepad2, ShoppingCart, Send, Loader2, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const { data: transactions, isLoading } = useGetTransactions();
  const { data: user } = useGetMe();
  const transferMutation = useTransfer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [transferOpen, setTransferOpen] = useState(false);
  const [toUsername, setToUsername] = useState("");
  const [amount, setAmount] = useState("");

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'game_win': return <ArrowUpRight className="text-emerald-600" />;
      case 'game_loss': return <ArrowDownRight className="text-rose-600" />;
      case 'transfer': return <Send className="text-blue-600" />;
      case 'card_sale': return <ShoppingCart className="text-purple-600" />;
      case 'card_purchase': return <CreditCard className="text-amber-600" />;
      default: return <Zap className="text-black" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'game_win': return "ВЫИГРЫШ";
      case 'game_loss': return "ПРОИГРЫШ";
      case 'transfer': return "ПЕРЕВОД";
      case 'card_sale': return "ПРОДАЖА NFT";
      case 'card_purchase': return "ПОКУПКА NFT";
      case 'initial_balance': return "НАЧАЛЬНЫЙ БАЛАНС";
      default: return type.toUpperCase();
    }
  };

  const handleTransfer = () => {
    if (!toUsername || !amount) return;

    transferMutation.mutate({
      data: { toUsername, amount: parseFloat(amount) }
    }, {
      onSuccess: () => {
        toast({ title: "Успех", description: "Средства успешно отправлены" });
        setTransferOpen(false);
        setToUsername("");
        setAmount("");
        queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Ошибка", description: err.message });
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(0,220,160,0.5)]">ИСТОРИЯ</h1>
          <p className="text-xl font-bold uppercase mt-2 bg-blue-300 inline-block px-3 py-1 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            ТРАНЗАКЦИИ И ПЕРЕВОДЫ
          </p>
        </div>
        <button 
          onClick={() => setTransferOpen(true)}
          className="hype-button flex items-center gap-2 px-8 py-4 text-lg bg-blue-500"
        >
          <Send size={24} /> СДЕЛАТЬ ПЕРЕВОД
        </button>
      </header>

      <div className="hype-panel bg-white p-6 md:p-10 border-4 border-black">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary h-16 w-16" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-black flex items-center justify-center mb-6">
              <History size={48} className="text-gray-400" />
            </div>
            <h2 className="text-3xl font-black uppercase text-black">ИСТОРИЯ ПУСТА</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const isPositive = tx.receiverUsername === user?.username || tx.type === 'game_win' || tx.type === 'card_sale' || tx.type === 'initial_balance';
              
              let desc = tx.description || "";
              if (tx.type === 'transfer') {
                if (tx.senderUsername === user?.username) desc = `КОМУ: ${tx.receiverUsername}`;
                else desc = `ОТ: ${tx.senderUsername}`;
              }

              return (
                <div key={tx.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-4 border-black rounded-2xl bg-gray-50 hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-black text-lg uppercase leading-none mb-2">{getTransactionLabel(tx.type)}</div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-sm bg-white px-2 py-0.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {new Date(tx.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {desc && <span className="font-bold text-sm text-gray-500 uppercase">{desc}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono font-black text-2xl self-end md:self-auto px-4 py-2 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1 ${isPositive ? 'bg-emerald-300 text-black' : 'bg-rose-300 text-black'}`}>
                    {isPositive ? '+' : '-'}{tx.amount.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] sm:max-w-md p-0 overflow-hidden">
          <div className="bg-blue-500 text-white p-6 border-b-4 border-black">
            <DialogTitle className="font-display font-black text-3xl tracking-tight uppercase">ПЕРЕВОД СРЕДСТВ</DialogTitle>
          </div>
          
          <div className="p-8 bg-gray-50 space-y-6">
            <div className="space-y-3">
              <label className="text-sm text-black font-black uppercase">ПОЛУЧАТЕЛЬ (НИКНЕЙМ)</label>
              <input 
                type="text"
                value={toUsername}
                onChange={e => setToUsername(e.target.value)}
                className="w-full bg-white border-4 border-black h-14 font-black uppercase text-lg px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
                placeholder="CYBER_NINJA"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm text-black font-black uppercase">СУММА (VEX)</label>
                <span className="text-xs font-bold text-gray-500 uppercase bg-gray-200 px-2 py-1 rounded border-2 border-gray-300">ДОСТУПНО: {user?.balance.toFixed(2)}</span>
              </div>
              <input 
                type="number" 
                min="0.1" 
                step="0.1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-white border-4 border-black h-16 font-mono font-black text-2xl px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]"
                placeholder="100.00"
              />
            </div>
            
            <button 
              className="hype-button w-full h-16 text-xl mt-4 bg-blue-500 text-white"
              onClick={handleTransfer}
              disabled={!toUsername || !amount || transferMutation.isPending}
            >
              {transferMutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : "ОТПРАВИТЬ VEX 💸"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
