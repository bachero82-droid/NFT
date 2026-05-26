import React, { useRef, useState } from "react";
import { Card as CardType } from "@workspace/api-client-react";

interface CardItemProps {
  card: CardType;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
}

const rarityColors = {
  common: "text-gray-600 border-gray-400 bg-gray-100",
  rare: "text-blue-700 border-blue-500 bg-blue-100",
  epic: "text-purple-700 border-purple-500 bg-purple-100",
  legendary: "text-amber-700 border-amber-500 bg-yellow-100",
  mythic: "text-rose-700 border-rose-500 bg-rose-100",
};

const rarityBg = {
  common: "from-white to-gray-200",
  rare: "from-cyan-100 to-blue-300",
  epic: "from-fuchsia-100 to-purple-300",
  legendary: "from-yellow-100 to-amber-300",
  mythic: "from-rose-100 to-rose-400",
};

export function CardItem({ card, onClick, className = "", showDetails = true }: CardItemProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setRotate({ x: rotateX, y: rotateY });
    setGlow({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlow({ ...glare, opacity: 0 });
  };

  const formatCardNumber = (num: string) => {
    return num?.replace(/(\d{4})/g, "$1 ").trim() || "XXXX XXXX XXXX XXXX";
  };

  return (
    <div 
      className={`relative group perspective-1000 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          w-full aspect-[1.586/1] rounded-3xl overflow-hidden relative
          transition-transform duration-200 ease-out transform-style-3d
          border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          bg-gradient-to-br ${rarityBg[card.rarity] || rarityBg.common}
          ${card.isPrimary ? 'ring-4 ring-primary ring-offset-4 ring-offset-white' : ''}
        `}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Media Background */}
        {card.mediaUrl && (
          <div className="absolute inset-0 z-0 mix-blend-multiply opacity-90">
            {card.mediaType === "video" ? (
              <video src={card.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={card.mediaUrl} alt="Card Background" className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {/* Glare Effect */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, transparent 50%)`,
            opacity: glare.opacity
          }}
        />

        {/* Card Content */}
        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between backdrop-blur-sm bg-white/10">
          <div className="flex justify-between items-start">
            <div className="font-display font-black text-3xl tracking-tight text-black drop-shadow-md">VΞX</div>
            <div className={`text-xs px-3 py-1 rounded-full uppercase font-black tracking-wider border-2 border-black rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rarityColors[card.rarity]}`}>
              {card.rarity}
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            {showDetails ? (
              <>
                <div className="font-mono text-xl font-bold tracking-[0.1em] text-black bg-white/50 inline-block px-3 py-1 rounded-lg border-2 border-black/20">
                  {formatCardNumber(card.cardNumber)}
                </div>
                <div className="flex justify-between items-end bg-black/5 p-3 rounded-xl border border-black/10">
                  <div>
                    <div className="text-[10px] text-black/60 font-bold tracking-wider">ВЛАДЕЛЕЦ</div>
                    <div className="font-black text-sm tracking-wider uppercase text-black truncate max-w-[150px]">{card.ownerUsername}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-black/60 font-bold tracking-wider">NFT ID</div>
                    <div className="font-mono font-bold text-xs text-black bg-white/80 px-2 py-0.5 rounded border border-black/20">#{card.nftId?.slice(0, 8)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-end">
                <div className="text-right bg-white/80 p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                  <div className="text-[10px] text-black/60 font-bold tracking-wider">NFT ID</div>
                  <div className="font-mono font-black text-xs text-black">#{card.nftId?.slice(0, 8)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
