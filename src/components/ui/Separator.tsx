interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ orientation = 'horizontal', className = '' }: SeparatorProps) {
  return (
    <div
      className={`bg-gray-300 dark:bg-gray-600 ${
        orientation === 'horizontal' ? 'w-full h-px' : 'w-px h-full'
      } ${className}`}
    />
  );
}
