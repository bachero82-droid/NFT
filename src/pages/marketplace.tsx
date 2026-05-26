import React, { useState } from "react";
import { useGetMarketListings, useBuyListing, useGetMe, useGetMyCards, useCreateListing } from "@workspace/api-client-react";
import { CardItem } from "@/components/ui/card-item";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShoppingCart, Tag, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMarketListingsQueryKey, getGetMyCardsQueryKey } from "@workspace/api-client-react";

export default function Marketplace() {
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const { data: listings, isLoading } = useGetMarketListings({ query: { queryKey: getGetMarketListingsQueryKey({ rarity: rarityFilter === "all" ? undefined : rarityFilter }) } });
  const { data: me } = useGetMe();
  const { data: myCards } = useGetMyCards();
  
  const buyMutation = useBuyListing();
  const sellMutation = useCreateListing();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedCardToSell, setSelectedCardToSell] = useState<string>("");
  const [sellPrice, setSellPrice] = useState<string>("");

  const handleBuy = (listingId: number, price: number) => {
    if (!me || me.balance < price) {
      toast({ variant: "destructive", title: "Недостаточно средств", description: "Пополните баланс для покупки" });
      return;
    }

    buyMutation.mutate({ id: listingId }, {
      onSuccess: () => {
        toast({ title: "Успех", description: "Карта приобретена и добавлена в коллекцию" });
        queryClient.invalidateQueries({ queryKey: getGetMarketListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMyCardsQueryKey() });
      }
    });
  };

  const handleSell = () => {
    if (!selectedCardToSell || !sellPrice) return;

    sellMutation.mutate({ 
      data: { 
        cardId: parseInt(selectedCardToSell), 
        price: parseFloat(sellPrice) 
      } 
    }, {
      onSuccess: () => {
        toast({ title: "Листинг создан", description: "Ваша карта выставлена на маркет" });
        setSellDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetMarketListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMyCardsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,210,0,0.5)]">МАРКЕТПЛЕЙС</h1>
          <p className="text-xl font-bold uppercase mt-2 bg-yellow-300 inline-block px-3 py-1 border-2 border-black rotate-[1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            ТОРГУЙ NFT КАРТАМИ
          </p>
        </div>
        <button 
          onClick={() => setSellDialogOpen(true)}
          className="hype-button flex items-center gap-2 px-8 py-4 text-lg bg-emerald-400 text-black border-4"
        >
          <Tag size={24} /> ПРОДАТЬ КАРТУ
        </button>
      </header>

      <div className="flex gap-4 items-center p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl inline-flex rotate-[-1deg]">
        <div className="font-black uppercase mr-2"><Flame className="inline text-primary mr-1" /> ФИЛЬТР:</div>
        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="w-[220px] bg-gray-100 border-2 border-black text-black font-black uppercase text-sm h-12 focus:ring-0 rounded-lg">
            <SelectValue placeholder="ВСЕ РЕДКОСТИ" />
          </SelectTrigger>
          <SelectContent className="bg-white border-4 border-black rounded-xl">
            <SelectItem value="all" className="font-bold uppercase">ВСЕ РЕДКОСТИ</SelectItem>
            <SelectItem value="common" className="font-bold uppercase text-gray-600">COMMON</SelectItem>
            <SelectItem value="rare" className="font-bold uppercase text-blue-600">RARE</SelectItem>
            <SelectItem value="epic" className="font-bold uppercase text-purple-600">EPIC</SelectItem>
            <SelectItem value="legendary" className="font-bold uppercase text-yellow-600">LEGENDARY</SelectItem>
            <SelectItem value="mythic" className="font-bold uppercase text-rose-600">MYTHIC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary h-16 w-16" />
        </div>
      ) : listings?.length === 0 ? (
        <div className="hype-panel bg-gray-50 p-20 text-center flex flex-col items-center">
          <ShoppingCart size={64} className="text-gray-300 mb-6" />
          <h2 className="text-4xl font-black uppercase text-gray-400">НЕТ ДОСТУПНЫХ ПРЕДЛОЖЕНИЙ</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {listings?.map((listing) => (
            <div key={listing.id} className="hype-panel bg-white p-6 flex flex-col gap-6 relative">
              <CardItem card={listing.card} showDetails={false} />
              
              <div className="flex justify-between items-center bg-gray-100 p-4 border-2 border-black rounded-xl">
                <div>
                  <div className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1">ПРОДАВЕЦ</div>
                  <div className="font-black text-sm uppercase text-black">{listing.sellerUsername}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1">ЦЕНА</div>
                  <div className="font-mono font-black text-xl text-black bg-yellow-300 px-2 py-0.5 border border-black rotate-2 inline-block">
                    {listing.price.toFixed(2)} V
                  </div>
                </div>
              </div>

              {listing.sellerUsername !== me?.username ? (
                <button 
                  className="hype-button w-full py-4 text-lg flex items-center justify-center gap-2"
                  onClick={() => handleBuy(listing.id, listing.price)}
                  disabled={buyMutation.isPending}
                >
                  {buyMutation.isPending ? <Loader2 className="animate-spin" /> : <ShoppingCart size={20} />}
                  КУПИТЬ КАРТУ
                </button>
              ) : (
                <button disabled className="w-full py-4 text-lg font-black uppercase border-4 border-gray-300 text-gray-400 rounded-xl bg-gray-100">
                  ВАШ ЛИСТИНГ
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] sm:max-w-md p-0 overflow-hidden">
          <div className="bg-emerald-400 text-black p-6 border-b-4 border-black">
            <DialogTitle className="font-display font-black text-3xl tracking-tight uppercase">ПРОДАТЬ КАРТУ</DialogTitle>
          </div>
          
          <div className="p-8 bg-gray-50 space-y-6">
            <div className="space-y-3">
              <label className="text-sm text-black font-black uppercase">ВЫБЕРИТЕ КАРТУ</label>
              <Select value={selectedCardToSell} onValueChange={setSelectedCardToSell}>
                <SelectTrigger className="w-full bg-white border-2 border-black h-14 font-black text-sm rounded-xl focus:ring-0">
                  <SelectValue placeholder="КАРТА НЕ ВЫБРАНА" />
                </SelectTrigger>
                <SelectContent className="bg-white border-4 border-black rounded-xl">
                  {myCards?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()} className="font-bold uppercase">
                      {c.rarity} - #{c.cardNumber.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm text-black font-black uppercase">ЦЕНА (VEX)</label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                className="w-full bg-white border-2 border-black h-14 font-mono font-black text-xl px-4 rounded-xl focus:outline-none focus:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                placeholder="100.00"
              />
            </div>
            
            <button 
              className="hype-button w-full h-16 text-xl mt-4"
              onClick={handleSell}
              disabled={!selectedCardToSell || !sellPrice || sellMutation.isPending}
            >
              {sellMutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : "РАЗМЕСТИТЬ НА МАРКЕТЕ"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
