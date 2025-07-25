import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { useAuth } from "@/hooks/useAuth"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SidebarTrigger className="sticky top-0 z-10" />
          <main className="flex-1 w-full overflow-auto">
            <div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
