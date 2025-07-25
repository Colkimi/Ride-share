import { createFileRoute } from '@tanstack/react-router'
import SettingsComponent from '@/components/Settings';

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

