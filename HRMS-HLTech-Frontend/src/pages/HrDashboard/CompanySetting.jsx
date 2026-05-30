import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Shield,
  Bell,
  Database,
  FileText,
  Upload,
  Save,
  Edit2,
  Check,
  X,
  AlertCircle,
  Moon,
  Sun,
  Languages,
  Lock,
  Key,
  Printer,
  Download,
  RefreshCw,
  Trash2
} from 'lucide-react';

function CompanySetting() {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Company Information State
  const [companyInfo, setCompanyInfo] = useState({
    name: 'TechCorp Solutions',
    legalName: 'TechCorp Solutions Pvt. Ltd.',
    email: 'contact@techcorp.com',
    phone: '+1 (555) 123-4567',
    mobile: '+1 (555) 987-6543',
    website: 'www.techcorp.com',
    taxId: 'TAX-123456789',
    registrationNo: 'REG-987654321',
    industry: 'Information Technology',
    size: '201-500',
    foundedYear: '2015',
    description: 'Leading provider of innovative software solutions and HR management systems.'
  });

  // Address State
  const [address, setAddress] = useState({
    street: '123 Business Park',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    timezone: 'America/Los_Angeles'
  });

  // Working Hours State
  const [workingHours, setWorkingHours] = useState({
    weekStart: 'Monday',
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '18:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    overtimeEnabled: true,
    flexibleHours: false
  });

  // Holiday Settings
  const [holidays, setHolidays] = useState([
    { id: 1, name: 'New Year\'s Day', date: '2024-01-01', type: 'Public' },
    { id: 2, name: 'Republic Day', date: '2024-01-26', type: 'Public' },
    { id: 3, name: 'Independence Day', date: '2024-08-15', type: 'Public' },
    { id: 4, name: 'Christmas Day', date: '2024-12-25', type: 'Public' }
  ]);

  // Leave Policies
  const [leavePolicies, setLeavePolicies] = useState([
    { id: 1, name: 'Annual Leave', days: 20, carryForward: true, maxCarryForward: 10 },
    { id: 2, name: 'Sick Leave', days: 12, carryForward: false, maxCarryForward: 0 },
    { id: 3, name: 'Casual Leave', days: 6, carryForward: false, maxCarryForward: 0 },
    { id: 4, name: 'Bereavement Leave', days: 5, carryForward: false, maxCarryForward: 0 }
  ]);

  // Payroll Settings
  const [payrollSettings, setPayrollSettings] = useState({
    currency: 'USD',
    salaryDay: 28,
    taxRegime: 'Progressive',
    enableOvertime: true,
    overtimeRate: 1.5,
    enableBonus: true,
    enableDeductions: true,
    pfEnabled: true,
    esiEnabled: false,
    taxDeductions: 'Monthly'
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    leaveRequests: true,
    attendanceReminders: true,
    payrollAlerts: true,
    announcementAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
    monthlyReports: true
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    ipWhitelisting: false,
    auditLogRetention: 365
  });

  // Branding Settings
  const [branding, setBranding] = useState({
    companyLogo: null,
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#8B5CF6',
    emailFooter: 'Thank you for being part of TechCorp Solutions family!'
  });

  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'Public' });
  const [newLeavePolicy, setNewLeavePolicy] = useState({ name: '', days: 0, carryForward: false, maxCarryForward: 0 });
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [showAddLeavePolicy, setShowAddLeavePolicy] = useState(false);

  const handleSave = () => {
    setSaveSuccess(false);
    setShowSaveModal(true);
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setIsEditing(false);
      }, 2000);
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original state if needed
  };

  const handleAddHoliday = () => {
    if (newHoliday.name && newHoliday.date) {
      setHolidays([...holidays, { ...newHoliday, id: Date.now() }]);
      setNewHoliday({ name: '', date: '', type: 'Public' });
      setShowAddHoliday(false);
    }
  };

  const handleDeleteHoliday = (id) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const handleAddLeavePolicy = () => {
    if (newLeavePolicy.name && newLeavePolicy.days > 0) {
      setLeavePolicies([...leavePolicies, { ...newLeavePolicy, id: Date.now() }]);
      setNewLeavePolicy({ name: '', days: 0, carryForward: false, maxCarryForward: 0 });
      setShowAddLeavePolicy(false);
    }
  };

  const handleDeleteLeavePolicy = (id) => {
    setLeavePolicies(leavePolicies.filter(l => l.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding({ ...branding, companyLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Settings</h2>
            <p className="text-gray-600">Manage your organization's configuration and policies</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Settings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap gap-2">
          {[
            { id: 'general', label: 'General', icon: <Building2 className="h-4 w-4" /> },
            { id: 'working', label: 'Working Hours', icon: <Clock className="h-4 w-4" /> },
            { id: 'leave', label: 'Leave Policies', icon: <Calendar className="h-4 w-4" /> },
            { id: 'payroll', label: 'Payroll', icon: <DollarSign className="h-4 w-4" /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
            { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
            { id: 'branding', label: 'Branding', icon: <FileText className="h-4 w-4" /> }
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

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Information Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Legal Name</label>
                  <input
                    type="text"
                    value={companyInfo.legalName}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, legalName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={companyInfo.mobile}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, mobile: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                  <input
                    type="text"
                    value={companyInfo.taxId}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input
                    type="text"
                    value={companyInfo.registrationNo}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, registrationNo: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={companyInfo.industry}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option>Information Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Retail</option>
                    <option>Manufacturing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <select
                    value={companyInfo.size}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, size: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option>1-50</option>
                    <option>51-200</option>
                    <option>201-500</option>
                    <option>501-1000</option>
                    <option>1000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                  <input
                    type="number"
                    value={companyInfo.foundedYear}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, foundedYear: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                <textarea
                  rows="4"
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={address.timezone}
                      onChange={(e) => setAddress({ ...address, timezone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option>America/Los_Angeles</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                      <option>Asia/Dubai</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Working Hours Tab */}
        {activeTab === 'working' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Working Hours Configuration</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Week Start Day</label>
                    <select
                      value={workingHours.weekStart}
                      onChange={(e) => setWorkingHours({ ...workingHours, weekStart: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option>Monday</option>
                      <option>Sunday</option>
                      <option>Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Days</label>
                    <div className="space-y-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={workingHours.workDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWorkingHours({ ...workingHours, workDays: [...workingHours.workDays, day] });
                              } else {
                                setWorkingHours({ ...workingHours, workDays: workingHours.workDays.filter(d => d !== day) });
                              }
                            }}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={workingHours.startTime}
                      onChange={(e) => setWorkingHours({ ...workingHours, startTime: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={workingHours.endTime}
                      onChange={(e) => setWorkingHours({ ...workingHours, endTime: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lunch Start</label>
                    <input
                      type="time"
                      value={workingHours.lunchStart}
                      onChange={(e) => setWorkingHours({ ...workingHours, lunchStart: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lunch End</label>
                    <input
                      type="time"
                      value={workingHours.lunchEnd}
                      onChange={(e) => setWorkingHours({ ...workingHours, lunchEnd: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={workingHours.overtimeEnabled}
                      onChange={(e) => setWorkingHours({ ...workingHours, overtimeEnabled: e.target.checked })}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable Overtime Tracking</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={workingHours.flexibleHours}
                      onChange={(e) => setWorkingHours({ ...workingHours, flexibleHours: e.target.checked })}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow Flexible Working Hours</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Policies Tab */}
        {activeTab === 'leave' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Holiday Calendar</h3>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddHoliday(true)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Add Holiday
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holiday Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        {isEditing && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {holidays.map(holiday => (
                        <tr key={holiday.id}>
                          <td className="px-4 py-3 text-sm text-gray-800">{holiday.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{holiday.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{holiday.type}</td>
                          {isEditing && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteHoliday(holiday.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Leave Policies</h3>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddLeavePolicy(true)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + Add Policy
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days/Year</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carry Forward</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Carry Forward</th>
                        {isEditing && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leavePolicies.map(policy => (
                        <tr key={policy.id}>
                          <td className="px-4 py-3 text-sm text-gray-800">{policy.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{policy.days}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{policy.carryForward ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{policy.maxCarryForward || '-'}</td>
                          {isEditing && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteLeavePolicy(policy.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Payroll Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={payrollSettings.currency}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, currency: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>INR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={payrollSettings.salaryDay}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, salaryDay: parseInt(e.target.value) })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Regime</label>
                  <select
                    value={payrollSettings.taxRegime}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, taxRegime: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option>Progressive</option>
                    <option>Flat Rate</option>
                    <option>Regressive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Deduction Frequency</label>
                  <select
                    value={payrollSettings.taxDeductions}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, taxDeductions: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={payrollSettings.enableOvertime}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, enableOvertime: e.target.checked })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Overtime Pay</span>
                </label>
                {payrollSettings.enableOvertime && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate (x)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={payrollSettings.overtimeRate}
                      onChange={(e) => setPayrollSettings({ ...payrollSettings, overtimeRate: parseFloat(e.target.value) })}
                      disabled={!isEditing}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                )}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={payrollSettings.enableBonus}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, enableBonus: e.target.checked })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Bonus Management</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={payrollSettings.enableDeductions}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, enableDeductions: e.target.checked })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Deductions</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={payrollSettings.pfEnabled}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, pfEnabled: e.target.checked })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Provident Fund</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={payrollSettings.esiEnabled}
                    onChange={(e) => setPayrollSettings({ ...payrollSettings, esiEnabled: e.target.checked })}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable ESI (Employee State Insurance)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Configure system notifications</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        disabled={!isEditing}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3 ml-6">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications.leaveRequests}
                        onChange={(e) => setNotifications({ ...notifications, leaveRequests: e.target.checked })}
                        disabled={!isEditing || !notifications.emailNotifications}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">Leave Requests</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications.attendanceReminders}
                        onChange={(e) => setNotifications({ ...notifications, attendanceReminders: e.target.checked })}
                        disabled={!isEditing || !notifications.emailNotifications}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">Attendance Reminders</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications.payrollAlerts}
                        onChange={(e) => setNotifications({ ...notifications, payrollAlerts: e.target.checked })}
                        disabled={!isEditing || !notifications.emailNotifications}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">Payroll Alerts</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications.announcementAlerts}
                        onChange={(e) => setNotifications({ ...notifications, announcementAlerts: e.target.checked })}
                        disabled={!isEditing || !notifications.emailNotifications}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">Announcement Alerts</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications.systemUpdates}
                        onChange={(e) => setNotifications({ ...notifications, systemUpdates: e.target.checked })}
                        disabled={!isEditing || !notifications.emailNotifications}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">System Updates</span>
                    </label>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Report Notifications</h4>
                      <p className="text-sm text-gray-500">Receive scheduled report notifications</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-3 ml-6">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReports}
                        onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Weekly Reports</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications.monthlyReports}
                        onChange={(e) => setNotifications({ ...notifications, monthlyReports: e.target.checked })}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Monthly Reports</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                    <input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Audit Log Retention (days)</label>
                    <input
                      type="number"
                      value={securitySettings.auditLogRetention}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, auditLogRetention: parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable Two-Factor Authentication (2FA)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={securitySettings.ipWhitelisting}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelisting: e.target.checked })}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable IP Whitelisting</span>
                  </label>
                </div>
                {securitySettings.ipWhitelisting && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Whitelisted IP Addresses</label>
                    <textarea
                      rows="3"
                      placeholder="Enter IP addresses (one per line)"
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Add allowed IP addresses, one per line</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Branding & Customization</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  <div className="flex items-center gap-6">
                    {branding.companyLogo ? (
                      <img src={branding.companyLogo} alt="Company Logo" className="h-24 w-24 object-contain border rounded-lg p-2" />
                    ) : (
                      <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center border">
                        <Building2 className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {isEditing && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </div>
                      </label>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        disabled={!isEditing}
                        className="h-10 w-20 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        disabled={!isEditing}
                        className="h-10 w-20 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                        disabled={!isEditing}
                        className="h-10 w-20 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Footer Text</label>
                  <textarea
                    rows="3"
                    value={branding.emailFooter}
                    onChange={(e) => setBranding({ ...branding, emailFooter: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Holiday Modal */}
      {showAddHoliday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Add New Holiday</h3>
              <button onClick={() => setShowAddHoliday(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>Public</option>
                  <option>Company</option>
                  <option>Optional</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowAddHoliday(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddHoliday} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Holiday</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Leave Policy Modal */}
      {showAddLeavePolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Add Leave Policy</h3>
              <button onClick={() => setShowAddLeavePolicy(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name</label>
                <input
                  type="text"
                  value={newLeavePolicy.name}
                  onChange={(e) => setNewLeavePolicy({ ...newLeavePolicy, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days per Year</label>
                <input
                  type="number"
                  value={newLeavePolicy.days}
                  onChange={(e) => setNewLeavePolicy({ ...newLeavePolicy, days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newLeavePolicy.carryForward}
                    onChange={(e) => setNewLeavePolicy({ ...newLeavePolicy, carryForward: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Allow Carry Forward</span>
                </label>
              </div>
              {newLeavePolicy.carryForward && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Carry Forward Days</label>
                  <input
                    type="number"
                    value={newLeavePolicy.maxCarryForward}
                    onChange={(e) => setNewLeavePolicy({ ...newLeavePolicy, maxCarryForward: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowAddLeavePolicy(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddLeavePolicy} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Policy</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 text-center p-6">
            {saveSuccess ? (
              <>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Settings Saved!</h3>
                <p className="text-gray-600">All company settings have been updated successfully.</p>
              </>
            ) : (
              <>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Saving Settings...</h3>
                <p className="text-gray-600">Please wait while we update your configuration.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanySetting;