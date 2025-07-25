import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'
import { routeTree } from './routeTree.gen'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { setupTokenRefreshInterval } from './api/tokenRefresh'
import { ThemeProvider } from './components/ThemeProvider'
import { Router } from '@tanstack/react-router'
import { ChatProvider } from './contexts/ChatContext.tsx'


const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProvider.getContext(),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})


declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


setupTokenRefreshInterval()

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider>
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}


reportWebVitals()
