import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from '../components/AdminDashboard';

export const Route = createFileRoute('/adminDashboard')({
  component: AdminDashboard,
});
