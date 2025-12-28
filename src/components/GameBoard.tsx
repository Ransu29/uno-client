import { useState } from 'react';
import { useGameStore, CardColor } from '../store/gameStore';
import { socketService } from '../services/socket';
import { Card } from './Card';
import { Opponent } from './Opponent';
import { ColorPicker } from './ColorPicker';
import { AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { canPlayCard } from '../utils/rules'; // Ensure this exists

export const GameBoard = () => {
  const state = useGameStore();
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const players = state.players || [];
  const me = players.find(p => p.id === state.playerId);
  const opponents = players.filter(p => p.id !== state.playerId);
  const currentPlayer = players[state.currentTurnIndex];
  const isMyTurn = currentPlayer?.id === state.playerId;
  const [isDrawing, setIsDrawing] = useState(false);

  const handlePlayCard = (cardId: string) => {
    if (!isMyTurn) return; 
    const card = me?.hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.color === CardColor.WILD) {
      setShowColorPicker(cardId);
    } else {
      socketService.emit('play_card', { cardId });
    }
  };

  const onColorSelected = (color: CardColor) => {
    if (showColorPicker) {
      socketService.emit('play_card', { cardId: showColorPicker, selectedColor: color });
      setShowColorPicker(null);
    }
  };

  const handleDraw = () => {
    if (isMyTurn && !isDrawing) {
      setIsDrawing(true);
      socketService.emit('draw_card');
      setTimeout(() => setIsDrawing(false), 1000);
    }
  };

  if (!me) return <div className="text-white text-center mt-20">Syncing...</div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden select-none relative">
      
      {/* 1. Opponents Bar (Scrollable on Mobile) */}
      <div className="h-20 md:h-28 flex items-center gap-2 p-2 bg-slate-800/30 border-b border-white/5 overflow-x-auto no-scrollbar">
        {opponents.map((opp) => (
          <div key={opp.id} className="shrink-0">
             <Opponent player={opp} isTurn={currentPlayer?.id === opp.id} />
          </div>
        ))}
      </div>

      {/* 2. Center Table */}
      <div className="flex-grow flex flex-col items-center justify-center gap-4 relative z-0">
        
        {isMyTurn && (
          <div className="animate-bounce mb-2">
            <span className="bg-uno-blue px-4 py-1 rounded-full text-white text-xs font-black uppercase tracking-widest shadow-xl">
              Your Turn
            </span>
          </div>
        )}

        <div className="flex items-center gap-8 md:gap-20 transform scale-90 md:scale-100">
          {/* Draw Pile */}
          <div 
            onClick={handleDraw} 
            className={clsx(
              "w-20 h-32 md:w-24 md:h-36 rounded-xl bg-slate-800 border-4 border-white/10 flex items-center justify-center cursor-pointer relative transition-all duration-200",
              isMyTurn && !isDrawing ? "ring-4 ring-uno-blue shadow-2xl" : "opacity-60"
            )}
          >
            <span className="font-black italic text-slate-600 text-2xl md:text-3xl">UNO</span>
            <div className="absolute -bottom-3 bg-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 border border-slate-600">
              {state.deck?.length || 0}
            </div>
          </div>

          {/* Discard Pile */}
          <div className="relative">
            {state.discardPile?.length > 0 ? (
               // Use responsive size prop
               <Card card={state.discardPile[state.discardPile.length - 1]} size="responsive" />
            ) : (
              <div className="w-20 h-32 md:w-24 md:h-36 rounded-xl border-4 border-dashed border-slate-700 flex items-center justify-center">
                 <span className="text-slate-700 text-[10px] uppercase">Discard</span>
              </div>
            )}
            
            {/* Active Color Indicator */}
            <div className={clsx(
              "absolute -top-3 -right-3 w-8 h-8 md:w-12 md:h-12 rounded-full border-4 border-slate-900 shadow-xl transition-colors duration-500",
              state.activeColor === 'red' && "bg-uno-red",
              state.activeColor === 'blue' && "bg-uno-blue",
              state.activeColor === 'green' && "bg-uno-green",
              state.activeColor === 'yellow' && "bg-uno-yellow",
              state.activeColor === 'wild' && "bg-slate-500"
            )} />
          </div>
        </div>
      </div>

      {/* 3. Your Hand */}
      <div className="h-48 md:h-64 bg-slate-800/80 backdrop-blur-md pb-4 pt-2 px-2 flex flex-col items-center justify-end relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* UNO Button */}
        <button 
          onClick={() => socketService.emit('call_uno')}
          className={clsx(
            "absolute right-4 -top-6 md:bottom-8 md:right-8 bg-uno-yellow text-slate-900 font-black px-4 py-2 md:px-6 md:py-4 rounded-xl shadow-lg border-b-4 border-yellow-600 active:scale-95 transition-transform z-30",
             me.isSafe && "opacity-50 cursor-not-allowed"
          )}
        >
          UNO!
        </button>

        {/* Scrollable Hand Container */}
        {/* FIX: justify-start on mobile prevents left-side clipping */}
        <div className="w-full h-full overflow-x-auto no-scrollbar flex items-end justify-start md:justify-center px-4">
          <div className="flex -space-x-5 md:-space-x-12 hover:-space-x-2 transition-all duration-300 py-4 min-w-max mx-auto">
            <AnimatePresence>
              {me.hand?.map((card) => {
                const isPlayable = canPlayCard(card, state);
                return (
                  <div key={card.id} className={"opacity-100"}>
                    <Card 
                      card={card} 
                      size="responsive"
                      isPlayable={isPlayable} 
                      onClick={() => isPlayable && handlePlayCard(card.id)} 
                    />
                  </div>
                )
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {showColorPicker && <ColorPicker onSelect={onColorSelected} />}
    </div>
  );
};