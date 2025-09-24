import { LucideIcon } from 'lucide-react';

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  gradient?: boolean;
}

export function RoleCard({ title, description, icon: Icon, onClick, gradient = false }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`elevated-card hover:shadow-professional transition-all duration-300 text-left group w-full ${
        gradient ? 'gradient-primary text-white' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${
          gradient ? 'bg-white/20' : 'bg-primary/10'
        }`}>
          <Icon className={`h-6 w-6 ${
            gradient ? 'text-white' : 'text-primary'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-2 ${
            gradient ? 'text-white' : 'text-foreground'
          }`}>
            {title}
          </h3>
          <p className={`text-sm ${
            gradient ? 'text-white/80' : 'text-muted-foreground'
          }`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}