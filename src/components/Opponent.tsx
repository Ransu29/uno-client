// src/components/Opponent.tsx
import { type Player } from '../store/gameStore';
import { clsx } from 'clsx';
import { User, ShieldCheck, WifiOff } from 'lucide-react'; // Add WifiOff import

interface OpponentProps {
  player: Player;
  isTurn: boolean;
}

export const Opponent = ({ player, isTurn }: OpponentProps) => {
  return (
    <div className={clsx(
      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300",
      isTurn ? "bg-uno-blue/20 ring-2 ring-uno-blue scale-110 shadow-lg z-10" : "opacity-70 grayscale-[0.5]"
    )}>
      <div className="relative">
         {/* Avatar Circle */}
        <div className={clsx(
          "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors relative overflow-hidden", // Added relative overflow-hidden
          isTurn ? "bg-slate-700 border-uno-blue" : "bg-slate-800 border-slate-600"
        )}>
           {/* Normal Icon */}
           <User size={24} className={isTurn ? "text-uno-blue" : "text-slate-400"} />
           
           {/* Disconnected Overlay */}
           {!player.connected && (
             <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center backdrop-blur-sm">
               <WifiOff size={20} className="text-white" />
             </div>
           )}
        </div>
        
        {/* Safe/UNO Indicator */}
        {player.isSafe && (
          <div className="absolute -top-2 -right-2 bg-uno-yellow rounded-full p-1 border-2 border-slate-900 shadow-sm animate-bounce">
            <ShieldCheck size={14} className="text-slate-900" />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-bold truncate max-w-[80px] text-white">{player.name}</p>
        
        {/* CARD COUNT BADGE */}
        <div className={clsx(
          "mt-1 px-2 py-0.5 rounded text-[10px] font-black border",
          player.cardCount < 2 ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" : "bg-slate-700 border-slate-600 text-slate-300"
        )}>
          {player.cardCount} CARDS
        </div>
      </div>
    </div>
  );
};