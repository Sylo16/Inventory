import React, { useState } from 'react';
import Breadcrumb from "../../components/breadcrumbs";
import Header from "../../layouts/header";
import Sidemenu from "../../layouts/sidemenu";
import { 
  Edit2, User, Mail, Camera, Loader2, Check, X,
  Phone, Calendar, MapPin, Globe 
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

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
  profileImage?: string;
};

const AdminProfile: React.FC = () => {
  const { user: contextUser, updateUser } = useUser();
  
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
  };

  const [admin, setAdmin] = useState<Admin>(mockAdmin);
  const [editing, setEditing] = useState(false);
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
    const { name, value } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="main-content app-content p-3 sm:p-5 animate-slideInUp">
        <div className="container-fluid">
          <Breadcrumb title="Admin Profile" links={[{ text: "Dashboard", link: "/dashboard" }]} active="Admin Profile" />
          
          <div className="min-h-screen bg-neutral-50">
            {/* Toast Notification */}
            {toast.show && (
              <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-construction z-50 transform transition-all ${
                toast.type === 'success' 
                  ? 'bg-success text-white' 
                  : 'bg-danger text-white'
              }`}>
                <div className="flex items-center gap-2">
                  {toast.type === 'success' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                  <span className="font-medium">{toast.message}</span>
                </div>
              </div>
            )}

            <div className="max-w-6xl mx-auto py-6 px-2 p-4 sm:p-6">
              <div className="bg-white rounded-xl shadow-construction border border-construction-light/20 overflow-hidden p-4 sm:p-6">
                {/* Profile Header */}
                <div className="bg-construction-gradient p-6 sm:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                  
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-construction-light flex items-center justify-center flex-shrink-0">
                        {imagePreview || admin.profileImage ? (
                          <img 
                            src={imagePreview || admin.profileImage || ''} 
                            alt={admin.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-construction-dark text-4xl font-bold">
                            {getInitials(admin.name)}
                          </span>
                        )}
                      </div>
                      <div className="text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-1">{admin.name}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                          <User size={16} />
                          <span className="text-sm font-medium">{admin.role}</span>
                        </div>
                      </div>
                    </div>
                    {!editing && (
                      <button 
                        onClick={() => setEditing(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-construction rounded-lg font-semibold hover:bg-construction-light hover:text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 self-center md:self-auto"
                      >
                        <Edit2 size={18} />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Column - Profile Image */}
                    <div className="flex flex-col items-center lg:w-1/3">
                      <div className="relative group w-full max-w-xs">
                        <div className="h-64 w-64 rounded-xl border-4 border-construction-light/30 shadow-construction overflow-hidden bg-construction-light/10 flex items-center justify-center mx-auto">
                          {imagePreview || admin.profileImage ? (
                            <img 
                              src={imagePreview || admin.profileImage || ''} 
                              alt={admin.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-construction text-6xl font-bold">
                              {getInitials(admin.name)}
                            </span>
                          )}
                        </div>
                        {editing && (
                          <label 
                            htmlFor="profileImage"
                            className="absolute inset-0 bg-construction/80 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Camera className="text-white h-12 w-12 mb-2" />
                            <span className="text-white font-medium text-sm">Click to change photo</span>
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
                        <div className="mt-4 p-3 bg-construction-light/10 rounded-lg border border-construction-light/30">
                          <p className="text-sm text-construction-dark text-center font-medium">
                            📷 Hover over the image to change your profile photo
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="flex-1">
                      {editing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-construction mb-2 flex items-center gap-2">
                              <Edit2 className="h-5 w-5" />
                              Edit Your Information
                            </h3>
                            <p className="text-neutral-600 text-sm">Update your profile details below</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="md:col-span-2 sm:md:col-span-1">
                              <label className="block text-sm font-semibold text-construction-dark mb-2 flex items-center gap-2">
                                <User size={16} />
                                Full Name <span className="text-danger">*</span>
                              </label>
                              <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border-2 border-construction-light/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all"
                                placeholder="Enter your full name"
                              />
                            </div>
                            <div className="md:col-span-2 sm:md:col-span-1">
                              <label className="block text-sm font-semibold text-construction-dark mb-2 flex items-center gap-2">
                                <Mail size={16} />
                                Email Address <span className="text-danger">*</span>
                              </label>
                              <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border-2 border-construction-light/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all"
                                placeholder="your.email@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-construction-dark mb-2 flex items-center gap-2">
                                <Phone size={16} />
                                Phone Number
                              </label>
                              <input
                                name="phone"
                                type="tel"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-construction-light/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all"
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-construction-dark mb-2 flex items-center gap-2">
                                <MapPin size={16} />
                                Location
                              </label>
                              <input
                                name="location"
                                type="text"
                                value={formData.location || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-construction-light/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all"
                                placeholder="City, State/Country"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-construction-dark mb-2 flex items-center gap-2">
                                <Globe size={16} />
                                Website
                              </label>
                              <input
                                name="website"
                                type="url"
                                value={formData.website || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-construction-light/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all"
                                placeholder="www.example.com"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-construction-dark mb-2 flex items-center gap-2">
                                <User size={16} />
                                Bio
                              </label>
                              <textarea
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-construction-light/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-construction focus:border-construction transition-all resize-none"
                                placeholder="Tell us about yourself..."
                              />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-construction-light/20">
                            <button 
                              type="submit" 
                              disabled={isLoading}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-construction-gradient text-white rounded-lg font-semibold shadow-construction hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin h-5 w-5" />
                                  <span>Saving Changes...</span>
                                </>
                              ) : (
                                <>
                                  <Check size={20} />
                                  <span>Save Changes</span>
                                </>
                              )}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditing(false);
                                setImagePreview(null);
                                setFormData(admin);
                              }}
                              disabled={isLoading}
                              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-construction-light bg-white text-construction-dark rounded-lg font-semibold hover:bg-construction-light/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X size={20} />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-6">
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-construction mb-2">Profile Information</h3>
                            <p className="text-neutral-600 text-sm">View your profile details</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="p-4 bg-construction-light/5 rounded-lg border-l-4 border-construction">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-construction-light/20 rounded-lg">
                                  <User className="text-construction h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-construction-dark uppercase tracking-wide mb-1">Full Name</p>
                                  <p className="text-lg font-bold text-neutral-800">{admin.name}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-construction-light/5 rounded-lg border-l-4 border-construction">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-construction-light/20 rounded-lg">
                                  <Mail className="text-construction h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-construction-dark uppercase tracking-wide mb-1">Email Address</p>
                                  <p className="text-lg font-bold text-neutral-800 break-all">{admin.email}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-construction-light/5 rounded-lg border-l-4 border-construction">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-construction-light/20 rounded-lg">
                                  <Phone className="text-construction h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-construction-dark uppercase tracking-wide mb-1">Phone</p>
                                  <p className="text-lg font-bold text-neutral-800">{admin.phone || 'Not provided'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-construction-light/5 rounded-lg border-l-4 border-construction">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-construction-light/20 rounded-lg">
                                  <Calendar className="text-construction h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-construction-dark uppercase tracking-wide mb-1">Join Date</p>
                                  <p className="text-lg font-bold text-neutral-800">{admin.joinDate || 'Unknown'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-construction-light/5 rounded-lg border-l-4 border-construction">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-construction-light/20 rounded-lg">
                                  <MapPin className="text-construction h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-construction-dark uppercase tracking-wide mb-1">Location</p>
                                  <p className="text-lg font-bold text-neutral-800">{admin.location || 'Not specified'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-construction-light/5 rounded-lg border-l-4 border-construction">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-construction-light/20 rounded-lg">
                                  <Globe className="text-construction h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-construction-dark uppercase tracking-wide mb-1">Website</p>
                                  <p className="text-lg font-bold text-neutral-800">
                                    {admin.website ? (
                                      <a href={`https://${admin.website}`} target="_blank" rel="noopener noreferrer" className="text-construction hover:text-construction-dark hover:underline transition-colors">
                                        {admin.website}
                                      </a>
                                    ) : 'None'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {admin.bio && (
                            <div className="mt-6 p-6 bg-construction-light/5 rounded-lg border-l-4 border-construction">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-construction-light/20 rounded-lg">
                                  <User className="text-construction h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-construction-dark uppercase tracking-wide mb-2">About Me</p>
                                  <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{admin.bio}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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