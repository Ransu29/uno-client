import { useState } from 'react';
import { socketService } from '../services/socket';
import { useGameStore } from '../store/gameStore';
import { Users, Plus, LogIn } from 'lucide-react';

export const Lobby = () => {
  const [name, setName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { setPlayerId, setRoomId } = useGameStore();

  // src/components/Lobby.tsx

  const handleCreate = () => {
      if (!name) return alert('Please enter your name');
      setLoading(true);
      
      socketService.emit('create_room', { playerName: name }, (response: any) => {
        // This is the critical part
        if (response.playerId && response.roomId) {
          useGameStore.getState().setPlayerId(response.playerId);
          useGameStore.getState().setRoomId(response.roomId);
        }
        setLoading(false);
      });
    };

  const handleJoin = () => {
    if (!name || !roomInput) return alert('Enter name and Room ID');
    setLoading(true);

    // Get the saved ID, but be ready to overwrite it
    const savedId = localStorage.getItem('uno_playerId');
    
    // Emit the join event
    socketService.emit('join_room', { 
      roomId: roomInput.toUpperCase(), 
      playerName: name,
      playerId: savedId // Send what we have
    });

    // We don't need a callback here because we listen for 'joined_success' globally
    // But let's add a safety timeout
    setTimeout(() => setLoading(false), 2000);
    
    // We don't use a callback here because join_room might fail or 
    // respond via different socket events (joined_success / sync_state)
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
      <div className="flex justify-center mb-8">
        <div className="bg-uno-red p-4 rounded-full shadow-lg">
          <Users size={48} className="text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-black text-center mb-8 tracking-tight">UNO ONLINE</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2 ml-1">Your Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-uno-blue transition-all"
            placeholder="Enter name..."
          />
        </div>

        <div className="pt-4 border-t border-slate-700">
          <button 
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-uno-red hover:bg-red-600 disabled:opacity-50 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Plus size={20} /> Create New Room
          </button>
        </div>

        <div className="relative py-4 flex items-center">
          <div className="grow border-t border-slate-700"></div>
          <span className="shrink mx-4 text-slate-500 text-sm font-bold uppercase">OR</span>
          <div className="grow border-t border-slate-700"></div>
        </div>

        <div className="space-y-3">
          <input 
            type="text" 
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-uno-green transition-all"
            placeholder="Enter 6-Digit Code"
            maxLength={6}
          />
          <button 
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-uno-green hover:bg-green-600 disabled:opacity-50 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <LogIn size={20} /> Join Room
          </button>
        </div>
      </div>
    </div>
  );
};