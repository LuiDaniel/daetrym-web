'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Pestañas (Radix: flechas, Inicio/Fin y roles ARIA resueltos). Lista segmentada en material «thin».
 * Con `activationMode="manual"` no se cambia de panel al mover el foco (útil si el panel es costoso).
 */
export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex gap-0.5 rounded-md material-thin p-0.5', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'press h-7 rounded-sm px-3 text-small font-medium text-fg-muted transition-colors hover:text-fg data-[state=active]:bg-accent data-[state=active]:text-on-accent',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('mt-4 outline-offset-4', className)} {...props} />;
}
