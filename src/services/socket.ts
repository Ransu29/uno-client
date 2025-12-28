import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

// Access env variable properly (Vite style)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    // STRICT CHECK: If socket exists, do NOT create a new one.
    if (this.socket) return;

    this.socket = io(SERVER_URL, {
      transports: ['websocket'], // Force websocket to prevent polling issues
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket?.id);
    });

    // --- GLOBAL LISTENERS ---
    this.socket.on('sync_state', (state) => {
      useGameStore.getState().setGameState(state);
      useGameStore.getState().setRoomId(state.roomId);
    });

    this.socket.on('state_update', (state) => {
      useGameStore.getState().setGameState(state);
    });

    this.socket.on('game_started', (state) => {
      useGameStore.getState().setGameState(state);
    });
    
    this.socket.on('joined_success', (data) => {
      useGameStore.getState().setPlayerId(data.playerId);
    });

    this.socket.on('error', (err) => {
      console.error('Socket Error:', err);
      // Optional: Toast notification here
    });
  }

  // Helper to disconnect (useful for hot-reload cleanup)
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any, callback?: (response: any) => void) {
    this.socket?.emit(event, data, callback);
    console.log(event)
  }
}

export const socketService = new SocketService();