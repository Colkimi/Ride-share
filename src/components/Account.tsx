import { getUsers, type User } from '@/api/Users'
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Account() {
  const { data: users, isLoading, isError, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const email = localStorage.getItem('userEmail');
  console.log('Stored email:', email); 

  if (isLoading) {
    return <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6 mt-8">Loading...</div>;
  }
  if (isError) {
    console.error('Error fetching users:', error); 
    return <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6 mt-8">Error loading user data.</div>;
  }

  console.log('Fetched users:', users); 

  const user = users?.find(u => u.email === email);

  if (!user) {
    console.log('User not found for email:', email); 
    return <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6 mt-8">User not found.</div>;
  }

  const { firstName = 'Not available', lastName = 'Not available', phone = 'Not available' } = user;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg border p-8 pl-15 mt-8 ml-80 w-2xl ">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Account Settings</h1>
      <div className="mb-4">
        <div className="font-semibold">Email:</div>
        <div className="text-gray-700">{email || 'Not available'}</div>
      </div>
      <div className="mb-4">
        <div className="font-semibold">First Name:</div>
        <div className="text-gray-700">{firstName}</div>
      </div>
      <div className="mb-4">
        <div className="font-semibold">Last Name:</div>
        <div className="text-gray-700">{lastName}</div>
      </div>
      <div className="mb-4">
        <div className="font-semibold">Contact:</div>
        <div className="text-gray-700">{phone}</div>
      </div>
      <div className="text-gray-500 mt-6">Change your account settings..</div>

      <button className="w-full py-3 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition-all duration-300"
      onClick={ () => {
        console.log('Updating user information...');
      }}
      >
        Update information
      </button>
    </div>
  );
}