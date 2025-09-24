import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TimelineStep {
  status: string;
  label: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
}

interface StatusTimelineProps {
  currentStatus: 'requested' | 'pickup' | 'working' | 'wrapping' | 'ready' | 'delivery' | 'completed';
  itemId: string;
}

const steps = [
  { status: 'requested', label: 'Requested' },
  { status: 'pickup', label: 'Picking Up' },
  { status: 'working', label: 'Working' },
  { status: 'wrapping', label: 'Wrapping' },
  { status: 'ready', label: 'Ready for Delivery' },
  { status: 'delivery', label: 'On the Way' },
  { status: 'completed', label: 'Delivered' },
];

export function StatusTimeline({ currentStatus, itemId }: StatusTimelineProps) {
  const currentIndex = steps.findIndex(step => step.status === currentStatus);

  return (
    <div className="business-card">
      <h3 className="font-semibold mb-4 text-foreground">Status Timeline - Item #{itemId}</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          
          return (
            <div key={step.status} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {completed ? (
                  <CheckCircle2 className="h-5 w-5 text-status-completed" />
                ) : current ? (
                  <Clock className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  current ? 'text-primary' : 
                  completed ? 'text-status-completed' : 
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                {current && (
                  <p className="text-xs text-muted-foreground mt-1">
                    In progress...
                  </p>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-px h-8 ml-2 ${
                  completed ? 'bg-status-completed' : 'bg-border'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}