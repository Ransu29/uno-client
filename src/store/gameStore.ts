import { create } from 'zustand';

export enum CardColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  WILD = 'wild',
}

export enum CardType {
  NUMBER = 'number',
  SKIP = 'skip',
  REVERSE = 'reverse',
  DRAW_TWO = 'draw2',
  WILD = 'wild',
  WILD_DRAW_FOUR = 'wild_draw4',
  WILD_SHUFFLE_HANDS = 'wild_shuffle',
}

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isSafe: boolean;
  connected: boolean;
   cardCount: number; 
}

export interface GameState {
  roomId: string | null;
  playerId: string | null;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  deck: any[]; // Matches backend (contents hidden)
  discardPile: Card[];
  currentTurnIndex: number;
  direction: 1 | -1;
  activeColor: CardColor;
  activeNumber: number | null;
  activeType: CardType | null;
  winnerId: string | null;
  
  // Actions
  setGameState: (state: Partial<GameState>) => void;
  setPlayerId: (id: string) => void;
  setRoomId: (id: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  playerId: localStorage.getItem('uno_playerId'),
  status: 'waiting',
  players: [],
  deck: [],
  discardPile: [],
  currentTurnIndex: 0,
  direction: 1,
  activeColor: CardColor.RED,
  activeNumber: null,
  activeType: null,
  winnerId: null,

  setGameState: (updates) => set((state) => ({ ...state, ...updates })),
  
  setPlayerId: (id) => {
    localStorage.setItem('uno_playerId', id);
    set({ playerId: id });
  },
  
  setRoomId: (id) => {
    if (id) localStorage.setItem('uno_roomId', id);
    else localStorage.removeItem('uno_roomId');
    set({ roomId: id });
  },

  logout: () => {
    localStorage.removeItem('uno_playerId');
    localStorage.removeItem('uno_roomId');
    set({ playerId: null, roomId: null, status: 'waiting', players: [] });
  },

  reset: () => set({ status: 'waiting', players: [], roomId: null, deck: [], discardPile: [] }),
}));