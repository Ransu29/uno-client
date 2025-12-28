import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { socketService } from './services/socket';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';

function App() {
  const { roomId, status, players, playerId, setGameState, setRoomId, setPlayerId } = useGameStore();

  useEffect(() => {
    socketService.connect();

    // CRITICAL FIX: When server confirms join, UPDATE our local ID
    socketService.socket?.on('joined_success', (data) => {
      console.log('Joined Success! My ID is:', data.playerId);
      setPlayerId(data.playerId); // This updates localStorage and Zustand
    });

    socketService.socket?.on('sync_state', (state) => {
      console.log('Syncing State:', state);
      setGameState(state);
      setRoomId(state.roomId);
    });

    socketService.socket?.on('game_started', (state) => {
      console.log('Game Started:', state);
      setGameState(state);
    });
    return () => {
      // Cleanup listeners if needed
      socketService.socket?.off('joined_success');
      socketService.socket?.off('sync_state');
      socketService.socket?.off('game_started');
    };
  }, [setGameState, setRoomId, setPlayerId]);
  // src/App.tsx

  useEffect(() => {
    socketService.connect();

    // CLEANUP: If App unmounts, disconnect.
    // This prevents "Ghost Sockets" from staying alive in the background.
    return () => {
      socketService.disconnect();
    };
  }, []);
  


  // --- CENTERED STATES (Lobby & Waiting) ---
  if (!roomId || status === 'waiting') {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-6 text-white overflow-hidden">
        {!roomId ? (
          <Lobby />
        ) : (
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center gap-6 w-full max-w-sm animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-uno-blue tracking-tighter italic">ROOM: {roomId}</h2>
            
            {/* Player List */}
            <div className="w-full bg-slate-900/50 rounded-xl p-4 border border-slate-700">
               <p className="text-slate-500 text-xs font-black uppercase mb-3 tracking-widest">Players Joined</p>
               <div className="space-y-2 max-h-48 overflow-y-auto">
                 {players.map(p => (
                   <div key={p.id} className="bg-slate-800 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${p.connected ? 'bg-uno-green' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
                      <span className="font-bold text-sm truncate">
                        {p.name} {p.id === playerId ? "(You)" : ""}
                      </span>
                   </div>
                 ))}
               </div>
            </div>

            <p className="text-slate-400 text-xs font-bold">Waiting for host to start...</p>

            <button 
              onClick={() => socketService.emit('start_game')}
              className="w-full bg-uno-red hover:bg-red-600 py-4 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-uno-red/20"
            >
              START GAME
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- FULL SCREEN STATE (Game) ---
  return <GameBoard />;
}

export default App;