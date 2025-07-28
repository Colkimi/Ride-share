import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Monitor,
  User,
  Globe,
  Lock,
  Smartphone,
  Mail
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTheme } from '@/components/ThemeProvider';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      bookingUpdates: true,
      promotions: false,
      weeklyDigest: true,
    },
    privacy: {
      profileVisible: true,
      shareLocation: true,
      dataAnalytics: false,
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      timeFormat: '12h',
    }
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your preferences and account settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <ModernCard>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="space-y-3">
                <Link to="/account">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </ModernCardContent>
            </ModernCard>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Theme Settings */}
            <ModernCard>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Appearance
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Theme</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                      className="flex items-center"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                      className="flex items-center"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('system')}
                      className="flex items-center"
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Notification Settings */}
            <ModernCard>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-xs text-gray-500">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Booking Updates</Label>
                      <p className="text-xs text-gray-500">Get notified about booking status changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.bookingUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('bookingUpdates', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Promotions & Offers</Label>
                      <p className="text-xs text-gray-500">Receive promotional offers and discounts</p>
                    </div>
                    <Switch
                      checked={settings.notifications.promotions}
                      onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Weekly Digest</Label>
                      <p className="text-xs text-gray-500">Weekly summary of your activity</p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyDigest}
                      onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                    />
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Privacy Settings */}
            <ModernCard>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Profile Visibility</Label>
                      <p className="text-xs text-gray-500">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      checked={settings.privacy.profileVisible}
                      onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Location Sharing</Label>
                      <p className="text-xs text-gray-500">Share your location for better ride matching</p>
                    </div>
                    <Switch
                      checked={settings.privacy.shareLocation}
                      onCheckedChange={(checked) => handlePrivacyChange('shareLocation', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Data Analytics</Label>
                      <p className="text-xs text-gray-500">Help improve our service with usage analytics</p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataAnalytics}
                      onCheckedChange={(checked) => handlePrivacyChange('dataAnalytics', checked)}
                    />
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Preferences */}
            <ModernCard>
              <ModernCardHeader>
                <ModernCardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Preferences
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Language</Label>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Currency</Label>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Time Format</Label>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                      <option value="12h">12 Hour</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Distance Unit</Label>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                      <option value="km">Kilometers</option>
                      <option value="mi">Miles</option>
                    </select>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>

            {/* Save Button */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline">Reset to Defaults</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}