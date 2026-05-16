export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-dark-500" />
        </div>
      )}
      <h3 className="text-base font-semibold text-dark-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-dark-500 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
