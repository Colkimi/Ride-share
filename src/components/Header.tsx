import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ModeToggle } from './Mode-toggle'
import { getCurrentUser, useAuth } from '@/hooks/useAuth'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { User, LogOut, Settings, Shield } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()


  const getMenuItems = () => {
    const baseItems = [
      { name: 'Home', path: '/landing' },
      { name: 'About Us', path: '/about' }
    ]

    if (isAuthenticated && user) {
      const authenticatedItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Bookings', path: '/bookings' },
        { name: 'Account', path: '/account' }
      ]

      if (user.role === 'admin') {
        authenticatedItems.push(
          { name: 'Users', path: '/users' },
          { name: 'Admin Panel', path: '/adminDashboard' },
          {name: 'drive', path: '/drive' },
        )
      }
      if (user.role === 'customer') {
        authenticatedItems.push(
          {name: 'drive', path: '/drive' },
        )
      }
      if (user.role === 'admin' || user.role === 'driver') {
        authenticatedItems.push(
          { name: 'Vehicles', path: '/vehicle' }
        )
      }

      return [...baseItems, ...authenticatedItems]
    } else {
      return [
        ...baseItems,
        { name: 'Sign In', path: '/login' }
      ]
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate({ to: '/landing' })
  }

  const menuItems = getMenuItems()

  return (
    <>
    <Toaster />
      <header
        className="p-2 border-b"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/landing" className="text-xl font-bold text-primary mr-6">
              RideEasy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-row gap-4 flex-1">
            {menuItems.map((item) => (
              <div key={item.name} className="px-2 font-medium">
                <Link 
                  to={item.path}
                  className="hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            
            {/* User menu for authenticated users */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {getCurrentUser()?.firstName} {getCurrentUser()?.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {getCurrentUser()?.firstName} {getCurrentUser()?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getCurrentUser()?.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {getCurrentUser()?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/adminDashboard" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4"         
                      onClick={() => {
                      localStorage.clear();
                      }}
                    />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default">
                <Link to="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            className="md:hidden flex flex-col shadow-md mt-2 rounded-md"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-4 py-3 border-b font-medium hover:bg-accent transition-colors"
                style={{
                  borderBottomColor: "var(--border)",
                }}
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile user actions */}
            {isAuthenticated && user && (
              <>
                <div className="px-4 py-2 border-b text-sm text-muted-foreground">
                  Signed in as {user.firstName} {user.lastName}
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="px-4 py-3 text-left font-medium text-red-600 hover:bg-accent transition-colors"
                >
                  <LogOut className="inline mr-2 h-4 w-4" />
                  Log out
                </button>
              </>
            )}
          </nav>
        )}
      </header>
    </>
  )
}

