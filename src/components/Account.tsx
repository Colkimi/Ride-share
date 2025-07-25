import { getUsers, updateUser, type User } from '@/api/Users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit3, Save, X, User as UserIcon, Mail, Phone, Shield } from 'lucide-react';
import styles from '../FormStyles.module.css';

interface UpdateUserData {
  userId: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export default function Account() {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Get current user's email from auth context or localStorage
  const userEmail = authUser?.email || localStorage.getItem('userEmail');
  const userId = authUser?.userId;

  // Fetch user data - more efficient to get specific user if possible
  const { data: users, isLoading: usersLoading, isError, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await getUsers();
      return Array.isArray(result) ? result : result.users;
    },
    enabled: !!userEmail, // Only fetch if we have user email
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserData) => updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(error?.message || 'Failed to update profile. Please try again.');
      setIsLoading(false);
    }
  });

  // Find current user from the users list
  const currentUser = users?.find(u => u.email === userEmail || u.userId === userId);

  // Initialize edit form when user data is available
  useEffect(() => {
    if (currentUser && !isEditing) {
      setEditedUser({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
      });
    }
  }, [currentUser, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      phone: currentUser?.phone || '',
    });
  };

  const handleSave = async () => {
    if (!currentUser?.userId) {
      toast.error('User ID not found. Please try logging in again.');
      return;
    }

    // Validate required fields
    if (!editedUser.firstName?.trim() || !editedUser.lastName?.trim()) {
      toast.error('First name and last name are required.');
      return;
    }

    setIsLoading(true);

    const updateData: UpdateUserData = {
      userId: currentUser.userId,
      firstName: editedUser.firstName?.trim(),
      lastName: editedUser.lastName?.trim(),
      phone: editedUser.phone?.trim() || undefined,
    };

    updateUserMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({});
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Loading state
  if (usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-2xl mx-auto">
          <ModernCard>
            <ModernCardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-20 w-20"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-2xl mx-auto">
          <ModernCard>
            <ModernCardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <UserIcon className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Error Loading Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {error?.message || 'Failed to load user data. Please try refreshing the page.'}
                </p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    );
  }

  // User not found
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-2xl mx-auto">
          <ModernCard>
            <ModernCardContent className="p-8 text-center">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Profile Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We couldn't find your profile information. Please try logging in again.
              </p>
              <Button onClick={() => window.location.href = '/login'} variant="outline">
                Go to Login
              </Button>
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'driver':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'customer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <Toaster richColors position="top-right" />
      
      <div className="max-w-2xl mx-auto">
        <ModernCard className="overflow-hidden">
          <ModernCardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                    {getInitials(currentUser.firstName, currentUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <ModernCardTitle className="text-white text-xl">
                    {currentUser.firstName} {currentUser.lastName}
                  </ModernCardTitle>
                  <p className="text-white/80 text-sm">Account Settings</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser.role)}`}>
                <Shield className="w-3 h-3 inline mr-1" />
                {currentUser.role?.toUpperCase()}
              </div>
            </div>
          </ModernCardHeader>

          <ModernCardContent className="p-8">
            <div className="space-y-6">
              {/* Email - Read Only */}
              <div className="space-y-2">
                <Label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentUser.email || 'Not available'}
                  </span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    Read Only
                  </span>
                </div>
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <UserIcon className="w-4 h-4 mr-2" />
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    type="text"
                    value={editedUser.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="transition-all duration-200"
                    placeholder="Enter your first name"
                    required
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-700 dark:text-gray-300">
                      {currentUser.firstName || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    type="text"
                    value={editedUser.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="transition-all duration-200"
                    placeholder="Enter your last name"
                    required
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-700 dark:text-gray-300">
                      {currentUser.lastName || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <span className="text-gray-700 dark:text-gray-300">
                      {currentUser.phone || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                {isEditing ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || updateUserMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isLoading || updateUserMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isLoading || updateUserMutation.isPending}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleEdit}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Additional Information Card */}
        <ModernCard className="mt-6">
          <ModernCardHeader>
            <ModernCardTitle>Account Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                <span className="ml-2 font-mono text-gray-700 dark:text-gray-300">
                  {currentUser.userId}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Account Type:</span>
                <span className="ml-2 font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  );
}