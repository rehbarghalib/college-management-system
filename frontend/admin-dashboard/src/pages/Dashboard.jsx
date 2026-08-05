import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  CurrencyRupeeIcon, 
  BellIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  UserPlusIcon,
  ClockIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    fees: 0,
    applications: 0,
    totalFees: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [classData, setClassData] = useState({});
  const [sectionData, setSectionData] = useState({});
  const [showRecentStudents, setShowRecentStudents] = useState(true);
  const [showRecentTeachers, setShowRecentTeachers] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel with proper error handling
      const [teachersRes, studentsRes, feesRes, applicationsRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/students'),
        api.get('/fees/summary').catch(() => ({ data: { data: { totalCollected: 0 } } })),
        api.get('/applications').catch(() => ({ data: { data: [] } }))
      ]);

      const teachers = teachersRes.data.data || [];
      const students = studentsRes.data.data || [];
      
      // ✅ Fix: Get totalCollected from feesRes
      const feesData = feesRes.data.data || {};
      const totalFees = feesData.totalCollected || feesData.totalPaid || 0;
      const applications = applicationsRes.data.data || [];

      // ✅ Get date 2 hours ago
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const recentStudentsData = [...students]
        .filter(s => new Date(s.createdAt) >= twoHoursAgo)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      const recentTeachersData = [...teachers]
        .filter(t => new Date(t.createdAt) >= twoHoursAgo)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      const totalStudents = students.length;
      const totalTeachers = teachers.length;

      // ✅ Class Distribution
      const classDistribution = {};
      students.forEach(s => {
        const key = `${s.class} - ${s.category}`;
        classDistribution[key] = (classDistribution[key] || 0) + 1;
      });

      // ✅ Section Distribution
      const sectionDistribution = { A: 0, B: 0, C: 0 };
      students.forEach(s => {
        if (s.section && sectionDistribution[s.section] !== undefined) {
          sectionDistribution[s.section]++;
        }
      });

      setStats({
        teachers: totalTeachers,
        students: totalStudents,
        fees: totalFees,
        applications: applications.length,
        totalFees: totalFees
      });

      setRecentStudents(recentStudentsData);
      setRecentTeachers(recentTeachersData);
      setClassData(classDistribution);
      setSectionData(sectionDistribution);
      setLastUpdated(new Date());

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const toggleRecentStudents = () => {
    setShowRecentStudents(!showRecentStudents);
  };

  const toggleRecentTeachers = () => {
    setShowRecentTeachers(!showRecentTeachers);
  };

  const dismissStudent = (studentId) => {
    setRecentStudents(recentStudents.filter(s => s._id !== studentId));
  };

  const dismissTeacher = (teacherId) => {
    setRecentTeachers(recentTeachers.filter(t => t._id !== teacherId));
  };

  const clearAllStudents = () => {
    if (window.confirm('Are you sure you want to clear all recent students?')) {
      setRecentStudents([]);
    }
  };

  const clearAllTeachers = () => {
    if (window.confirm('Are you sure you want to clear all recent teachers?')) {
      setRecentTeachers([]);
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  // ✅ Class Chart Data
  const classChartData = {
    labels: Object.keys(classData).length > 0 ? Object.keys(classData) : ['No Data'],
    datasets: [
      {
        label: 'Number of Students',
        data: Object.keys(classData).length > 0 ? Object.values(classData) : [0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(14, 165, 233)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // ✅ Section Chart Data
  const sectionChartData = {
    labels: Object.keys(sectionData).filter(k => sectionData[k] > 0),
    datasets: [{
      data: Object.values(sectionData).filter(v => v > 0),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
      ],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          padding: 15,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          padding: 15,
        },
      },
    },
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.students,
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/students',
      change: `+${stats.students > 0 ? Math.round((stats.students / (stats.students + 10)) * 100) : 0}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Teachers',
      value: stats.teachers,
      icon: UsersIcon,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/teachers',
      change: `+${stats.teachers > 0 ? Math.round((stats.teachers / (stats.teachers + 5)) * 100) : 0}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Fee Collection',
      value: `Rs. ${stats.totalFees.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'from-yellow-500 to-yellow-600',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/fees',
      change: `+${stats.totalFees > 0 ? Math.round((stats.totalFees / (stats.totalFees + 1000)) * 100) : 0}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Applications',
      value: stats.applications,
      icon: BellIcon,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/applications',
      change: `+${stats.applications > 0 ? Math.round((stats.applications / (stats.applications + 5)) * 100) : 0}%`,
      changeColor: 'text-green-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to Quantum Group</h1>
            <p className="text-blue-100 mt-1 text-sm">
              Manage your school efficiently from one place
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-xs text-blue-200">
                Updated: {timeAgo(lastUpdated)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 border-2 border-blue-200 hover:border-blue-400 group transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.lightColor} p-3 rounded-xl shadow-sm`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-blue-600 group-hover:text-blue-800 font-medium">View Details →</span>
                <span className={`text-xs font-medium ${card.changeColor} bg-green-50 px-2 py-0.5 rounded-full`}>
                  {card.change}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-5 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-base font-semibold text-gray-900 mb-3">📊 Class Distribution</h3>
          <div className="h-64">
            <Bar data={classChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-5 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-base font-semibold text-gray-900 mb-3">📈 Section Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              {Object.keys(sectionData).filter(k => sectionData[k] > 0).length > 0 ? (
                <Doughnut data={sectionChartData} options={doughnutOptions} />
              ) : (
                <div className="text-gray-400 text-center">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-5 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              👨‍🎓 Recent Students 
              <span className="text-xs font-normal text-gray-400 ml-2">
                (Last 2 hours)
              </span>
            </h3>
            <div className="flex items-center space-x-2">
              {showRecentStudents && recentStudents.length > 0 && (
                <button
                  onClick={clearAllStudents}
                  className="text-xs text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={toggleRecentStudents}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center space-x-1"
              >
                {showRecentStudents ? (
                  <>
                    <EyeSlashIcon className="w-3 h-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-3 h-3" />
                    <span>Show</span>
                  </>
                )}
              </button>
              <Link to="/students" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
          </div>
          {!showRecentStudents ? (
            <p className="text-gray-400 text-sm text-center py-4">Recent students hidden. Click "Show" to display.</p>
          ) : recentStudents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">No recent student activity</p>
              <p className="text-gray-300 text-xs mt-1">No students added in the last 2 hours</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentStudents.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 hover:border-blue-200 group">
                  <div className="flex items-center space-x-3">
                    {student.profileImage ? (
                      <img 
                        src={student.profileImage} 
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlusIcon className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">Roll: {student.rollNumber} | {student.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {timeAgo(student.createdAt)}
                    </span>
                    <button
                      onClick={() => dismissStudent(student._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Dismiss this student"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center pt-2">
                Showing {recentStudents.length} students from last 2 hours
              </p>
            </div>
          )}
        </div>

        {/* Recent Teachers */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-5 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              👨‍🏫 Recent Teachers
              <span className="text-xs font-normal text-gray-400 ml-2">
                (Last 2 hours)
              </span>
            </h3>
            <div className="flex items-center space-x-2">
              {showRecentTeachers && recentTeachers.length > 0 && (
                <button
                  onClick={clearAllTeachers}
                  className="text-xs text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={toggleRecentTeachers}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center space-x-1"
              >
                {showRecentTeachers ? (
                  <>
                    <EyeSlashIcon className="w-3 h-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-3 h-3" />
                    <span>Show</span>
                  </>
                )}
              </button>
              <Link to="/teachers" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
          </div>
          {!showRecentTeachers ? (
            <p className="text-gray-400 text-sm text-center py-4">Recent teachers hidden. Click "Show" to display.</p>
          ) : recentTeachers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">No recent teacher activity</p>
              <p className="text-gray-300 text-xs mt-1">No teachers added in the last 2 hours</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTeachers.map((teacher) => (
                <div key={teacher._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 hover:border-blue-200 group">
                  <div className="flex items-center space-x-3">
                    {teacher.profileImage ? (
                      <img 
                        src={teacher.profileImage} 
                        alt={teacher.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{teacher.name}</p>
                      <p className="text-xs text-gray-500">{teacher.qualification}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {timeAgo(teacher.createdAt)}
                    </span>
                    <button
                      onClick={() => dismissTeacher(teacher._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Dismiss this teacher"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center pt-2">
                Showing {recentTeachers.length} teachers from last 2 hours
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-5 hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-base font-semibold text-gray-900 mb-3">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/teachers"
            className="bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserGroupIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Add Teacher</span>
          </Link>
          <Link
            to="/students"
            className="bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <AcademicCapIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Add Student</span>
          </Link>
          <Link
            to="/fees"
            className="bg-yellow-600 text-white py-2.5 px-4 rounded-lg hover:bg-yellow-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <CurrencyRupeeIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Collect Fee</span>
          </Link>
          <Link
            to="/notifications"
            className="bg-purple-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <BellIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Add Notification</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;