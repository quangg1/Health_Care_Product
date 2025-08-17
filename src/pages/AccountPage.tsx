import React, { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, MapPin, CreditCard, Bell, Shield, Calendar, Clock, RotateCw } from 'lucide-react';
import StyledRadio from '../components/StyledRadio';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [dob, setDob] = useState('');
  const [profile, setProfilePicture] = useState<string | null>(null);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState(''); // Add state for gender

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Set dob from user data when component mounts
  useEffect(() => {
    if (user?.dob) {
      const date = new Date(user.dob);
      setDob(date.toISOString().split('T')[0]);
    }
    if (user?.gender) {
      setGender(user.gender);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'wishlist') {
      fetchWishlist();
    } else if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setWishlist(result.wishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/user/getUser', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setAddresses(result.user.address);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Get values from input fields
      const updatedUserName = (document.querySelector('input[type="text"][placeholder="Enter your full name"]') as HTMLInputElement)?.value || user?.userName || '';
      const updatedNickname = (document.querySelector('input[type="text"][placeholder="Enter your nickname"]') as HTMLInputElement)?.value || user?.nickname || '';
      const updatedEmail = (document.querySelector('input[type="email"][placeholder="Enter your email"]') as HTMLInputElement)?.value || user?.email || '';
      const updatedPhone = (document.querySelector('input[type="tel"][placeholder="Enter your phone number"]') as HTMLInputElement)?.value || user?.phone || '';
      const updatedGender = gender; // Use state value for gender
      const updatedAddress = (document.querySelector('input[type="text"][placeholder="Enter your address"]') as HTMLInputElement)?.value || user?.defaultAddress || '';

      const formData = new FormData();
      formData.append('userId', user?._id || '');
      formData.append('userName', updatedUserName);
      formData.append('nickname', updatedNickname);
      formData.append('email', updatedEmail);
      formData.append('phone', updatedPhone);
      formData.append('gender', updatedGender);
      formData.append('dob', dob);
      formData.append('defaultAddress', updatedAddress);
      if (profile) {
        formData.append('profile', profile);
      }

      const response = await fetch('/api/v1/user/update-user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

        if (result.success) {
            alert('Profile updated successfully');
            // Update user data in AuthContext and localStorage
            const updatedUser = { ...user, ...result.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload(); // Reload to reflect changes
        } else {
        alert('Failed to update profile: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
       return (
         <div className="space-y-6">
           <h2 className="text-2xl font-bold">Profile Information</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Full Name
               </label>
               <input
                 type="text"
                 defaultValue={user?.userName || ''}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 placeholder="Enter your full name"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Nickname
               </label>
               <input
                 type="text"
                 defaultValue={user?.nickname || ''}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 placeholder="Enter your nickname"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Gender
               </label>
               <StyledRadio
                 name="gender"
                 options={[
                   { value: 'male', label: 'Male' },
                   { value: 'female', label: 'Female' },
                   { value: 'other', label: 'Other' },
                 ]}
                 selectedValue={gender}
                 onChange={setGender}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Email
               </label>
               <input
                 type="email"
                 defaultValue={user?.email || ''}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 placeholder="Enter your email"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Phone
               </label>
               <input
                 type="tel"
                 defaultValue={user?.phone || ''}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 placeholder="Enter your phone number"
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Date of Birth
               </label>
               <input
                 type="date"
                 value={dob}
                 onChange={(e) => setDob(e.target.value)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Address
               </label>
               <input
                 type="text"
                 defaultValue={user?.defaultAddress || ''}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 placeholder="Enter your address"
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Profile Picture
               </label>
               <input
                 type="file"
                 accept="image/*"
                 onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfilePicture(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setProfilePicture(null);
                  }
                }}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               />
               {(profile || (user && user.profile)) && (
                 <div className="mt-2">
                   <img
                     src={profile || (user && user.profile) || ''}
                     alt="Current profile"
                     className="w-16 h-16 rounded-full object-cover"
                   />
                 </div>
               )}
             </div>
           </div>
           <button
             onClick={handleSaveChanges}
             className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
           >
             Save Changes
           </button>
         </div>
       );

      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">Start shopping to see your order history here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">#{order._id.slice(-8).toUpperCase()}</h3>
                        <p className="text-gray-600">
                          Ordered on {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{order.items.length} items</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order.totalAmount)}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      {/* Reorder button functionality removed as the hook is deleted */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Appointments</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600">Book an appointment to see your schedule here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <div key={appointment._id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.appointmentTime}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Department:</span> {appointment.department}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {appointment.appointmentType}
                      </p>
                      {appointment.symptoms && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'wishlist':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Wishlist</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading wishlist...</p>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600">Add items to your wishlist to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item: any) => (
                  <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                        <img src={item.productImage[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    <p className="text-blue-600 font-bold mb-3">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(item.price)}
                    </p>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add New Address
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                <p className="text-gray-600">Add an address to see it here.</p>
              </div>
            ) : (
            <div className="space-y-4">
              {addresses.map((address: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{address.type || `Address ${index + 1}`}</h3>
                    {address.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{address.address}</p>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                    {!address.isDefault && (
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">{tabs.find(tab => tab.id === activeTab)?.name}</h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={user?.profile || 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg'}
                alt="User Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">
                  {user?.userName}
                </h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;