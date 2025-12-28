import { Trophy, RefreshCw, Home } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface GameOverModalProps {
  onPlayAgain: () => void;
  onLeave: () => void;
}

export const GameOverModal = ({ onPlayAgain, onLeave }: GameOverModalProps) => {
  const { winnerId, players, playerId } = useGameStore();

  const winner = players.find(p => p.id === winnerId);
  const isMe = winnerId === playerId;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center gap-6 max-w-md w-full text-center relative overflow-hidden">
        
        {/* Background Glow */}
        <div className={`absolute top-0 left-0 w-full h-2 ${isMe ? 'bg-uno-green' : 'bg-uno-red'}`} />
        
        <div className={`p-6 rounded-full ${isMe ? 'bg-uno-green/20 text-uno-green' : 'bg-uno-yellow/20 text-uno-yellow'} mb-4`}>
          <Trophy size={64} />
        </div>

        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
            {isMe ? "VICTORY!" : "GAME OVER"}
          </h2>
          <p className="text-slate-400 font-bold text-lg">
            {isMe ? "You won the match!" : `${winner?.name || 'Unknown'} takes the crown.`}
          </p>
        </div>

        <div className="w-full space-y-3 mt-4">
          {/* Note: In a real app, Play Again would emit a 'reset_game' event. 
              For MVP, we just reload/leave. */}
          <button 
            onClick={onLeave}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Home size={20} /> RETURN TO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
};