import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  DollarSign,
  Car,
  MessageSquare,
  Settings,
  Trash2,
  Mail,
  ArrowLeft,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'rating' | 'system' | 'promotion';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    bookingId?: number;
    amount?: number;
    rating?: number;
  };
}

// Mock notifications data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'New Booking Request',
    message: 'You have a new ride request from downtown to airport',
    type: 'booking',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actionUrl: '/dashboard',
    metadata: { bookingId: 123 }
  },
  {
    id: 2,
    title: 'Payment Received',
    message: 'Payment of $45.50 has been added to your account',
    type: 'payment',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { amount: 45.50 }
  },
  {
    id: 3,
    title: 'New Rating Received',
    message: 'Customer rated your service 4.8 stars with positive feedback',
    type: 'rating',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: { rating: 4.8 }
  },
  {
    id: 4,
    title: 'Weekly Earnings Summary',
    message: 'You earned $320.75 this week with 12 completed trips',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { amount: 320.75 }
  },
  {
    id: 5,
    title: 'Special Promotion Available',
    message: 'Earn 20% bonus on all rides this weekend!',
    type: 'promotion',
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const { data: notifications = mockNotifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.userId],
    queryFn: async () => {

      return mockNotifications;
    },
    enabled: !!user?.userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      // Replace with actual API call
      console.log('Marking notification as read:', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      // Replace with actual API call
      console.log('Deleting notification:', notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'rating':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-500" />;
      case 'promotion':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'border-l-blue-500';
      case 'payment':
        return 'border-l-green-500';
      case 'rating':
        return 'border-l-yellow-500';
      case 'system':
        return 'border-l-gray-500';
      case 'promotion':
        return 'border-l-purple-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unread') return !notification.read;
    return notification.type === selectedTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      navigate({ to: notification.actionUrl });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          <Badge variant="outline" className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            {unreadCount} Unread
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Notifications</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Mark all as read
                      notifications.filter(n => !n.read).forEach(n => 
                        markAsReadMutation.mutate(n.id)
                      );
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid grid-cols-6 w-full mb-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="booking">Bookings</TabsTrigger>
                    <TabsTrigger value="payment">Payments</TabsTrigger>
                    <TabsTrigger value="rating">Ratings</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                  </TabsList>

                  <div className="space-y-3">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-l-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            getNotificationColor(notification.type)
                          } ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsReadMutation.mutate(notification.id);
                                  }}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotificationMutation.mutate(notification.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-gray-500 text-lg">No notifications found</p>
                        <p className="text-sm text-gray-400">
                          {selectedTab === 'unread' 
                            ? "You're all caught up!" 
                            : "New notifications will appear here"}
                        </p>
                      </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sound Notifications</p>
                    <p className="text-sm text-gray-500">Play sound for new notifications</p>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={pushEnabled}
                    onCheckedChange={setPushEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email notifications</p>
                  </div>
                  <Switch
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Notifications</span>
                  <Badge variant="outline">{notifications.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unread</span>
                  <Badge variant="default">{unreadCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Week</span>
                  <Badge variant="secondary">
                    {notifications.filter(n => 
                      new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;