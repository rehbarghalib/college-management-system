import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { FiEdit2, FiTrash2, FiUser, FiCamera, FiMail, FiPhone, FiBook, FiBriefcase, FiCalendar, FiDollarSign, FiAward } from 'react-icons/fi';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfJoining: '',
    qualification: '',
    specialization: '',
    experience: 0,
    subjects: '',
    classes: '',
    salary: '',
    role: 'Teacher',
    profileImage: '',
    address: {
      city: ''
    }
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if dateOfJoining is provided
      if (!formData.dateOfJoining) {
        alert('Please select a date of joining');
        return;
      }

      let profileImageUrl = formData.profileImage;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', imageFile);
        
        const uploadRes = await api.post('/teachers/upload-image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadRes.data.success) {
          profileImageUrl = uploadRes.data.data.imageUrl;
        }
      }

      const data = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfJoining: formData.dateOfJoining,
        qualification: formData.qualification,
        specialization: formData.specialization || '',
        experience: parseInt(formData.experience) || 0,
        subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()).filter(s => s) : [],
        classes: formData.classes ? formData.classes.split(',').map(c => c.trim()).filter(c => c) : [],
        salary: parseInt(formData.salary) || 0,
        role: formData.role || 'Teacher',
        profileImage: profileImageUrl,
        address: {
          city: formData.address?.city || ''
        }
      };

      console.log('📤 Sending data:', data);

      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher._id}`, data);
      } else {
        await api.post('/teachers', data);
      }
      
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error saving teacher');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
    setImagePreview(null);
    setImageFile(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dateOfJoining: '',
      qualification: '',
      specialization: '',
      experience: 0,
      subjects: '',
      classes: '',
      salary: '',
      role: 'Teacher',
      profileImage: '',
      address: {
        city: ''
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/teachers/${id}`);
        fetchTeachers();
      } catch (error) {
        alert('Error deleting teacher');
      }
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      gender: teacher.gender,
      dateOfJoining: teacher.dateOfJoining?.split('T')[0] || '',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || '',
      experience: teacher.experience || 0,
      subjects: teacher.subjects?.join(', ') || '',
      classes: teacher.classes?.join(', ') || '',
      salary: teacher.salary || '',
      role: teacher.role || 'Teacher',
      profileImage: teacher.profileImage || '',
      address: {
        city: teacher.address?.city || ''
      }
    });
    setImagePreview(teacher.profileImage || null);
    setShowForm(true);
  };

  const handleCardClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowProfile(true);
  };

  const closeProfile = () => {
    setShowProfile(false);
    setSelectedTeacher(null);
  };

  // Get role badge color
  const getRoleColor = (role) => {
    switch(role) {
      case 'Principal': return 'bg-purple-100 text-purple-700';
      case 'Vice Principal': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👨‍🏫 Teacher Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 duration-200"
        >
          + Add New Teacher
        </button>
      </div>

      {/* Teacher Cards Grid */}
      {teachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">No teachers added yet.</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add New Teacher" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              onClick={() => handleCardClick(teacher)}
              className="bg-white rounded-xl shadow-sm border-2 border-blue-200 overflow-hidden hover:shadow-2xl hover:border-blue-500 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:shadow-blue-100"
            >
              {/* Card Header - Image */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                {teacher.profileImage ? (
                  <img
                    src={teacher.profileImage}
                    alt={teacher.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white transform group-hover:scale-105 transition-transform duration-300">
                    <FiUser className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(teacher);
                    }}
                    className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-all hover:scale-110"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
                {/* Role Badge on Image */}
                <div className="absolute bottom-2 left-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shadow-md ${getRoleColor(teacher.role)}`}>
                    {teacher.role || 'Teacher'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg truncate group-hover:text-blue-600 transition-colors duration-200">
                  {teacher.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">{teacher.qualification}</p>
                
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200">
                    <FiMail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200">
                    <FiPhone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiBook className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{teacher.subjects.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                  {teacher.salary > 0 && (
                    <div className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors duration-200">
                      <FiDollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Rs.{teacher.salary.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {teacher.experience || 0} years exp.
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(teacher._id);
                    }}
                    className="text-red-400 hover:text-red-600 transition-all hover:scale-110"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Teacher"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <FiUser className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 text-white hover:bg-blue-700 transition transform hover:scale-110"
                  >
                    <FiCamera className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upload Teacher Photo</p>
                  <p className="text-xs text-gray-400">JPG, PNG, GIF (Max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="date"
                  placeholder="Date of Joining"
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Qualification *"
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <input
                  type="number"
                  placeholder="Experience (years)"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <input
                  type="text"
                  placeholder="Subjects (comma separated)"
                  value={formData.subjects}
                  onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <input
                  type="text"
                  placeholder="Classes (comma separated)"
                  value={formData.classes}
                  onChange={(e) => setFormData({...formData, classes: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <input
                  type="number"
                  placeholder="Salary (Rs.) *"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Principal">Principal</option>
                   <option value="Principal">Clerk</option>
                  <option value="Vice Principal">Vice Principal</option>
                </select>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 duration-200"
                >
                  {editingTeacher ? 'Update Teacher' : 'Save Teacher'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition transform hover:scale-105 duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Profile Modal */}
      {showProfile && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center relative">
              <button
                onClick={closeProfile}
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl transition-transform hover:rotate-90 duration-200"
              >
                ✕
              </button>
              {selectedTeacher.profileImage ? (
                <img
                  src={selectedTeacher.profileImage}
                  alt={selectedTeacher.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mx-auto hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-white mx-auto">
                  <FiUser className="w-14 h-14 text-white" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mt-4">{selectedTeacher.name}</h2>
              <p className="text-blue-100">{selectedTeacher.role || 'Teacher'}</p>
            </div>

            {/* Profile Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FiMail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedTeacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FiPhone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{selectedTeacher.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FiAward className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Qualification</p>
                    <p className="text-sm font-medium">{selectedTeacher.qualification}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FiBook className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Specialization</p>
                    <p className="text-sm font-medium">{selectedTeacher.specialization || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FiBriefcase className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium">{selectedTeacher.experience || 0} years</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Salary</p>
                    <p className="text-sm font-medium">Rs.{selectedTeacher.salary?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FiCalendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Date of Joining</p>
                    <p className="text-sm font-medium">
                      {selectedTeacher.dateOfJoining ? new Date(selectedTeacher.dateOfJoining).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FiUser className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium">{selectedTeacher.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Subjects and Classes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <p className="text-xs text-gray-500">Subjects</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTeacher.subjects?.map((subject, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <p className="text-xs text-gray-500">Classes</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTeacher.classes?.map((cls, index) => (
                      <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedTeacher.address?.city && (
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <p className="text-xs text-gray-500">City</p>
                  <p className="text-sm font-medium">{selectedTeacher.address.city}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    closeProfile();
                    handleEdit(selectedTeacher);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 duration-200"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedTeacher._id);
                    closeProfile();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition transform hover:scale-105 duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;