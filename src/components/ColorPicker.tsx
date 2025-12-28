import { CardColor } from '../store/gameStore';

interface ColorPickerProps {
  onSelect: (color: CardColor) => void;
}

export const ColorPicker = ({ onSelect }: ColorPickerProps) => {
  const colors = [
    { id: CardColor.RED, bg: 'bg-uno-red' },
    { id: CardColor.BLUE, bg: 'bg-uno-blue' },
    { id: CardColor.GREEN, bg: 'bg-uno-green' },
    { id: CardColor.YELLOW, bg: 'bg-uno-yellow' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-black text-center mb-6 uppercase tracking-widest">Select Color</h2>
        <div className="grid grid-cols-2 gap-4">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`${c.bg} aspect-square rounded-2xl shadow-lg transform transition-transform hover:scale-105 active:scale-95 border-4 border-white/20`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};