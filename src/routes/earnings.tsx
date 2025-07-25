import { createFileRoute } from '@tanstack/react-router'
import Earnings from '@/components/Earnings'

export const Route = createFileRoute('/earnings')({
  component: Earnings,
})