import { useEffect, useState } from 'react';
import { useGameStore, CardColor } from '../store/gameStore';
import { socketService } from '../services/socket';
import { Card } from './Card';
import { Opponent } from './Opponent';
import { ColorPicker } from './ColorPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { GameOverModal } from './GameOverModal';
import { canPlayCard } from '../utils/rules';
import { soundService } from '../services/sound';

export const GameBoard = () => {
  const state = useGameStore();
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Safety Checks
  const players = state.players || [];
  const me = players.find(p => p.id === state.playerId);
  const opponents = players.filter(p => p.id !== state.playerId);
  const currentPlayer = players[state.currentTurnIndex];
  const isMyTurn = currentPlayer?.id === state.playerId;
  // Inside GameBoard component body
  useEffect(() => {
    if (isMyTurn) {
      soundService.playTurnStart();
    }
  }, [isMyTurn]);

  // --- DEBUGGING BLOCK ---
  // If 'me' is missing, show exactly what we have in the store to diagnose the mismatch.
  if (!me) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-10 text-white overflow-auto">
        <h2 className="text-3xl font-bold text-red-500 mb-4">State Sync Error</h2>
        <p className="mb-4">The game has started, but I cannot find your player in the list.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-2xl font-mono text-xs">
          <div className="mb-4">
            <span className="text-uno-blue font-bold">MY ID (localStorage):</span> 
            <span className="ml-2 text-yellow-400">"{state.playerId}"</span>
          </div>
          
          <div>
            <span className="text-uno-green font-bold">PLAYERS IN GAME:</span>
            <ul className="mt-2 space-y-2">
              {players.map(p => (
                <li key={p.id} className="border-b border-slate-700 pb-1">
                  Name: <span className="text-white font-bold">{p.name}</span> <br/>
                  ID: <span className="text-yellow-400">"{p.id}"</span> <br/>
                  Hand Size: {p.hand?.length}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 bg-uno-blue px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          Try Refreshing
        </button>
      </div>
    );
  }
  // --- END DEBUGGING BLOCK ---

  // ... Action Handlers ...
  const handlePlayCard = (cardId: string) => {
    if (!isMyTurn) return; 
    const card = me?.hand.find(c => c.id === cardId);
    if (!card) return;


     soundService.playPlayCard();
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
      soundService.playDraw();
      setIsDrawing(true);
      socketService.emit('draw_card');
      
      // Re-enable after 1 second (prevent double-clicks)
      setTimeout(() => setIsDrawing(false), 1000);
    }else{
      soundService.playError();
    }
  };

    const handleLeave = () => {
    // Clear local state and reload to get back to Lobby
    useGameStore.getState().reset(); // Resets Zustand
    window.location.reload(); // Hard refresh to disconnect socket and clear memory
  };
  
  return (
    
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden select-none relative">
      
      {/* 1. Opponents Bar */}
      <div className="h-28 flex justify-center items-center gap-2 p-2 bg-slate-800/30 border-b border-white/5">
        {opponents.map((opp) => (
          <Opponent 
            key={opp.id} 
            player={opp} 
            isTurn={currentPlayer?.id === opp.id} 
          />
        ))}
      </div>

      {/* 2. Center Table */}
      <div className="flex-grow flex flex-col items-center justify-center gap-8 relative z-0">
        
        {isMyTurn && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-10 bg-uno-blue/90 px-6 py-2 rounded-full text-white text-sm font-black uppercase tracking-widest shadow-xl backdrop-blur-sm z-10"
          >
            It's Your Turn
          </motion.div>
        )}

        <div className="flex items-center gap-12 sm:gap-20">
          {/* Draw Pile */}
          <div 
            onClick={handleDraw} 
            className={clsx(
              "w-24 h-36 rounded-xl bg-slate-800 border-4 border-white/10 flex items-center justify-center cursor-pointer relative transition-all duration-200",
              // Visual feedback for disabled state
              isMyTurn && !isDrawing ? "ring-4 ring-uno-blue scale-105 shadow-2xl hover:scale-110" : "opacity-60 grayscale cursor-wait"
            )}
          >
            <span className="font-black italic text-slate-600 text-3xl">UNO</span>
            <div className="absolute -bottom-3 bg-slate-700 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 border border-slate-600 shadow-sm">
              {state.deck?.length || 0}
            </div>
          </div>

          {/* Discard Pile */}
          <div className="relative">
            {state.discardPile?.length > 0 ? (
              <motion.div
                key={state.discardPile[state.discardPile.length - 1].id}
                initial={{ scale: 1.2, rotate: Math.random() * 10 - 5 }}
                animate={{ scale: 1, rotate: 0 }}
              >
                <Card card={state.discardPile[state.discardPile.length - 1]} size="md" />
              </motion.div>
            ) : (
              <div className="w-24 h-36 rounded-xl border-4 border-dashed border-slate-700 flex items-center justify-center">
                 <span className="text-slate-700 text-xs font-bold uppercase">Discard</span>
              </div>
            )}
            
            <div className={clsx(
              "absolute -top-4 -right-4 w-12 h-12 rounded-full border-4 border-slate-900 shadow-xl transition-colors duration-500",
              state.activeColor === 'red' && "bg-uno-red",
              state.activeColor === 'blue' && "bg-uno-blue",
              state.activeColor === 'green' && "bg-uno-green",
              state.activeColor === 'yellow' && "bg-uno-yellow",
              state.activeColor === 'wild' && "bg-slate-500"
            )} />
          </div>
        </div>
      </div>
      {/* Last Action / Status Text */}
        <div className="absolute -top-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Turn</span>
          <span className={clsx(
            "text-xl font-black",
            isMyTurn ? "text-uno-blue" : "text-white"
          )}>
            {isMyTurn ? "YOUR TURN" : `${currentPlayer?.name}'s Turn`}
          </span>
          
          {/* Debug/Event Info: Show what the active card does */}
          <span className="text-[10px] text-slate-500 mt-1 font-mono">
            Active: {state.activeColor} {state.activeType}
          </span>
        </div>

      {/* 3. Your Hand */}
      {/* Bottom: Your Hand */}
<div className="h-64 bg-slate-800/80 backdrop-blur-md p-6 flex flex-col items-center justify-end relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
  
  {/* UNO Status Indicator (For Me) */}
  <div className="absolute top-4 left-6 flex items-center gap-2">
    <div className={clsx(
      "w-3 h-3 rounded-full",
      me.isSafe ? "bg-uno-green shadow-[0_0_10px_#55aa55]" : "bg-slate-600"
    )} />
    <span className="text-[10px] font-bold text-slate-400 uppercase">
      {me.isSafe ? "SAFE (UNO CALLED)" : "NOT SAFE"}
    </span>
  </div>

   <div className="flex -space-x-12 hover:-space-x-4 transition-all duration-500 pb-6 overflow-x-visible">
    <AnimatePresence>
      {me.hand?.map((card) => {
        // CHECK VALIDITY
        const isPlayable = canPlayCard(card, state);

        return (
          <div 
            key={card.id} 
            className={clsx("transition-opacity duration-300", isPlayable ? "opacity-100" : "opacity-50 grayscale")}
          >
            <Card 
              card={card} 
              isPlayable={isPlayable} 
              onClick={() => isPlayable && handlePlayCard(card.id)} 
            />
          </div>
        );
      })}
    </AnimatePresence>
  </div>

  {/* CHALLENGE BUTTON (Only show if an opponent is vulnerable) */}
  {opponents.some(o => o.cardCount === 1 && !o.isSafe) && (
    <div className="absolute top-4 right-6 animate-bounce">
      <button
        onClick={() => {
            const victim = opponents.find(o => o.cardCount === 1 && !o.isSafe);
            if (victim) socketService.emit('challenge', { targetPlayerId: victim.id });
        }}
        className="bg-red-600 text-white px-4 py-2 rounded-lg font-black text-xs uppercase shadow-lg hover:bg-red-500"
      >
        CHALLENGE {opponents.find(o => o.cardCount === 1 && !o.isSafe)?.name}!
      </button>
    </div>
  )}

  <div className="flex -space-x-12 hover:-space-x-4 transition-all duration-500 pb-6 overflow-x-visible">
    <AnimatePresence>
      {me.hand?.map((card) => (
        <Card 
          key={card.id} 
          card={card} 
          isPlayable={isMyTurn} 
          onClick={() => handlePlayCard(card.id)} 
        />
      ))}
    </AnimatePresence>
  </div>
  
  {/* The UNO Button */}
  <button 
    onClick={() => socketService.emit('call_uno')}
    // Disable if I have too many cards (optional rule, but good UX)
    disabled={me.hand.length > 2} 
    className={clsx(
      "absolute right-8 bottom-8 px-6 py-4 rounded-2xl font-black shadow-lg transition-all border-b-4",
      me.isSafe 
        ? "bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed" 
        : "bg-uno-yellow text-slate-900 border-yellow-600 hover:scale-105 active:scale-95 active:border-b-0 translate-y-0 active:translate-y-1"
    )}
  >
    UNO!
  </button>
</div>

      {showColorPicker && <ColorPicker onSelect={onColorSelected} />}

          {/* NEW: Game Over Modal */}
      {state.status === 'finished' && (
        <GameOverModal 
          onPlayAgain={() => {}} // Not implemented for MVP
          onLeave={handleLeave} 
        />
      )}
    </div>
  );
};