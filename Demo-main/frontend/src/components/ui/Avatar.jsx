const colors = [
  'bg-blue-500', 'bg-violet-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-teal-500', 'bg-red-500',
];

function getColor(name = '') {
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
      title={name}
    >
      {initials || '?'}
    </div>
  );
}
