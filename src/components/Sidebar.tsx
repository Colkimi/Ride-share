import { Calendar, Home, Settings, User, HelpCircle, BarChart2, Truck, Star } from "lucide-react"

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


const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart2,
    active: true,
  },
  {
    title: "Home",
    url: "/landing",
    icon: Home,
  },
  {
    title: "Manage Rides",
    url: "/bookings",
    icon: Truck,
  },
  {
    title: "Reviews and ratings",
    url: "/review",
    icon: Star,
    disabled: true,
  },
]

const otherItems = [
  {
    title: "Settings",
    url: "/account",
    icon: Settings,
  },
  {
    title: "Calendar",
    url: "/calender",
    icon: Calendar,
  },
  {
    title: "Accounts",
    url: "#",
    icon: User,
  },
  {
    title: "Help",
    url: "/support",
    icon: HelpCircle,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} aria-disabled={item.disabled ? true : undefined}>
                  <SidebarMenuButton asChild isActive={item.active} disabled={item.disabled}>
                    <a href={item.url} tabIndex={item.disabled ? -1 : 0}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Others</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
