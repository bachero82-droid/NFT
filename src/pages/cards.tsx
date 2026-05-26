import React, { useState } from "react";
import { Link } from "wouter";
import { useGetMyCards, useSetPrimaryCard, useDeleteCard } from "@workspace/api-client-react";
import { CardItem } from "@/components/ui/card-item";
import { Button } from "@/components/ui/button";
import { Plus, Star, Trash2, Loader2, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getGetMyCardsQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function Cards() {
  const { data: cards, isLoading } = useGetMyCards();
  const setPrimaryMutation = useSetPrimaryCard();
  const deleteMutation = useDeleteCard();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleSetPrimary = (id: number) => {
    setPrimaryMutation.mutate({ data: { cardId: id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCardsQueryKey() });
        toast({ title: "Карта обновлена", description: "Основная карта успешно изменена" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCardsQueryKey() });
        setSelectedCard(null);
        toast({ title: "Карта удалена" });
      }
    });
  };

  const selectedCardData = cards?.find(c => c.id === selectedCard);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(0,220,160,0.5)]">КОЛЛЕКЦИЯ</h1>
          <p className="text-xl font-bold uppercase mt-2 bg-purple-200 inline-block px-3 py-1 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            УПРАВЛЕНИЕ ВАШИМИ NFT
          </p>
        </div>
        <Link href="/cards/create">
          <button className="hype-button flex items-center gap-2 px-8 py-4 text-lg">
            <Plus size={24} /> СОЗДАТЬ
          </button>
        </Link>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary h-16 w-16" />
        </div>
      ) : cards?.length === 0 ? (
        <div className="hype-panel bg-white p-12 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 rotate-3">
            <Zap size={48} className="text-black" />
          </div>
          <h3 className="text-4xl font-black font-display mb-4">НЕТ КАРТ</h3>
          <p className="text-lg font-bold uppercase text-gray-500 mb-8 max-w-md">В ВАШЕЙ КОЛЛЕКЦИИ ПОКА НЕТ КАРТ. СОЗДАЙТЕ ПЕРВУЮ УНИКАЛЬНУЮ NFT.</p>
          <Link href="/cards/create">
            <button className="hype-button px-8 py-4 text-xl">СОЗДАТЬ КАРТУ 🔥</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards?.map((card) => (
            <div key={card.id} className="relative group">
              <CardItem 
                card={card} 
                onClick={() => setSelectedCard(card.id)}
                className={`transition-transform hover:-translate-y-2 ${selectedCard === card.id ? "scale-105" : ""}`}
              />
              {card.isPrimary && (
                <div className="absolute -top-4 -right-4 z-30 bg-yellow-300 text-black p-3 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12">
                  <Star size={24} fill="currentColor" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={selectedCard !== null} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] sm:max-w-md p-0 overflow-hidden">
          <div className="bg-black text-white p-6 border-b-4 border-black">
            <DialogTitle className="font-display font-black text-3xl tracking-tight uppercase">УПРАВЛЕНИЕ КАРТОЙ</DialogTitle>
          </div>
          
          <div className="p-8 bg-gray-50">
            {selectedCardData && (
              <div className="pointer-events-none mb-8">
                <CardItem card={selectedCardData} />
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => selectedCard && handleSetPrimary(selectedCard)}
                disabled={selectedCardData?.isPrimary || setPrimaryMutation.isPending}
                className="hype-button w-full py-4 text-lg flex items-center justify-center gap-2 bg-yellow-300 text-black border-4"
              >
                {setPrimaryMutation.isPending ? <Loader2 className="animate-spin h-6 w-6" /> : <Star size={20} />}
                {selectedCardData?.isPrimary ? "ОСНОВНАЯ" : "СДЕЛАТЬ ОСНОВНОЙ"}
              </button>

              <button 
                onClick={() => selectedCard && handleDelete(selectedCard)}
                disabled={deleteMutation.isPending}
                className="w-full py-4 text-lg flex items-center justify-center gap-2 bg-white text-red-600 border-4 border-black rounded-xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? <Loader2 className="animate-spin h-6 w-6" /> : <Trash2 size={20} />}
                УДАЛИТЬ
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
