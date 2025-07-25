import { useEffect } from 'react'
import { useSidebar } from '@/components/ui/sidebar'

export function useSidebarPersistence() {
  const { toggleSidebar } = useSidebar()

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen')
    if (savedState === 'true') {
    } else {
    }
  }, [])

  return { toggleSidebar }
}
