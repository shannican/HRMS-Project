import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';

function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState('last7days');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const itemsPerPage = 10;

  // Mock data for audit logs
  const auditLogsData = [
    {
      id: 1,
      timestamp: '2024-01-15T10:30:00',
      user: 'John Doe',
      userRole: 'HR Manager',
      action: 'CREATE',
      module: 'Employee Management',
      description: 'Created new employee account for Sarah Johnson',
      ipAddress: '192.168.1.105',
      details: {
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Senior Developer'
      }
    },
    {
      id: 2,
      timestamp: '2024-01-15T09:15:00',
      user: 'Jane Smith',
      userRole: 'Admin',
      action: 'UPDATE',
      module: 'Leave Management',
      description: 'Approved leave request for Michael Brown',
      ipAddress: '192.168.1.110',
      details: {
        leaveId: 'LV2024001',
        days: 3,
        type: 'Annual Leave'
      }
    },
    {
      id: 3,
      timestamp: '2024-01-14T16:45:00',
      user: 'Robert Wilson',
      userRole: 'Payroll Admin',
      action: 'DELETE',
      module: 'Payroll',
      description: 'Deleted duplicate payroll entry for December',
      ipAddress: '192.168.1.115',
      details: {
        payrollId: 'PR2023120',
        reason: 'Duplicate entry'
      }
    },
    {
      id: 4,
      timestamp: '2024-01-14T14:20:00',
      user: 'Emily Chen',
      userRole: 'HR Specialist',
      action: 'VIEW',
      module: 'Reports',
      description: 'Generated monthly attendance report',
      ipAddress: '192.168.1.120',
      details: {
        reportType: 'Attendance',
        month: 'December 2024',
        format: 'PDF'
      }
    },
    {
      id: 5,
      timestamp: '2024-01-14T11:00:00',
      user: 'Michael Brown',
      userRole: 'Employee',
      action: 'UPDATE',
      module: 'Profile',
      description: 'Updated personal contact information',
      ipAddress: '192.168.1.125',
      details: {
        fieldsUpdated: ['phone', 'address', 'emergencyContact']
      }
    },
    {
      id: 6,
      timestamp: '2024-01-13T15:30:00',
      user: 'Sarah Johnson',
      userRole: 'Team Lead',
      action: 'APPROVE',
      module: 'Timesheet',
      description: 'Approved team timesheets for week 2',
      ipAddress: '192.168.1.130',
      details: {
        weekEnding: '2024-01-12',
        teamSize: 8
      }
    },
    {
      id: 7,
      timestamp: '2024-01-13T09:45:00',
      user: 'David Lee',
      userRole: 'IT Admin',
      action: 'CONFIGURE',
      module: 'System Settings',
      description: 'Updated security policy settings',
      ipAddress: '192.168.1.135',
      details: {
        settings: ['passwordPolicy', 'sessionTimeout', 'mfaRequired']
      }
    },
    {
      id: 8,
      timestamp: '2024-01-12T13:15:00',
      user: 'Lisa Anderson',
      userRole: 'Recruiter',
      action: 'CREATE',
      module: 'Recruitment',
      description: 'Posted new job opening for Frontend Developer',
      ipAddress: '192.168.1.140',
      details: {
        jobId: 'JOB2024005',
        department: 'Engineering',
        location: 'Remote'
      }
    }
  ];

  // Action colors mapping
  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'VIEW': 'bg-gray-100 text-gray-800',
      'APPROVE': 'bg-purple-100 text-purple-800',
      'CONFIGURE': 'bg-yellow-100 text-yellow-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  // Filter logs based on search and filters
  const filteredLogs = auditLogsData.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesUser = selectedUser === 'all' || log.user === selectedUser;
    
    // Date filtering logic
    let matchesDate = true;
    const logDate = new Date(log.timestamp);
    const today = new Date();
    
    if (dateRange === 'today') {
      matchesDate = logDate.toDateString() === today.toDateString();
    } else if (dateRange === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      matchesDate = logDate.toDateString() === yesterday.toDateString();
    } else if (dateRange === 'last7days') {
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 7);
      matchesDate = logDate >= last7Days;
    } else if (dateRange === 'last30days') {
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 30);
      matchesDate = logDate >= last30Days;
    }
    
    return matchesSearch && matchesAction && matchesUser && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Get unique users for filter
  const uniqueUsers = [...new Set(auditLogsData.map(log => log.user))];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'CONFIGURE'];

  // Export to CSV
  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Description', 'IP Address'];
    const csvData = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.user,
      log.action,
      log.module,
      log.description,
      log.ipAddress
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Audit Logs</h2>
        <p className="text-gray-600">Track and monitor all system activities and user actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Activities</p>
              <p className="text-2xl font-bold text-gray-800">{filteredLogs.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Unique Users</p>
              <p className="text-2xl font-bold text-gray-800">{uniqueUsers.length}</p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Modules Accessed</p>
              <p className="text-2xl font-bold text-gray-800">6</p>
            </div>
            <Filter className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Activities</p>
              <p className="text-2xl font-bold text-gray-800">
                {auditLogsData.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
          </select>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedAction('all');
              setSelectedUser('all');
              setDateRange('last7days');
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user}</div>
                    <div className="text-xs text-gray-500">{log.userRole}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.module}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{log.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit logs found matching your criteria</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Audit Log Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Timestamp</label>
                  <p className="text-gray-800">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <p className="text-gray-800">{selectedLog.user} ({selectedLog.userRole})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Action</label>
                  <p className="text-gray-800">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Module</label>
                  <p className="text-gray-800">{selectedLog.module}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-800">{selectedLog.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <p className="text-gray-800">{selectedLog.ipAddress}</p>
                </div>
                {selectedLog.details && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Additional Details</label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;