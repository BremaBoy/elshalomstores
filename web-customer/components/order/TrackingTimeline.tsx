import { Check, Truck, Box, Package, MapPin, Receipt } from "lucide-react";
import { cn } from "../../lib/utils";
import type { OrderStatus } from "../../types/order";

interface TrackingStep {
  label: string;
  status: OrderStatus;
  icon: any;
  description: string;
}

const steps: TrackingStep[] = [
  { 
    label: "Confirmed", 
    status: "Pending", 
    icon: Receipt,
    description: "Your order is placed and awaiting payment confirmation."
  },
  { 
    label: "Processing", 
    status: "Processing", 
    icon: Package,
    description: "We are verifying your payment and items."
  },
  { 
    label: "Packed", 
    status: "Packed", 
    icon: Box,
    description: "Your items are being carefully packed for delivery."
  },
  { 
    label: "Shipped", 
    status: "Shipped", 
    icon: Truck,
    description: "Package has been handed over to the courier."
  },
  { 
    label: "Out for Delivery", 
    status: "Out for Delivery", 
    icon: MapPin,
    description: "Courier is on the way to your address."
  },
  { 
    label: "Delivered", 
    status: "Delivered", 
    icon: Check,
    description: "Order has been successfully delivered. Enjoy!"
  },
];

interface TrackingTimelineProps {
  currentStatus: OrderStatus;
  history: any[];
}

export const TrackingTimeline = ({ currentStatus, history }: TrackingTimelineProps) => {
  const getStatusIndex = (status: OrderStatus) => {
    const idx = steps.findIndex(s => s.status === status);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getStatusIndex(currentStatus);

  // If cancelled or refunded, we handle it separately
  if (currentStatus === 'Cancelled' || currentStatus === 'Refunded') {
    return (
      <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-700">
        <div className="bg-red-100 p-3 rounded-full">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-tight">Order {currentStatus}</h3>
          <p className="text-sm opacity-80">This order was marked as {currentStatus.toLowerCase()}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Visual Line */}
      <div className="relative flex justify-between">
        <div className="absolute top-6 left-0 right-0 h-1 bg-slate-100 -z-10 mx-6 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.status} className="flex flex-col items-center group flex-1">
              <div 
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white shadow-lg",
                  isCompleted ? "bg-primary text-white" : 
                  isCurrent ? "bg-white text-primary ring-4 ring-primary/20" : 
                  "bg-white text-slate-300"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="mt-4 text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isCurrent ? "text-primary" : "text-text-secondary"
                )}>
                  {step.label}
                </p>
                {/* Desktop only description */}
                {isCurrent && (
                   <div className="absolute left-1/2 -translate-x-1/2 mt-4 bg-white p-4 rounded-xl shadow-xl border border-border w-48 text-left z-20 animate-in fade-in zoom-in duration-300 hidden md:block">
                      <p className="text-[10px] font-bold text-text-primary mb-1 uppercase tracking-tight">{step.label}</p>
                      <p className="text-[9px] text-text-secondary font-medium leading-relaxed">{step.description}</p>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History List */}
      <div className="pt-10 space-y-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-primary">Detailed History</h4>
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start relative pb-4 last:pb-0">
                {idx < history.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100" />
                )}
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center z-10",
                  idx === 0 ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-300"
                )}>
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>
                <div className="flex-grow pt-0.5">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-black text-text-primary uppercase tracking-tight">{item.status}</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {item.note && <p className="text-[11px] text-text-secondary font-medium mt-1">{item.note}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest text-center py-4 italic">No detailed history recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
