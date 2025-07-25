import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDrivers, updateDriver, deleteDriver, Status, type Driver } from '@/api/Driver';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Plus, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface DriverWithUser extends Driver {
  user?: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export function Drivers() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'offline'>('all');
  const [selectedDriver, setSelectedDriver] = useState<DriverWithUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverWithUser | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch drivers
  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
  });

  // Update driver mutation
  const updateDriverMutation = useMutation({
    mutationFn: updateDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update driver: ${error.message}`);
    },
  });

  // Delete driver mutation
  const deleteDriverMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver deleted successfully');
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete driver: ${error.message}`);
    },
  });

  // Enhanced filtering logic
  const filteredDrivers = drivers.filter((driver: Driver) => { 
    const matchesStatus = statusFilter === 'all' || driver.verification_status === statusFilter;
    const matchesAvailability = availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && driver.isAvailable) ||
      (availabilityFilter === 'offline' && !driver.isAvailable);
    
    return matchesStatus && matchesAvailability;
  });

  // Pagination calculations
  const totalItems = filteredDrivers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, availabilityFilter]);

  const handleStatusChange = async (driverId: number, newStatus: Status) => {
    try {
      await updateDriverMutation.mutateAsync({
        driver_id: driverId,
        verification_status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update driver status:', error);
    }
  };

  const navigate = useNavigate();

  const handleDeleteDriver = (driverId: number) => {
    deleteDriverMutation.mutate(driverId);
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case Status.Verified:
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case Status.Unverified:
        return <Badge className="bg-yellow-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case Status.REJECTED:
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Clear filters function
  const clearFilters = () => {
    setStatusFilter('all');
    setAvailabilityFilter('all');
    setCurrentPage(1);
  };

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} drivers
          </span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <ModernCard key={i} className="animate-pulse">
                <ModernCardHeader>
                  <Skeleton className="h-4 w-24" />
                </ModernCardHeader>
                <ModernCardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h3 className="text-red-800 dark:text-red-200 font-semibold text-lg">
              Error Loading Drivers
            </h3>
            <p className="mt-2 text-red-600 dark:text-red-400">
              {error && typeof error === 'object' && 'message' in error 
                ? (error as Error).message 
                : 'Failed to load drivers'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and monitor all platform drivers</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button 
              onClick={() => navigate({ to: '/driver-registration' })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Driver
            </Button>
            <Badge variant="default" className="bg-green-500">
              {drivers.filter((d: DriverWithUser) => d.verification_status === Status.Verified).length} Active
            </Badge>
            <Badge variant="secondary">
              {drivers.filter((d: DriverWithUser) => d.verification_status === Status.Unverified).length} Pending
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ModernCard interactive className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Total Drivers</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">{drivers.length}</div>
              <p className="text-sm text-blue-100 mt-1">Registered drivers</p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard interactive className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Verified</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">
                {drivers.filter((d: DriverWithUser) => d.verification_status === Status.Verified).length}
              </div>
              <p className="text-sm text-green-100 mt-1">Active drivers</p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard interactive className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Pending</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">
                {drivers.filter((d: DriverWithUser) => d.verification_status === Status.Unverified).length}
              </div>
              <p className="text-sm text-yellow-100 mt-1">Awaiting verification</p>
            </ModernCardContent>
          </ModernCard>

          <ModernCard interactive className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <ModernCardHeader>
              <ModernCardTitle className="text-white">Available</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-3xl font-bold">
                {drivers.filter((d: DriverWithUser) => d.isAvailable).length}
              </div>
              <p className="text-sm text-purple-100 mt-1">Currently online</p>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={Status.Verified}>Verified</SelectItem>
              <SelectItem value={Status.Unverified}>Pending</SelectItem>
              <SelectItem value={Status.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={(value) => setAvailabilityFilter(value as 'all' | 'available' | 'offline')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {(statusFilter !== 'all' || availabilityFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              size="sm"
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 ml-auto">
            Showing {totalItems} filtered results
          </div>
        </div>

        {/* Drivers Table */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Driver List</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="text-lg font-semibold mb-2">No drivers found</div>
                          <div className="text-sm">
                            {statusFilter !== 'all' || availabilityFilter !== 'all' 
                              ? 'Try adjusting your filters to see more results'
                              : 'No drivers have been registered yet'
                            }
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDrivers.map((driver: DriverWithUser) => (
                      <TableRow key={driver.driver_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {driver.user?.first_name} {driver.user?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{driver.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{driver.license_number}</TableCell>
                        <TableCell>{getStatusBadge(driver.verification_status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {driver.rating}
                          </div>
                        </TableCell>
                        <TableCell>{driver.total_trips}</TableCell>
                        <TableCell>
                          <Badge variant={driver.isAvailable ? "default" : "secondary"}>
                            {driver.isAvailable ? "Available" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && <Pagination />}
          </ModernCardContent>
        </ModernCard>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Driver Status</DialogTitle>
              <DialogDescription>
                Update the verification status for {selectedDriver?.user?.first_name} {selectedDriver?.user?.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Verification Status</label>
                <Select
                  value={selectedDriver?.verification_status}
                  onValueChange={(value) => {
                    if (selectedDriver) {
                      setSelectedDriver({ ...selectedDriver, verification_status: value as Status });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Status.Verified}>Verified</SelectItem>
                    <SelectItem value={Status.Unverified}>Pending</SelectItem>
                    <SelectItem value={Status.REJECTED}>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedDriver && selectedDriver.driver_id !== undefined) {
                    handleStatusChange(selectedDriver.driver_id, selectedDriver.verification_status);
                  }
                }}
                disabled={updateDriverMutation.isPending}
              >
                {updateDriverMutation.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Driver</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedDriver?.user?.first_name} {selectedDriver?.user?.last_name}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedDriver && selectedDriver.driver_id !== undefined) {
                    handleDeleteDriver(selectedDriver.driver_id);
                  }
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete Driver
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
