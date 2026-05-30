import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  FileSpreadsheet,
  FileJson,
  Mail,
  Trash2,
  Eye,
  Settings,
  Shield,
  HardDrive,
  Cloud,
  Server,
  Activity,
  ChevronRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';

function DataBackup() {
  const [activeTab, setActiveTab] = useState('backup');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportModule, setExportModule] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock backup data
  const [backups, setBackups] = useState([
    {
      id: 1,
      name: 'Full System Backup',
      date: '2024-01-15T10:30:00',
      size: '245.6 MB',
      type: 'full',
      status: 'completed',
      location: 'Cloud Storage',
      createdBy: 'System Admin',
      modules: ['All Modules'],
      retention: '30 days'
    },
    {
      id: 2,
      name: 'Employee Data Backup',
      date: '2024-01-14T15:45:00',
      size: '45.2 MB',
      type: 'partial',
      status: 'completed',
      location: 'Local Server',
      createdBy: 'HR Manager',
      modules: ['Employee Records', 'Attendance'],
      retention: '90 days'
    },
    {
      id: 3,
      name: 'Payroll Database Backup',
      date: '2024-01-13T09:15:00',
      size: '78.9 MB',
      type: 'partial',
      status: 'completed',
      location: 'Cloud Storage',
      createdBy: 'Finance Admin',
      modules: ['Payroll', 'Tax Records'],
      retention: '365 days'
    },
    {
      id: 4,
      name: 'Scheduled Weekly Backup',
      date: '2024-01-12T23:00:00',
      size: '189.3 MB',
      type: 'full',
      status: 'completed',
      location: 'External Drive',
      createdBy: 'System',
      modules: ['All Modules'],
      retention: '60 days'
    },
    {
      id: 5,
      name: 'Incomplete Backup',
      date: '2024-01-11T14:20:00',
      size: '0 MB',
      type: 'full',
      status: 'failed',
      location: 'Cloud Storage',
      createdBy: 'System',
      modules: ['N/A'],
      retention: 'N/A'
    }
  ]);

  // Mock schedule configuration
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: true,
    frequency: 'daily',
    time: '23:00',
    dayOfWeek: 'Sunday',
    dayOfMonth: 1,
    retention: 30,
    location: 'Cloud Storage',
    modules: ['All Modules'],
    emailNotification: true,
    emailAddress: 'admin@techcorp.com'
  });

  // Export logs
  const [exportLogs, setExportLogs] = useState([
    { id: 1, date: '2024-01-15T11:00:00', user: 'John Doe', format: 'Excel', module: 'Employee Records', status: 'success', records: 234 },
    { id: 2, date: '2024-01-14T16:30:00', user: 'Jane Smith', format: 'PDF', module: 'Attendance Report', status: 'success', records: 189 },
    { id: 3, date: '2024-01-13T10:15:00', user: 'Robert Wilson', format: 'CSV', module: 'Payroll', status: 'failed', records: 0 },
    { id: 4, date: '2024-01-12T14:45:00', user: 'Emily Chen', format: 'Excel', module: 'All Data', status: 'success', records: 1256 }
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (size) => {
    return size;
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const badges = {
      full: 'bg-purple-100 text-purple-800',
      partial: 'bg-blue-100 text-blue-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      const newBackup = {
        id: backups.length + 1,
        name: `Manual Backup ${new Date().toLocaleString()}`,
        date: new Date().toISOString(),
        size: '156.7 MB',
        type: 'full',
        status: 'completed',
        location: backupSchedule.location,
        createdBy: 'Current User',
        modules: ['All Modules'],
        retention: `${backupSchedule.retention} days`
      };
      setBackups([newBackup, ...backups]);
      setIsBackingUp(false);
      alert('Backup created successfully!');
    }, 3000);
  };

  const handleRestore = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };

  const confirmRestore = () => {
    alert(`Restoring backup: ${selectedBackup.name}\nThis may take a few minutes.`);
    setShowRestoreModal(false);
  };

  const handleDeleteBackup = (id) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      setBackups(backups.filter(b => b.id !== id));
    }
  };

  const handleExport = () => {
    alert(`Exporting ${exportModule} data as ${exportFormat.toUpperCase()}\nDate Range: ${dateRange.start || 'All'} to ${dateRange.end || 'All'}`);
    // Add actual export logic here
  };

  const handleScheduleBackup = () => {
    setShowScheduleModal(false);
    alert('Backup schedule updated successfully!');
  };

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          backup.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || backup.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Backup & Export</h2>
        <p className="text-gray-600">Manage backups, export data, and configure disaster recovery</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Backups</p>
              <p className="text-2xl font-bold text-gray-800">{backups.length}</p>
            </div>
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Storage Used</p>
              <p className="text-2xl font-bold text-gray-800">559 MB</p>
            </div>
            <HardDrive className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Last Backup</p>
              <p className="text-2xl font-bold text-gray-800">Today</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Next Scheduled</p>
              <p className="text-2xl font-bold text-gray-800">23:00</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-2">
          {[
            { id: 'backup', label: 'Backup Manager', icon: <Database className="h-4 w-4" /> },
            { id: 'export', label: 'Data Export', icon: <Download className="h-4 w-4" /> },
            { id: 'schedule', label: 'Schedule', icon: <Calendar className="h-4 w-4" /> },
            { id: 'logs', label: 'Activity Logs', icon: <Activity className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Backup Manager Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Create Backup Button */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Create New Backup</h3>
                <p className="text-blue-100">Backup your entire system or specific modules</p>
              </div>
              <button
                onClick={handleCreateBackup}
                disabled={isBackingUp}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Backup
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Backup Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search backups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="full">Full Backup</option>
                <option value="partial">Partial Backup</option>
              </select>
            </div>
          </div>

          {/* Backups List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBackups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                        <div className="text-xs text-gray-500">By: {backup.createdBy}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(backup.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{backup.size}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(backup.type)}`}>
                          {backup.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(backup.status)}`}>
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{backup.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore(backup)}
                            disabled={backup.status !== 'completed'}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Restore"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Export Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'excel', label: 'Excel', icon: <FileSpreadsheet className="h-5 w-5" /> },
                    { id: 'csv', label: 'CSV', icon: <FileText className="h-5 w-5" /> },
                    { id: 'json', label: 'JSON', icon: <FileJson className="h-5 w-5" /> }
                  ].map(format => (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id)}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        exportFormat === format.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {format.icon}
                      <span className="text-sm font-medium">{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module to Export</label>
                <select
                  value={exportModule}
                  onChange={(e) => setExportModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Modules</option>
                  <option value="employees">Employee Records</option>
                  <option value="attendance">Attendance Data</option>
                  <option value="payroll">Payroll Data</option>
                  <option value="leaves">Leave Records</option>
                  <option value="performance">Performance Reviews</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleExport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Export
              </button>
            </div>
          </div>

          {/* Recent Exports */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Exports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exportLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(log.date)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.format}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.module}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.records}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Automated Backup Schedule</h3>
                <p className="text-sm text-gray-500 mt-1">Configure automatic backups for your data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupSchedule.enabled}
                  onChange={(e) => setBackupSchedule({ ...backupSchedule, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {backupSchedule.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={backupSchedule.frequency}
                    onChange={(e) => setBackupSchedule({ ...backupSchedule, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Time</label>
                  <input
                    type="time"
                    value={backupSchedule.time}
                    onChange={(e) => setBackupSchedule({ ...backupSchedule, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {backupSchedule.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                    <select
                      value={backupSchedule.dayOfWeek}
                      onChange={(e) => setBackupSchedule({ ...backupSchedule, dayOfWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Sunday</option>
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                      <option>Saturday</option>
                    </select>
                  </div>
                )}

                {backupSchedule.frequency === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={backupSchedule.dayOfMonth}
                      onChange={(e) => setBackupSchedule({ ...backupSchedule, dayOfMonth: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                  <input
                    type="number"
                    value={backupSchedule.retention}
                    onChange={(e) => setBackupSchedule({ ...backupSchedule, retention: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
                  <select
                    value={backupSchedule.location}
                    onChange={(e) => setBackupSchedule({ ...backupSchedule, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Cloud Storage</option>
                    <option>Local Server</option>
                    <option>External Drive</option>
                    <option>FTP Server</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modules to Backup</label>
                  <select
                    value={backupSchedule.modules[0]}
                    onChange={(e) => setBackupSchedule({ ...backupSchedule, modules: [e.target.value] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>All Modules</option>
                    <option>Employee Records</option>
                    <option>Attendance & Leave</option>
                    <option>Payroll & Finance</option>
                    <option>Performance & Reviews</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Notification Settings</h4>
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={backupSchedule.emailNotification}
                    onChange={(e) => setBackupSchedule({ ...backupSchedule, emailNotification: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Send email notification on backup completion</span>
                </label>
                {backupSchedule.emailNotification && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={backupSchedule.emailAddress}
                      onChange={(e) => setBackupSchedule({ ...backupSchedule, emailAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Backup & Export Activity Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...backups, ...exportLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(log.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.size ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {log.size ? 'Backup' : 'Export'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.createdBy || log.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.name || `${log.format} - ${log.module}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Restore</h3>
              <button onClick={() => setShowRestoreModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">This action will overwrite current data with the backup data.</p>
              </div>
              <p className="text-gray-700 mb-2">Are you sure you want to restore from backup:</p>
              <p className="font-semibold text-gray-900 mb-4">{selectedBackup.name}</p>
              <p className="text-sm text-gray-500">Created: {formatDate(selectedBackup.date)}</p>
              <p className="text-sm text-gray-500">Size: {selectedBackup.size}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowRestoreModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmRestore} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Restore</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Schedule Backup</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">Backup schedule has been configured successfully!</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Frequency: <span className="font-semibold">{backupSchedule.frequency}</span></p>
                <p className="text-sm text-gray-600">Time: <span className="font-semibold">{backupSchedule.time}</span></p>
                <p className="text-sm text-gray-600">Retention: <span className="font-semibold">{backupSchedule.retention} days</span></p>
                <p className="text-sm text-gray-600">Location: <span className="font-semibold">{backupSchedule.location}</span></p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={handleScheduleBackup} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataBackup;