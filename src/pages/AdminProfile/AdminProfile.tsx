import React, { useState, useContext } from 'react';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { 
  Edit2, User, Mail, Shield, Camera, Loader2, Check, X, 
  Lock, Phone, Calendar, MapPin, Globe, CreditCard, Bell 
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext'; // Adjust the import path as needed

type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  joinDate?: string;
  location?: string;
  website?: string;
  bio?: string;
  notificationsEnabled?: boolean;
  twoFactorEnabled?: boolean;
  profileImage?: string;
};

const AdminProfile: React.FC = () => {
  const { user: contextUser, updateUser } = useUser();
  
  // Convert the context user to our Admin type with additional fields
  const mockAdmin: Admin = {
    id: contextUser.id,
    name: contextUser.name,
    email: contextUser.email,
    role: contextUser.role,
    profileImage: contextUser.profileImage,
    phone: '+1 (555) 123-4567',
    joinDate: '2022-05-15',
    location: 'San Francisco, CA',
    website: 'example.com',
    bio: 'Experienced system administrator with 5+ years managing enterprise infrastructure.',
    notificationsEnabled: true,
    twoFactorEnabled: false,
  };

  const [admin, setAdmin] = useState<Admin>(mockAdmin);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<Admin>(mockAdmin);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false, 
    message: '', 
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({show: true, message, type});
    setTimeout(() => setToast({...toast, show: false}), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, profileImage: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedAdmin = formData;
      setAdmin(updatedAdmin);
      
      // Update the context user with the new data
      updateUser({
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        profileImage: updatedAdmin.profileImage
      });
      
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
      setIsLoading(false);
    }, 1000);
  };

  const toggleTwoFactor = () => {
    const updated = {
      ...admin,
      twoFactorEnabled: !admin.twoFactorEnabled
    };
    setAdmin(updated);
    showToast(
      `Two-factor authentication ${!admin.twoFactorEnabled ? 'enabled' : 'disabled'}`,
      'success'
    );
  };

  const toggleNotifications = () => {
    const updated = {
      ...admin,
      notificationsEnabled: !admin.notificationsEnabled
    };
    setAdmin(updated);
    showToast(
      `Notifications ${!admin.notificationsEnabled ? 'enabled' : 'disabled'}`,
      'success'
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
    <Header />
        <Sidemenu />
          <div className="main-content app-content p-6">
            <div className="container-fluid">
              <Breadcrumb title="Profile Status" links={[{ text: "Profile Status", link: "/dashboard" }]} active="Dashboard" />
              
            <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
                toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {toast.message}
                </div>
            )}

            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                        {imagePreview || admin.profileImage ? (
                            <img 
                            src={imagePreview || admin.profileImage || ''} 
                            alt={admin.name}
                            className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-blue-600 text-3xl font-medium">
                            {getInitials(admin.name)}
                            </span>
                        )}
                        </div>
                        <div>
                        <h2 className="text-2xl font-bold">{admin.name}</h2>
                        <p className="text-blue-100">{admin.role}</p>
                        </div>
                    </div>
                    {!editing && (
                        <button 
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors self-start md:self-auto"
                        >
                        <Edit2 size={16} />
                        Edit Profile
                        </button>
                    )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Profile Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'preferences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Preferences
                    </button>
                    </nav>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                    {activeTab === 'profile' && (
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Column - Profile Image */}
                        <div className="flex flex-col items-center md:w-1/3">
                        <div className="relative group w-full max-w-xs">
                            <div className="h-64 w-64 rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center mx-auto">
                            {imagePreview || admin.profileImage ? (
                                <img 
                                src={imagePreview || admin.profileImage || ''} 
                                alt={admin.name}
                                className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-5xl font-medium">
                                {getInitials(admin.name)}
                                </span>
                            )}
                            </div>
                            {editing && (
                            <label 
                                htmlFor="profileImage"
                                className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="text-white h-8 w-8" />
                                <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                />
                            </label>
                            )}
                        </div>
                        {editing && (
                            <p className="text-sm text-gray-500 mt-2">Click image to change</p>
                        )}
                        </div>

                        {/* Right Column - Profile Details */}
                        <div className="flex-1">
                        {editing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    name="location"
                                    type="text"
                                    value={formData.location || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                </div>
                                <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    name="website"
                                    type="url"
                                    value={formData.website || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                </div>
                                <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                type="submit" 
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    <Check size={16} />
                                )}
                                Save Changes
                                </button>
                                <button 
                                type="button" 
                                onClick={() => {
                                    setEditing(false);
                                    setImagePreview(null);
                                    setFormData(admin);
                                }}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                <X size={16} />
                                Cancel
                                </button>
                            </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                <User className="text-gray-400 h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="text-lg font-medium">{admin.name}</p>
                                </div>
                                </div>
                                <div className="flex items-start gap-3">
                                <Mail className="text-gray-400 h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="text-lg font-medium">{admin.email}</p>
                                </div>
                                </div>
                                <div className="flex items-start gap-3">
                                <Phone className="text-gray-400 h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-lg font-medium">{admin.phone || 'Not provided'}</p>
                                </div>
                                </div>
                                <div className="flex items-start gap-3">
                                <Calendar className="text-gray-400 h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Join Date</p>
                                    <p className="text-lg font-medium">{admin.joinDate || 'Unknown'}</p>
                                </div>
                                </div>
                                <div className="flex items-start gap-3">
                                <MapPin className="text-gray-400 h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="text-lg font-medium">{admin.location || 'Not specified'}</p>
                                </div>
                                </div>
                                <div className="flex items-start gap-3">
                                <Globe className="text-gray-400 h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Website</p>
                                    <p className="text-lg font-medium">
                                    {admin.website ? (
                                        <a href={`https://${admin.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {admin.website}
                                        </a>
                                    ) : 'None'}
                                    </p>
                                </div>
                                </div>
                            </div>
                            {admin.bio && (
                                <div className="flex items-start gap-3">
                                <div className="pt-1">
                                    <User className="text-gray-400 h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Bio</p>
                                    <p className="text-gray-700 whitespace-pre-line">{admin.bio}</p>
                                </div>
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                    </div>
                    )}

                    {activeTab === 'security' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-gray-500" />
                            Account Security
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-500">
                                {admin.twoFactorEnabled 
                                    ? 'Enabled - Extra security for your account' 
                                    : 'Disabled - Add an extra layer of security'}
                                </p>
                            </div>
                            <button
                                onClick={toggleTwoFactor}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                admin.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    admin.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                                />
                            </button>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                                <h4 className="font-medium">Change Password</h4>
                                <p className="text-sm text-gray-500">Update your account password</p>
                            </div>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">
                                Change Password
                            </button>
                            </div>
                        </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            Active Sessions
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium">Chrome on Windows</p>
                                <p className="text-sm text-gray-500">San Francisco, CA • Last active 2 hours ago</p>
                            </div>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                Logout
                            </button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium">Safari on iPhone</p>
                                <p className="text-sm text-gray-500">New York, NY • Last active 3 days ago</p>
                            </div>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                Logout
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}

                    {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Bell className="h-5 w-5 text-gray-500" />
                            Notification Preferences
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Email Notifications</h4>
                                <p className="text-sm text-gray-500">
                                {admin.notificationsEnabled 
                                    ? 'Enabled - Receive email notifications' 
                                    : 'Disabled - No email notifications'}
                                </p>
                            </div>
                            <button
                                onClick={toggleNotifications}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                admin.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    admin.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                                />
                            </button>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                                <h4 className="font-medium">System Notifications</h4>
                                <p className="text-sm text-gray-500">Receive in-app notifications</p>
                            </div>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">
                                Configure
                            </button>
                            </div>
                        </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-gray-500" />
                            Privacy Settings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Public Profile</h4>
                                <p className="text-sm text-gray-500">Make your profile visible to others</p>
                            </div>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">
                                Configure
                            </button>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                                <h4 className="font-medium">Data Sharing</h4>
                                <p className="text-sm text-gray-500">Control how your data is shared</p>
                            </div>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">
                                Configure
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>
            </div>
    </div>
    </div>
    </>
  );
};

export default AdminProfile;