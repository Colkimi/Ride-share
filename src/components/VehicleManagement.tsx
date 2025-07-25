import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getVehicles,
  getVehiclesByDriverId,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type CreateVehicleData,
  type UpdateVehicleData,
} from '@/api/Vehicle'
import { useAuth } from '@/hooks/useAuth'
import styles from '../FormStyles.module.css'
import { Toaster, toast } from 'sonner'
import Loader from './Loaders'

function VehicleManagement() {
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth() 
  let userId = localStorage.getItem('userId');
  
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  
  const { data: vehicleData = { vehicles: [], total: 0 }, isLoading, isError } = useQuery({
    queryKey: ['vehicle', page, limit, user?.userId], 
    queryFn: async () => {
      if (!user) {
        console.log('User not loaded yet, skipping API call');
        return { vehicles: [], total: 0 };
      }
      
      if (!userId) {
        console.log('No userId found in localStorage');
        return { vehicles: [], total: 0 };
      }
      
      let fetchedData;
      try {
        if (user.role === 'admin') {
          console.log('Fetching all vehicles for admin, page:', page, 'limit:', limit);
          fetchedData = await getVehicles(page, limit);
        } else {
          console.log(`Fetching vehicles for driver ${user.userId}, page:`, page, 'limit:', limit);
          fetchedData = await getVehiclesByDriverId(parseInt(userId), page, limit);
        }
        
        console.log('Fetched vehicles:', fetchedData);
        
        if (Array.isArray(fetchedData)) {
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedVehicles = fetchedData.slice(startIndex, endIndex);
          
          return { 
            vehicles: paginatedVehicles, 
            total: fetchedData.length 
          };
        } else if (fetchedData && typeof fetchedData === 'object') {
          return {
            vehicles: fetchedData.vehicles || [],
            total: fetchedData.total  || 0
          };
        } else {
          return { vehicles: [], total: 0 };
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        return { vehicles: [], total: 0 };
      }
    },
    enabled: !!user, 
  })

  const vehicles = vehicleData.vehicles;
  const totalVehicles = vehicleData.total;
  const totalPages = Math.ceil(totalVehicles / limit);

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleData) => createVehicle(data),
    onSuccess: () => {
      toast.success('Vehicle created successfully')
      queryClient.invalidateQueries({ queryKey: ['vehicle'] })
      setShowCreateForm(false)
    },
    onError: (error) => {
      toast.error('Failed to create vehicle')
      console.error('Error creating vehicle:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateVehicleData) => updateVehicle(data),
    onSuccess: () => {
      toast.success('Vehicle updated successfully')
      queryClient.invalidateQueries({ queryKey: ['vehicle'] })
      setEditingVehicle(null)
    },
    onError: () => {
      toast.error('Failed to update vehicle')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: () => {
      toast.success('Vehicle deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['vehicle'] })
    },
    onError: () => {
      toast.error('Failed to delete vehicle')
    },
  })

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreate = (data: CreateVehicleData) => {
    createMutation.mutate(data)
  }

  const handleUpdate = (data: UpdateVehicleData) => {
    if (!data.vehicle_id) {
      toast.error('Vehicle ID is required for update')
      return
    }
    updateMutation.mutate(data)
  }

  const handleCancelEdit = () => {
    setEditingVehicle(null)
  }

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
  }

  const handleDelete = (id: number | undefined) => {
    if (!id) {
      toast.error('Invalid vehicle ID')
      return
    }
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteMutation.mutate(id)
    }
  }

  // Page change handler with bounds checking
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Show loading while auth is loading
  if (!user) {
    return <Loader />
  }

  if (isLoading) return <Loader />
  if (isError) return <div>Error loading vehicles</div>

  return (
    <div className="p-6">
      <Toaster richColors position="top-center" closeButton={false} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        {!showCreateForm && !editingVehicle && (
          <button
            className={`${styles.actionButton} ${styles.edit}`}
            onClick={() => setShowCreateForm(true)}
          >
            Add New Vehicle
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateVehicleForm
          onCreate={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingVehicle && (
        <EditVehicleForm
          vehicle={editingVehicle}
          onCancel={handleCancelEdit}
          onUpdate={handleUpdate}
        />
      )}

      {!showCreateForm && !editingVehicle && (
        <>
          {vehicles && vehicles.length > 0 ? (
            <div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Make</th>
                      <th>Model</th>
                      <th>Year</th>
                      <th>License Plate</th>
                      <th>Color</th>
                      <th>Capacity</th>
                      <th>Type</th>
                      <th>Approved</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle: Vehicle) => (
                      <tr key={vehicle.vehicle_id}>
                        <td>{vehicle.vehicle_id}</td>
                        <td>{vehicle.make}</td>
                        <td>{vehicle.model}</td>
                        <td>{vehicle.year}</td>
                        <td>{vehicle.license_plate}</td>
                        <td>{vehicle.color}</td>
                        <td>{vehicle.capacity}</td>
                        <td>{vehicle.type}</td>
                        <td>{vehicle.approved ? 'Yes' : 'No'}</td>
                        <td className={styles.actions}>
                          <button
                            className={`${styles.actionButton} ${styles.edit}`}
                            onClick={() => handleEditClick(vehicle)}
                          >
                            Edit
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.delete}`}
                            onClick={() => handleDelete(vehicle.vehicle_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Enhanced Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalVehicles)} of {totalVehicles} vehicles
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className={`px-3 py-1 rounded ${page <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, page - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded ${
                          pageNum === page 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className={`px-3 py-1 rounded ${page >= totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No vehicles found.</p>
              <p className="text-sm text-gray-400 mt-1">Total vehicles: {totalVehicles}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

type CreateVehicleFormProps = {
  onCreate: (vehicle: CreateVehicleData) => void
  onCancel: () => void
}

function CreateVehicleForm({ onCreate, onCancel }: CreateVehicleFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateVehicleData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    color: '',
    capacity: 3,
    type: '',
    approved: false,
  })

  const handleChange = (field: keyof CreateVehicleData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting vehicle data:', formData)
    onCreate(formData)
  }

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Add New Vehicle</div>

      <label className={styles.label}>Make:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.make}
        onChange={(e) => handleChange('make', e.target.value)}
        required
      />

      <label className={styles.label}>Model:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.model}
        onChange={(e) => handleChange('model', e.target.value)}
        required
      />

      <label className={styles.label}>Year:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.year}
        onChange={(e) => handleChange('year', parseInt(e.target.value))}
        required
      />

      <label className={styles.label}>License Plate:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.license_plate}
        onChange={(e) => handleChange('license_plate', e.target.value)}
        required
      />

      <label className={styles.label}>Color:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.color}
        onChange={(e) => handleChange('color', e.target.value)}
        required
      />

      <label className={styles.label}>Capacity:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.capacity}
        onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
        required
      />

      <label className={styles.label}>Type:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.type}
        onChange={(e) => handleChange('type', e.target.value)}
        required
      />

      {user?.role === 'admin' && (
        <>
          <label className={styles.label}>Approved:</label>
          <input
            type="checkbox"
            checked={formData.approved}
            onChange={(e) => handleChange('approved', e.target.checked)}
          />
        </>
      )}

      <div className="pt-4 space-y-2">
        <button className={styles.button} type="submit">
          Add Vehicle
        </button>
        <button className={styles.button} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

type EditVehicleFormProps = {
  vehicle: Vehicle
  onCancel: () => void
  onUpdate: (updatedVehicle: UpdateVehicleData) => void
}

function EditVehicleForm({ vehicle, onCancel, onUpdate }: EditVehicleFormProps) {
  const [formData, setFormData] = useState<UpdateVehicleData>({
    vehicle_id: vehicle.vehicle_id!,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    license_plate: vehicle.license_plate,
    color: vehicle.color,
    capacity: vehicle.capacity,
    type: vehicle.type,
    approved: vehicle.approved,
  })

  const handleChange = (field: keyof UpdateVehicleData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formTitle}>Edit Vehicle</div>

      <label className={styles.label}>Make:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.make || ''}
        onChange={(e) => handleChange('make', e.target.value)}
        required
      />

      <label className={styles.label}>Model:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.model || ''}
        onChange={(e) => handleChange('model', e.target.value)}
        required
      />

      <label className={styles.label}>Year:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.year || 0}
        onChange={(e) => handleChange('year', parseInt(e.target.value))}
        required
      />

      <label className={styles.label}>License Plate:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.license_plate || ''}
        onChange={(e) => handleChange('license_plate', e.target.value)}
        required
      />

      <label className={styles.label}>Color:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.color || ''}
        onChange={(e) => handleChange('color', e.target.value)}
        required
      />

      <label className={styles.label}>Capacity:</label>
      <input
        className={styles.input}
        type="number"
        value={formData.capacity || 0}
        onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
        required
      />

      <label className={styles.label}>Type:</label>
      <input
        className={styles.input}
        type="text"
        value={formData.type || ''}
        onChange={(e) => handleChange('type', e.target.value)}
        required
      />

      <label className={styles.label}>Approved:</label>
      <input
        type="checkbox"
        checked={formData.approved || false}
        onChange={(e) => handleChange('approved', e.target.checked)}
      />

      <div className="pt-4 space-y-2">
        <button className={styles.button} type="submit">
          Update Vehicle
        </button>
        <button className={styles.button} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default VehicleManagement
