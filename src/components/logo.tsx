import { Truck } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Truck className="h-5 w-5" />
      </div>
      <h1 className="text-lg font-bold group-data-[collapsible=icon]:hidden">
        Logistics Vision
      </h1>
    </div>
  );
}
