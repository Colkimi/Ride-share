import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from "@/components/ThemeProvider.tsx"
import Layout from '@/components/Layout.tsx'
import { ChatProvider } from '@/contexts/ChatContext.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <>
        <Layout>
          <ChatProvider>
            <Outlet />
          </ChatProvider>
        </Layout>
      </>
    </ThemeProvider>
  ),
})


