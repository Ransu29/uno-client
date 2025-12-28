import { type Card, CardColor, CardType, type GameState } from '../store/gameStore';

export const canPlayCard = (card: Card, state: GameState): boolean => {
  // 1. It must be my turn
  const currentPlayer = state.players[state.currentTurnIndex];
  if (currentPlayer?.id !== state.playerId) return false;

  // 2. Wilds are always playable
  if (card.color === CardColor.WILD) return true;

  // 3. Match Color (Active color might be different from discard pile if a Wild was played)
  if (card.color === state.activeColor) return true;

  // 4. Match Number (if applicable)
  if (
    card.type === CardType.NUMBER &&
    state.activeNumber !== null &&
    card.value === state.activeNumber
  ) {
    return true;
  }

  // 5. Match Symbol/Action
  if (
    card.type !== CardType.NUMBER &&
    state.activeType !== null &&
    card.type === state.activeType
  ) {
    return true;
  }

  return false;
};