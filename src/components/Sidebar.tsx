import { 
  Calendar, 
  Home, 
  Settings, 
  User, 
  HelpCircle, 
  BarChart2, 
  Truck, 
  Star,
  Users,
  Car,
  CreditCard,
  Shield,
  MapPin,
  FileText,
  Bell
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Link, useLocation } from "@tanstack/react-router"
import { useEffect } from "react"

interface MenuItem {
  title: string
  url: string
  icon: React.ElementType
  roles?: string[]
}

const commonItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart2,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: FileText,
  },
  {
    title: "Reviews",
    url: "/review",
    icon: Star,
  },
  {
    title: "Account",
    url: "/account",
    icon: User,
  },
]

const adminItems: MenuItem[] = [
  {
    title: "Admin Dashboard",
    url: "/adminDashboard",
    icon: Shield,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Drivers",
    url: "/driver",
    icon: Truck,
  },
  {
    title: "Vehicles",
    url: "/vehicle",
    icon: Car,
  },
  {
    title: "Analytics",
    url: "/dashboard",
    icon: BarChart2,
  },
]

const driverItems: MenuItem[] = [
  {
    title: "My Vehicle",
    url: "/vehicle",
    icon: Car,
  },
  {
    title: "Drive",
    url: "/drive",
    icon: MapPin,
  },
]

const customerItems: MenuItem[] = [
  {
    title: "Create Ride",
    url: "/create",
    icon: MapPin,
  },
]

const utilityItems: MenuItem[] = [
  {
    title: "Calendar",
    url: "/calender",
    icon: Calendar,
  },
  {
    title: "Support",
    url: "/support",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const userRole = user?.role || 'customer'

  const getMenuItems = () => {
    let items = [...commonItems]
    
    switch (userRole) {
      case 'admin':
        items = [...adminItems, ...items]
        break
      case 'driver':
        items = [...items, ...driverItems]
        break
      case 'customer':
        items = [...items, ...customerItems]
        break
    }
    
    return items
  }

  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/')
  }

  const menuItems = getMenuItems()

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Utilities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
