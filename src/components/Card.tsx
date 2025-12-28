import { type Card as CardType, CardColor, CardType as CType } from '../store/gameStore';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Ban, RefreshCw, Layers } from 'lucide-react'; // Icons

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Card = ({ card, onClick, isPlayable = false, size = 'md' }: CardProps) => {
  
  // Mapping logic
  const colorMap = {
    [CardColor.RED]: 'bg-uno-red',
    [CardColor.BLUE]: 'bg-uno-blue',
    [CardColor.GREEN]: 'bg-uno-green',
    [CardColor.YELLOW]: 'bg-uno-yellow',
    [CardColor.WILD]: 'bg-gradient-to-br from-uno-red via-uno-blue to-uno-green', // Rainbow
  };

  const sizeClasses = {
    sm: 'w-16 h-24 text-xl',
    md: 'w-24 h-36 text-4xl',
    lg: 'w-32 h-48 text-6xl',
  };

  // Render content based on type
  const renderContent = () => {
    switch (card.type) {
      case CType.SKIP: return <Ban size={32} />;
      case CType.REVERSE: return <RefreshCw size={32} />;
      case CType.DRAW_TWO: return <span className="font-bold text-3xl">+2</span>;
      case CType.WILD: return <span className="rotate-45 font-bold text-3xl">W</span>; // Simple Wild Icon
      case CType.WILD_DRAW_FOUR: return <span className="font-bold text-2xl">+4</span>;
      case CType.WILD_SHUFFLE_HANDS: return <Layers size={32} />;
      default: return <span className="font-bold font-mono shadow-sm">{card.value}</span>;
    }
  };

  return (
    <motion.div
      layoutId={card.id} // For smooth layout animations later
      whileHover={isPlayable ? { y: -20, scale: 1.1 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={clsx(
        'relative rounded-lg shadow-xl border-4 border-white flex items-center justify-center select-none',
        colorMap[card.color],
        sizeClasses[size],
        isPlayable ? 'cursor-pointer hover:shadow-2xl hover:z-10' : 'cursor-not-allowed opacity-90'
      )}
    >
      {/* Inner White Oval (Classic UNO Look) */}
      <div className="absolute inset-2 border-2 border-white/20 rounded-full opacity-50" />
      
      {/* Center Symbol */}
      <div className="text-white drop-shadow-md z-10">
        {renderContent()}
      </div>

      {/* Small Corner Indices */}
      <div className="absolute top-1 left-1 text-xs font-bold text-white opacity-80">
        {card.type === CType.NUMBER ? card.value : ''}
      </div>
      <div className="absolute bottom-1 right-1 text-xs font-bold text-white opacity-80 rotate-180">
        {card.type === CType.NUMBER ? card.value : ''}
      </div>
    </motion.div>
  );
};