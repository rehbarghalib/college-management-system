import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FiEdit2, FiTrash2, FiUser, FiCamera, FiPhone, FiUsers, 
  FiBook, FiSearch, FiFileText, FiDownload, FiX,
  FiUserPlus, FiMail, FiMapPin, FiAward, FiCalendar
} from 'react-icons/fi';
import * as XLSX from 'xlsx';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');
  const [sessionOptions, setSessionOptions] = useState([]);
  const fileInputRef = useRef(null);

  // Class options
  const classOptions = ['1st Year', '2nd Year'];
  const categoryOptions = ['Pre-Medical', 'Pre-Engineering', 'Computer Science'];
  const sectionOptions = ['A', 'B', 'C'];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fatherName: '',
    class: '1st Year',
    category: 'Pre-Medical',
    section: 'A',
    rollNumber: '',
    session: '',
    address: {
      village: ''
    },
    profileImage: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedClass, selectedCategory, selectedSection, selectedSession]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      const allStudents = response.data.data;
      setStudents(allStudents);
      setFilteredStudents(allStudents);
      
      // ✅ Extract unique sessions
      const uniqueSessions = [...new Set(allStudents.map(s => s.session).filter(s => s && s.trim() !== ''))];
      console.log('📋 Unique Sessions from DB:', uniqueSessions);
      setSessionOptions(uniqueSessions);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Filter by Class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }

    // Filter by Category
    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by Section
    if (selectedSection) {
      filtered = filtered.filter(s => s.section === selectedSection);
    }

    // Filter by Session
    if (selectedSession !== 'all') {
      filtered = filtered.filter(s => s.session === selectedSession);
    }

    // Search - Only if searchTerm has at least 1 character
    if (searchTerm && searchTerm.trim().length > 0) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(s => {
        const nameMatch = s.name?.toLowerCase().includes(term);
        const fatherMatch = s.fatherName?.toLowerCase().includes(term);
        const rollMatch = String(s.rollNumber).includes(term);
        return nameMatch || fatherMatch || rollMatch;
      });
    }

    // Sort by Roll Number (numeric)
    filtered.sort((a, b) => {
      const numA = parseInt(a.rollNumber) || 0;
      const numB = parseInt(b.rollNumber) || 0;
      return numA - numB;
    });

    setFilteredStudents(filtered);
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
      let profileImageUrl = formData.profileImage;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', imageFile);
        
        const uploadRes = await api.post('/students/upload-image', imageFormData, {
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
        phone: parseInt(formData.phone),
        fatherName: formData.fatherName,
        class: formData.class,
        category: formData.category,
        section: formData.section,
        rollNumber: parseInt(formData.rollNumber),
        session: formData.session,
        address: {
          village: formData.address.village || ''
        },
        profileImage: profileImageUrl
      };

      console.log('📤 Sending data:', data);

      // Check for duplicate roll number
      const existingStudents = await api.get('/students');
      const duplicate = existingStudents.data.data.find(s => 
        s.rollNumber === data.rollNumber &&
        s.class === data.class &&
        s.category === data.category &&
        s.section === data.section &&
        (editingStudent ? s._id !== editingStudent._id : true)
      );

      if (duplicate) {
        alert(`Roll number "${data.rollNumber}" already exists in ${data.class} - ${data.category} - Section ${data.section}`);
        return;
      }

      let saveResponse;
      if (editingStudent) {
        saveResponse = await api.put(`/students/${editingStudent._id}`, data);
      } else {
        saveResponse = await api.post('/students', data);
      }
      
      console.log('✅ Save response:', saveResponse.data);
      
      resetForm();
      
      // ✅ Fetch fresh data and update everything
      const freshResponse = await api.get('/students');
      const freshStudents = freshResponse.data.data;
      setStudents(freshStudents);
      
      // ✅ Extract unique sessions from fresh data
      const freshSessions = [...new Set(freshStudents.map(s => s.session).filter(s => s && s.trim() !== ''))];
      console.log('📋 Updated Sessions after adding:', freshSessions);
      setSessionOptions(freshSessions);
      
      // ✅ Re-apply filters
      filterStudents();
      
      alert(editingStudent ? 'Student updated successfully!' : 'Student added successfully!');
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error saving student');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    setImagePreview(null);
    setImageFile(null);
    setFormData({
      name: '',
      phone: '',
      fatherName: '',
      class: '1st Year',
      category: 'Pre-Medical',
      section: 'A',
      rollNumber: '',
      session: '',
      address: {
        village: ''
      },
      profileImage: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (error) {
        alert('Error deleting student');
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      phone: student.phone || '',
      fatherName: student.fatherName,
      class: student.class,
      category: student.category,
      section: student.section,
      rollNumber: student.rollNumber || '',
      session: student.session || '',
      address: {
        village: student.address?.village || ''
      },
      profileImage: student.profileImage || ''
    });
    setImagePreview(student.profileImage || null);
    setShowForm(true);
  };

  const generateExcel = () => {
    if (filteredStudents.length === 0) {
      alert('No students to export');
      return;
    }

    const data = filteredStudents.map(s => ({
      'Roll Number': s.rollNumber,
      'Name': s.name,
      'Father Name': s.fatherName,
      'Phone': s.phone,
      'Class': s.class,
      'Category': s.category,
      'Section': s.section,
      'Session': s.session,
      'Village': s.address?.village || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    const fileName = `Students_${selectedClass}_${selectedCategory || 'All'}_${selectedSection || 'All'}_${selectedSession || 'All'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getSectionColor = (section) => {
    switch(section) {
      case 'A': return 'bg-green-100 text-green-700';
      case 'B': return 'bg-blue-100 text-blue-700';
      case 'C': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Pre-Medical': return 'bg-red-100 text-red-700';
      case 'Pre-Engineering': return 'bg-blue-100 text-blue-700';
      case 'Computer Science': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">👨‍🎓</span> Student Management
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={generateExcel}
            className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
          >
            <FiUserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
            >
              <option value="all">All Classes</option>
              {classOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
            >
              <option value="">All Sections</option>
              {sectionOptions.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
            >
              <option value="all">All Sessions</option>
              {sessionOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Search</label>
            <div className="relative mt-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, father or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center flex-wrap gap-2">
          <span className="text-sm text-gray-600">
            Total Students: <span className="font-bold text-blue-600">{filteredStudents.length}</span>
          </span>
          <span className="text-xs text-gray-400">
            {selectedClass !== 'all' ? `Class: ${selectedClass}` : 'Showing all classes'}
            {selectedSession !== 'all' ? ` | Session: ${selectedSession}` : ''}
          </span>
        </div>
      </div>

      {/* Table View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 border border-gray-200 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 text-lg font-medium">No students found.</p>
          <p className="text-gray-400 text-sm mt-2">Try changing filters or add a new student.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Photo</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roll No</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Father</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Class</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Category</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Section</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden 2xl:table-cell">Session</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-3 py-3 whitespace-nowrap">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-blue-600">{student.rollNumber}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{student.name}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600 text-sm hidden md:table-cell">{student.fatherName}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600 text-sm hidden sm:table-cell">{student.phone}</td>
                    <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden xl:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(student.category)}`}>
                        {student.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSectionColor(student.section)}`}>
                        {student.section}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden 2xl:table-cell">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {student.session}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors mr-1"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <div key={student._id} className="p-4 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{student.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                    <p className="text-xs text-gray-500">Father: {student.fatherName}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {student.class}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(student.category)}`}>
                        {student.category}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSectionColor(student.section)}`}>
                        {student.section}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {student.session}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingStudent ? '✏️ Edit Student' : '➕ Add New Student'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Student"
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-300"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-300">
                      <FiUser className="w-10 h-10 text-blue-500" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 text-white hover:bg-blue-700 transition shadow-lg"
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
                  <p className="text-sm font-medium text-gray-700">Upload Student Photo</p>
                  <p className="text-xs text-gray-400">JPG, PNG, GIF (Max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Father Name *</label>
                  <input
                    type="text"
                    placeholder="Enter father name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="number"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Roll Number *</label>
                  <input
                    type="number"
                    placeholder="Enter roll number"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                    required
                  >
                    {classOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                    required
                  >
                    {categoryOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                    required
                  >
                    {sectionOptions.map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
                <div>
  <label className="text-sm font-medium text-gray-700">Session</label>
  <input
    type="text"
    placeholder="e.g., 2024-2025"
    value={formData.session}
    onChange={(e) => setFormData({...formData, session: e.target.value})}
    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
  />
  <p className="text-xs text-gray-400 mt-1">Format: YYYY-YYYY (e.g., 2024-2025)</p>
</div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Village Name</label>
                  <input
                    type="text"
                    placeholder="Enter village name"
                    value={formData.address.village}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, village: e.target.value}})}
                    className="w-full px-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-semibold shadow-sm"
                >
                  {editingStudent ? 'Update Student' : 'Save Student'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;