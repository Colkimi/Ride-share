import { createFileRoute } from '@tanstack/react-router';
import { Drivers } from '@/components/Drivers';

export const Route = createFileRoute('/driver')({
  component: Drivers,
});


