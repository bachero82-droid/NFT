import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCreateCard } from "@workspace/api-client-react";
import { CardItem } from "@/components/ui/card-item";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CardsCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateCard();

  const [theme, setTheme] = useState("cyber");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">("image");
  const [isUploading, setIsUploading] = useState(false);

  const previewCard = {
    id: 0,
    ownerId: 0,
    ownerUsername: "YOU",
    cardNumber: "0000 0000 0000 0000",
    cvv: "000",
    rarity: "common" as any,
    nftId: "PREVIEW_ID",
    mediaUrl: mediaUrl,
    mediaType: mediaType,
    cardTheme: theme,
    isPrimary: false,
    createdAt: new Date().toISOString()
  };

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = url;
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      if (file.type.startsWith("image/gif")) {
        setMediaType("gif");
        const reader = new FileReader();
        reader.onload = (ev) => { setMediaUrl(ev.target?.result as string); setIsUploading(false); };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("image/")) {
        setMediaType("image");
        const compressed = await compressImage(file);
        setMediaUrl(compressed);
        setIsUploading(false);
      } else if (file.type.startsWith("video/")) {
        if (file.size > 8 * 1024 * 1024) {
          toast({ variant: "destructive", title: "Видео слишком большое", description: "Максимум 8MB" });
          setIsUploading(false);
          return;
        }
        setMediaType("video");
        const reader = new FileReader();
        reader.onload = (ev) => { setMediaUrl(ev.target?.result as string); setIsUploading(false); };
        reader.readAsDataURL(file);
      } else {
        toast({ variant: "destructive", title: "Неверный формат" });
        setIsUploading(false);
      }
    } catch {
      toast({ variant: "destructive", title: "Ошибка загрузки файла" });
      setIsUploading(false);
    }
  };

  const handleCreate = () => {
    createMutation.mutate({
      data: {
        cardTheme: theme,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaUrl ? mediaType : undefined
      }
    }, {
      onSuccess: () => {
        toast({ title: "Успех", description: "Карта создана и добавлена в коллекцию" });
        setLocation("/cards");
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Ошибка", description: err.message });
      }
    });
  };

  const themes = [
    { id: 'cyber', color: 'bg-blue-300' },
    { id: 'void', color: 'bg-gray-800 text-white' },
    { id: 'neon', color: 'bg-fuchsia-300' },
    { id: 'matrix', color: 'bg-emerald-300' },
    { id: 'blood', color: 'bg-red-400' },
    { id: 'gold', color: 'bg-yellow-400' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end gap-6 border-b-4 border-black pb-6">
        <Link href="/cards">
          <button className="w-14 h-14 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform active:translate-y-0 active:shadow-none">
            <ArrowLeft size={28} className="text-black" />
          </button>
        </Link>
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-black uppercase drop-shadow-[2px_2px_0px_rgba(255,210,0,0.5)]">СОЗДАТЬ КАРТУ</h1>
          <p className="text-xl font-bold uppercase mt-2 bg-emerald-300 inline-block px-3 py-1 border-2 border-black rotate-[-1deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            СГЕНЕРИРУЙ УНИКАЛЬНУЮ NFT
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="hype-panel p-8 bg-white space-y-10">
            <div>
              <h3 className="hype-badge bg-black text-white inline-block mb-6 rotate-[-2deg]">ЗАГРУЗИ ВИЗУАЛ</h3>
              <div className="relative border-4 border-dashed border-black bg-gray-50 rounded-2xl p-10 text-center hover:bg-gray-100 transition-colors group cursor-pointer shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-4 relative z-0">
                  {isUploading ? (
                    <Loader2 className="animate-spin text-primary" size={48} />
                  ) : (
                    <div className="w-20 h-20 bg-primary text-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                  )}
                  <div className="font-black text-2xl uppercase mt-2">НАЖМИ ИЛИ ПЕРЕТАЩИ</div>
                  <div className="text-sm font-bold text-gray-500 uppercase">IMAGE, GIF, MP4 (MAX 8MB)</div>
                </div>
              </div>
              {mediaUrl && (
                <button 
                  className="w-full mt-4 py-3 bg-red-100 text-red-600 border-2 border-black rounded-xl font-black uppercase hover:bg-red-200 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                  onClick={() => setMediaUrl("")}
                >
                  ОЧИСТИТЬ ФАЙЛ
                </button>
              )}
            </div>

            <div>
              <h3 className="hype-badge bg-blue-300 text-black inline-block mb-6 rotate-2">ВЫБЕРИ ТЕМУ</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`
                      py-4 px-2 rounded-xl text-sm font-black tracking-widest uppercase transition-all border-4 border-black
                      ${theme === t.id 
                        ? `${t.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 scale-105` 
                        : 'bg-white text-black hover:bg-gray-100'}
                    `}
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            className="hype-button w-full h-20 text-2xl flex items-center justify-center gap-4 bg-primary"
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="animate-spin w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
            СГЕНЕРИРОВАТЬ NFT
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-center mb-6">
            <h3 className="hype-badge bg-yellow-300 text-black rotate-[-3deg] text-xl px-6 py-2">LIVE ПРЕВЬЮ</h3>
          </div>
          <div className="flex-1 hype-panel bg-gradient-to-br from-gray-100 to-gray-300 rounded-3xl p-10 flex flex-col items-center justify-center border-4 border-black">
            <div className="w-full max-w-sm transform transition-all duration-500 hover:scale-105">
              <CardItem card={previewCard} />
            </div>
            <div className="mt-12 bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
              <p className="text-center text-sm font-bold uppercase tracking-wider text-black">
                🚨 РЕДКОСТЬ КАРТЫ ОПРЕДЕЛЯЕТСЯ СЛУЧАЙНО ПРИ ГЕНЕРАЦИИ СМАРТ-КОНТРАКТА
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}