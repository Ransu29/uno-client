import { type Card as CardType, CardColor, CardType as CType } from '../store/gameStore';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Ban, RefreshCw, Layers } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'responsive' | 'sm' | 'md'; // Updated Prop Type
}

export const Card = ({ card, onClick, isPlayable = false, size = 'responsive' }: CardProps) => {
  
  const colorMap = {
    [CardColor.RED]: 'bg-uno-red',
    [CardColor.BLUE]: 'bg-uno-blue',
    [CardColor.GREEN]: 'bg-uno-green',
    [CardColor.YELLOW]: 'bg-uno-yellow',
    [CardColor.WILD]: 'bg-gradient-to-br from-uno-red via-uno-blue to-uno-green',
  };

  // NEW: Responsive sizing logic
  // "responsive" = w-14 (Mobile) -> w-24 (Desktop)
  const sizeClasses = {
    responsive: 'w-14 h-24 text-lg md:w-24 md:h-36 md:text-4xl',
    sm: 'w-12 h-20 text-sm', 
    md: 'w-24 h-36 text-4xl',
  };

  const renderContent = () => {
    switch (card.type) {
      // Adjusted icon sizes for responsiveness
      case CType.SKIP: return <Ban className="w-6 h-6 md:w-8 md:h-8" />;
      case CType.REVERSE: return <RefreshCw className="w-6 h-6 md:w-8 md:h-8" />;
      case CType.DRAW_TWO: return <span className="font-bold text-xl md:text-3xl">+2</span>;
      case CType.WILD: return <span className="rotate-45 font-bold text-xl md:text-3xl">W</span>;
      case CType.WILD_DRAW_FOUR: return <span className="font-bold text-lg md:text-2xl">+4</span>;
      case CType.WILD_SHUFFLE_HANDS: return <Layers className="w-6 h-6 md:w-8 md:h-8" />;
      default: return <span className="font-bold font-mono shadow-sm">{card.value}</span>;
    }
  };

  return (
    <motion.div
      layoutId={card.id}
      whileHover={isPlayable ? { y: -20, scale: 1.1 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={clsx(
        'relative rounded-md md:rounded-lg shadow-lg border-2 md:border-4 border-white flex items-center justify-center select-none shrink-0',
        colorMap[card.color],
        size === 'responsive' ? sizeClasses.responsive : sizeClasses[size],
        isPlayable ? 'cursor-pointer hover:shadow-2xl hover:z-10' : 'cursor-not-allowed opacity-90'
      )}
    >
      <div className="absolute inset-1 md:inset-2 border md:border-2 border-white/20 rounded-full opacity-50" />
      <div className="text-white drop-shadow-md z-10">
        {renderContent()}
      </div>
      
      {/* Corner Indices (Hidden on very small cards to save space, visible on Desktop) */}
      <div className="absolute top-0.5 left-1 text-[8px] md:text-xs font-bold text-white opacity-80">
        {card.type === CType.NUMBER ? card.value : ''}
      </div>
      <div className="absolute bottom-0.5 right-1 text-[8px] md:text-xs font-bold text-white opacity-80 rotate-180">
        {card.type === CType.NUMBER ? card.value : ''}
      </div>
    </motion.div>
  );
};