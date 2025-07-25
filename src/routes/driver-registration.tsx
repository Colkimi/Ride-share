import { createFileRoute } from '@tanstack/react-router'
import { DriverRegistrationForm } from '@/Forms/DriverRegistrationForm';

export const Route = createFileRoute('/driver-registration')({
  component: DriverRegistrationForm,
});

