import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, History } from 'lucide-react'
import RideshareSearch from '../components/RideshareSearch'
import MyRideshares from '../components/MyRideshares'

export const Route = createFileRoute('/share')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rideshare
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share rides, save money, and help the environment
          </p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Find Rides
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              My Rideshares
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <RideshareSearch 
              onRideshareCreated={() => {
                // Switch to history tab after creating a rideshare
                const historyTab = document.querySelector('[value="history"]') as HTMLElement
                historyTab?.click()
              }}
            />
          </TabsContent>

          <TabsContent value="history">
            <MyRideshares />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}