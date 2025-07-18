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
  const { user } = useAuth()
  let userId = localStorage.getItem('userId');
  console.log(userId)
  const { data: vehicles, isLoading, isError } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      if (!user || !userId) {
      console.log('No user or userId, returning empty array');
        return [];
      }
      let fetchedVehicles;
      if (user.role === 'admin') {
        console.log('Fetching all vehicles for admin');
        fetchedVehicles = await getVehicles();
      }
      else {
        console.log(`Fetching vehicles for driver ${user.userId}`);
        fetchedVehicles = await getVehiclesByDriverId(parseInt(userId));
      }
       console.log('Fetched vehicles:', fetchedVehicles);
      return getVehiclesByDriverId(parseInt(userId));
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleData) => createVehicle(data),
    onSuccess: () => {
      toast.success('Vehicle created successfully')
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setShowCreateForm(false)
      console.log('Query invalidated after creating vehicle');
    },
    onError: (error) => {
      toast.error('Failed to create vehicle');
      console.error('Error creating vehicle:',error);
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateVehicleData) => updateVehicle(data),
    onSuccess: () => {
      toast.success('Vehicle updated successfully')
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
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
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
    onError: () => {
      toast.error('Failed to delete vehicle')
    },
  })

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  if (isLoading) {
    return <div className="p-6"><Loader /></div>
  }

  if (isError) {
    return <div className="p-6">Error loading vehicles.</div>
  }

  const handleDelete = (id?: number) => {
    if (id === undefined) return
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEditClick = (vehicle: Vehicle) => {
    if (vehicle.vehicle_id === undefined) {
      console.error('Vehicle id is undefined, cannot edit')
      return
    }
    setEditingVehicle(vehicle)
  }

  const handleCancelEdit = () => {
    setEditingVehicle(null)
  }

const handleUpdate = (updatedVehicle: UpdateVehicleData) => {
  if (updatedVehicle.vehicle_id === undefined) {
    console.error('Vehicle id is undefined, cannot update');
    return;
  }
  if (user?.role !== 'admin') {
    updatedVehicle.approved = false;
  }
  updateMutation.mutate(updatedVehicle);
};

const handleCreate = (newVehicle: CreateVehicleData & { driverId?: number }) => {
  if (user?.role !== 'admin') {
    newVehicle.driverId = user?.userId;
    newVehicle.approved = false; 
  }
  createMutation.mutate(newVehicle);
};

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

      {vehicles && vehicles.length > 0 ? (
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
            {vehicles.map((vehicle) => (
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
                    onClick={() => handleDelete(vehicle.vehicle_id!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>
          <p>You have not added any vehicles yet. (Vehicles count: {vehicles ? vehicles.length : 0})</p>      
        </div>
      )}
    </div>
  )
}

type CreateVehicleFormProps = {
  onCreate: (vehicle: CreateVehicleData) => void
  onCancel: () => void
}

function CreateVehicleForm({ onCreate, onCancel }: CreateVehicleFormProps) {
  const { user } = useAuth();
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
    console.log('Submitting vehicle data:', formData); 
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
        type="text"
        value={formData.capacity}
        onChange={(e) => handleChange('capacity', e.target.value)}
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
        </button>{' '}
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
  const { user } = useAuth();
  const [formData, setFormData] = useState<UpdateVehicleData>({
    vehicle_id: vehicle.vehicle_id || 0,
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
        type="text"
        value={formData.capacity}
        onChange={(e) => handleChange('capacity', e.target.value)}
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
            checked={formData.approved || false}
            onChange={(e) => handleChange('approved', e.target.checked)}
          />
        </>
      )}

      <div className="pt-4 space-y-2">
        <button className={styles.button} type="submit">
          Update Vehicle
        </button>{' '}
        <button className={styles.button} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default VehicleManagement
