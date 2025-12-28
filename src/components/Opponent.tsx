import { User, ShieldCheck, WifiOff } from 'lucide-react';
import { type Player } from '../store/gameStore';
import { clsx } from 'clsx';

interface OpponentProps {
  player: Player;
  isTurn: boolean;
}

export const Opponent = ({ player, isTurn }: OpponentProps) => {
  return (
    <div className={clsx(
      "flex flex-col items-center gap-1 md:gap-2 p-2 rounded-xl transition-all duration-300 w-16 md:w-24", // Fixed widths
      isTurn ? "bg-uno-blue/20 ring-2 ring-uno-blue scale-105 shadow-lg z-10" : "opacity-70 grayscale-[0.5]"
    )}>
      <div className="relative">
        <div className={clsx(
          "w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-colors relative overflow-hidden",
          isTurn ? "bg-slate-700 border-uno-blue" : "bg-slate-800 border-slate-600"
        )}>
           <User className={clsx(isTurn ? "text-uno-blue" : "text-slate-400", "w-4 h-4 md:w-6 md:h-6")} />
           
           {!player.connected && (
             <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center backdrop-blur-sm">
               <WifiOff size={16} className="text-white" />
             </div>
           )}
        </div>
        
        {player.isSafe && (
          <div className="absolute -top-2 -right-2 bg-uno-yellow rounded-full p-0.5 md:p-1 border border-slate-900 shadow-sm animate-bounce">
            <ShieldCheck className="text-slate-900 w-3 h-3 md:w-4 md:h-4" />
          </div>
        )}
      </div>

      <div className="text-center w-full">
        <p className="text-[10px] md:text-xs font-bold truncate w-full text-white">{player.name}</p>
        
        <div className={clsx(
          "mx-auto mt-0.5 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-black border w-fit",
          player.cardCount < 2 ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" : "bg-slate-700 border-slate-600 text-slate-300"
        )}>
          {player.cardCount}
        </div>
      </div>
    </div>
  );
};