import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { useAuth } from "@/hooks/useAuth"
import Header from "./Header"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full">
        <Header />
        <main className="w-full">
          {children}
        </main>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 py-2">
            <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" /> 
            <span className="text-foreground "><b>Rideasy</b></span>
          </div>
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
