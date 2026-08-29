type Variant = 'number' | 'operator' | 'function' | 'equals';

interface CalculatorButtonProps {
  label: string;
  onClick: () => void;
  variant?: Variant;
  wide?: boolean;
  ariaLabel?: string;
}

const variantStyles: Record<Variant, string> = {
  number:
    'bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600',
  operator:
    'bg-amber-500 text-white hover:bg-amber-400 active:bg-amber-600',
  function:
    'bg-neutral-600 text-white hover:bg-neutral-500 active:bg-neutral-400',
  equals:
    'bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600',
};

export default function CalculatorButton({
  label,
  onClick,
  variant = 'number',
  wide = false,
  ariaLabel,
}: CalculatorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={[
        'select-none rounded-2xl text-2xl font-medium',
        'flex items-center justify-center',
        'transition-all duration-150 ease-out',
        'hover:brightness-110 active:scale-95 active:brightness-95',
        'shadow-sm',
        variantStyles[variant],
        wide ? 'col-span-2' : '',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
