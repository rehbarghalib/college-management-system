import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FiPlus, FiSearch, FiTrash2, FiEdit2, FiEye,
  FiDollarSign, FiCalendar, FiUser, FiBook, FiAward,
  FiX, FiCheck, FiRefreshCw
} from 'react-icons/fi';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [studentFeeSummary, setStudentFeeSummary] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingFee, setEditingFee] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [studentTransactions, setStudentTransactions] = useState([]);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  const classOptions = ['1st Year', '2nd Year'];
  const categoryOptions = ['Pre-Medical', 'Pre-Engineering', 'Computer Science'];
  const sectionOptions = ['A', 'B', 'C'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
  
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    month: '',
    year: new Date().getFullYear(),
    paymentMethod: 'Cash',
    paymentFor: 'Monthly',
    notes: ''
  });

  const [summary, setSummary] = useState({
    totalCollected: 0,
    totalTransactions: 0,
    uniqueStudents: 0,
    totalStudents: 0,
    monthlyCollection: {}
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [studentFeeSummary, searchTerm]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all fees
      const feesRes = await api.get('/fees');
      const allFees = feesRes.data.data || [];
      setFees(allFees);
      
      // Fetch all students
      const studentsRes = await api.get('/students');
      const students = studentsRes.data.data || [];
      setAllStudents(students);
      
      // Group fees by student
      const studentMap = {};
      allFees.forEach(fee => {
        const studentId = fee.studentId;
        if (!studentMap[studentId]) {
          studentMap[studentId] = {
            studentId: fee.studentId,
            studentName: fee.studentName || 'Unknown',
            rollNumber: fee.rollNumber || 'N/A',
            class: fee.class || 'N/A',
            category: fee.category || '',
            section: fee.section || '',
            totalPaid: 0,
            totalTransactions: 0,
            payments: [],
            months: new Set()
          };
        }
        studentMap[studentId].totalPaid += fee.amount || 0;
        studentMap[studentId].totalTransactions += 1;
        studentMap[studentId].payments.push(fee);
        if (fee.month) {
          studentMap[studentId].months.add(fee.month);
        }
      });
      
      const summaryArray = Object.values(studentMap);
      setStudentFeeSummary(summaryArray);
      setFilteredStudents(summaryArray);
      
      // Fetch summary
      const summaryRes = await api.get('/fees/summary');
      setSummary(summaryRes.data.data || {
        totalCollected: 0,
        totalTransactions: 0,
        uniqueStudents: 0,
        totalStudents: 0,
        monthlyCollection: {}
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...studentFeeSummary];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.studentName?.toLowerCase().includes(term) ||
        s.rollNumber?.toLowerCase().includes(term)
      );
    }
    
    // Apply class/category/section filters
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    if (selectedSection !== 'all') {
      filtered = filtered.filter(s => s.section === selectedSection);
    }
    
    setFilteredStudents(filtered);
  };

  const fetchStudentTransactions = async (studentId) => {
    try {
      const response = await api.get(`/fees/student/${studentId}/summary`);
      setStudentTransactions(response.data.data.transactions || []);
      setShowStudentDetails(true);
    } catch (error) {
      alert('Error fetching student transactions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      await api.post('/fees', data);
      setShowForm(false);
      setFormData({
        studentId: '',
        amount: '',
        month: '',
        year: new Date().getFullYear(),
        paymentMethod: 'Cash',
        paymentFor: 'Monthly',
        notes: ''
      });
      fetchAllData();
      alert('✅ Fee payment recorded successfully!');
    } catch (error) {
      alert('❌ Error recording fee payment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await api.delete(`/fees/${id}`);
        fetchAllData();
      } catch (error) {
        alert('Error deleting fee record');
      }
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      studentId: fee.studentId || '',
      amount: fee.amount || '',
      month: fee.month || '',
      year: fee.year || new Date().getFullYear(),
      paymentMethod: fee.paymentMethod || 'Cash',
      paymentFor: fee.paymentFor || 'Monthly',
      notes: fee.notes || ''
    });
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      const data = {
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: parseInt(formData.year),
        paymentMethod: formData.paymentMethod,
        paymentFor: formData.paymentFor,
        notes: formData.notes
      };
      await api.put(`/fees/${editingFee._id}`, data);
      setEditingFee(null);
      setFormData({
        studentId: '',
        amount: '',
        month: '',
        year: new Date().getFullYear(),
        paymentMethod: 'Cash',
        paymentFor: 'Monthly',
        notes: ''
      });
      fetchAllData();
      alert('✅ Fee record updated successfully!');
    } catch (error) {
      alert('❌ Error updating fee record');
    }
  };

  const getFilteredStudentsForForm = () => {
    return allStudents.filter(s => {
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (selectedSection !== 'all' && s.section !== selectedSection) return false;
      return true;
    });
  };

  const getStatusBadge = (totalPaid) => {
    if (totalPaid > 0) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-red-100 text-red-700';
  };

  const getStatusText = (totalPaid) => {
    if (totalPaid > 0) {
      return 'Paid';
    }
    return 'Unpaid';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading fees...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">💰 Fee Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-4">
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl font-bold text-gray-800">Rs. {summary.totalCollected?.toLocaleString() || 0}</p>
          <div className="w-full h-1 mt-2 rounded-full bg-yellow-500"></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalTransactions || 0}</p>
          <div className="w-full h-1 mt-2 rounded-full bg-blue-500"></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-4">
          <p className="text-sm text-gray-500">Students Paid</p>
          <p className="text-2xl font-bold text-gray-800">{summary.uniqueStudents || 0}</p>
          <div className="w-full h-1 mt-2 rounded-full bg-green-500"></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-4">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalStudents || 0}</p>
          <div className="w-full h-1 mt-2 rounded-full bg-purple-500"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
          >
            <option value="all">All Classes</option>
            {classOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Total Students: <span className="font-bold text-yellow-600">{filteredStudents.length}</span>
        </div>
      </div>

      {/* Student Fee Summary Table - One Row Per Student */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-yellow-200 text-center">
          <p className="text-gray-500 text-lg font-medium">No fee records found</p>
          <p className="text-gray-400 text-sm mt-2">Click "Record Payment" to add a new fee payment</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Roll</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Class</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Total Paid</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Transactions</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden xl:table-cell">Months</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-yellow-50/50 transition-colors duration-200">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{student.studentName}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-gray-600">{student.rollNumber}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(student.totalPaid)}`}>
                        {getStatusText(student.totalPaid)}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                      <span className="font-semibold text-green-600">Rs. {student.totalPaid.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{student.totalTransactions}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden xl:table-cell">
                      <span className="text-sm text-gray-600">
                        {Array.from(student.months).join(', ')}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          fetchStudentTransactions(student.studentId);
                        }}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors mr-1"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          // Find the first fee record to edit
                          const firstFee = fees.find(f => f.studentId === student.studentId);
                          if (firstFee) handleEdit(firstFee);
                        }}
                        className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 p-1.5 rounded-lg transition-colors mr-1"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          // Delete all fees for this student
                          const studentFees = fees.filter(f => f.studentId === student.studentId);
                          if (window.confirm(`Are you sure you want to delete all ${studentFees.length} fee records for ${student.studentName}?`)) {
                            studentFees.forEach(f => handleDelete(f._id));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Delete All"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border-2 border-yellow-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">💰 Record Fee Payment</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  >
                    <option value="all">All Classes</option>
                    {classOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categoryOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  >
                    <option value="all">All Sections</option>
                    {sectionOptions.map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  <option value="">Select Student</option>
                  {getFilteredStudentsForForm().map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNumber}) - {s.class} | {s.category} | Section {s.section}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter amount"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Any notes about this payment..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-700 transition text-sm font-semibold"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {editingFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border-2 border-blue-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">✏️ Edit Fee Record</h2>
              <button
                onClick={() => {
                  setEditingFee(null);
                  setFormData({
                    studentId: '',
                    amount: '',
                    month: '',
                    year: new Date().getFullYear(),
                    paymentMethod: 'Cash',
                    paymentFor: 'Monthly',
                    notes: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateFee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  Update Record
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFee(null);
                    setFormData({
                      studentId: '',
                      amount: '',
                      month: '',
                      year: new Date().getFullYear(),
                      paymentMethod: 'Cash',
                      paymentFor: 'Monthly',
                      notes: ''
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border-2 border-green-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📊 Fee Details - {selectedStudent.studentName}
              </h2>
              <button
                onClick={() => {
                  setShowStudentDetails(false);
                  setStudentTransactions([]);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-blue-600">Rs. {selectedStudent.totalPaid?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.totalTransactions || 0}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">All Transactions</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {studentTransactions.map((t) => (
                    <div key={t._id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm border border-gray-200">
                      <div>
                        <span className="text-gray-600">{t.month || 'N/A'} {t.year || ''}</span>
                        <span className="text-xs text-gray-400 ml-2">({t.paymentMethod || 'N/A'})</span>
                      </div>
                      <span className="font-semibold text-green-600">Rs. {t.amount || 0}</span>
                      <span className="text-xs text-gray-400">{t.receiptNumber || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowStudentDetails(false);
                  setStudentTransactions([]);
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;