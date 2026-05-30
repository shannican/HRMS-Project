import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Printer,
  Mail,
  Eye,
  ChevronDown,
  RefreshCw,
  Filter,
  DollarSign,
  UserCheck,
  UserX,
  Award,
  Heart
} from 'lucide-react';

function Reports() {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for reports
  const departments = ['All', 'Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations'];
  const employees = [
    'All Employees',
    'John Doe',
    'Jane Smith',
    'Robert Wilson',
    'Emily Chen',
    'Michael Brown'
  ];

  // Report categories
  const reportCategories = {
    attendance: {
      name: 'Attendance Reports',
      icon: <Clock className="h-5 w-5" />,
      description: 'Track employee attendance, late arrivals, and overtime',
      metrics: {
        presentDays: 1842,
        absentDays: 58,
        lateArrivals: 127,
        overtime: 342
      },
      chartData: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        present: [425, 438, 442, 430],
        absent: [15, 12, 8, 23],
        late: [32, 28, 35, 32]
      }
    },
    payroll: {
      name: 'Payroll Reports',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Salary breakdown, deductions, and tax information',
      metrics: {
        totalSalary: 245000,
        totalDeductions: 45200,
        netPayroll: 199800,
        averageSalary: 4250
      },
      chartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        amounts: [225000, 228000, 231000, 234000, 237000, 240000]
      }
    },
    recruitment: {
      name: 'Recruitment Reports',
      icon: <Users className="h-5 w-5" />,
      description: 'Hiring metrics, source effectiveness, and time-to-hire',
      metrics: {
        totalApplicants: 847,
        interviews: 234,
        offers: 78,
        hires: 45
      },
      chartData: {
        labels: ['LinkedIn', 'Indeed', 'Referral', 'Company Site', 'Agency'],
        sources: [245, 198, 156, 134, 114]
      }
    },
    performance: {
      name: 'Performance Reports',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Employee ratings, goals completion, and feedback',
      metrics: {
        averageRating: 4.2,
        topPerformers: 23,
        needsImprovement: 12,
        goalsCompleted: 86
      },
      chartData: {
        labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
        ratings: [45, 78, 42, 15, 8]
      }
    },
    turnover: {
      name: 'Turnover Reports',
      icon: <UserX className="h-5 w-5" />,
      description: 'Employee retention, attrition rate, and exit analysis',
      metrics: {
        totalEmployees: 234,
        newHires: 28,
        departures: 12,
        attritionRate: 5.1
      },
      chartData: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        hires: [12, 8, 5, 3],
        departures: [3, 2, 4, 3]
      }
    },
    benefits: {
      name: 'Benefits Reports',
      icon: <Heart className="h-5 w-5" />,
      description: 'Benefits enrollment, utilization, and costs',
      metrics: {
        enrolledCount: 198,
        utilizationRate: 76,
        totalCost: 185000,
        averageCost: 935
      },
      chartData: {
        labels: ['Health', 'Dental', 'Vision', '401k', 'Life'],
        enrolled: [185, 165, 145, 178, 125]
      }
    }
  };

  const currentReport = reportCategories[selectedReport];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 2000);
  };

  const handleExport = () => {
    alert(`Exporting ${currentReport.name} as ${reportFormat.toUpperCase()}`);
    // Implement actual export logic here
  };

  const handleEmail = () => {
    alert(`Emailing ${currentReport.name} report`);
    // Implement email logic here
  };

  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">Generate and analyze comprehensive HR reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Report Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Report Categories</h3>
            </div>
            <div className="p-2">
              {Object.entries(reportCategories).map(([key, report]) => (
                <button
                  key={key}
                  onClick={() => setSelectedReport(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                    selectedReport === key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {report.icon}
                    <div>
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-gray-500">{report.description.substring(0, 40)}...</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Quick Stats</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Reports Generated</span>
                <span className="font-semibold text-gray-800">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold text-gray-800">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Scheduled Reports</span>
                <span className="font-semibold text-gray-800">23</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Report Configuration */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {currentReport.icon}
                  <h3 className="text-xl font-semibold text-gray-800">{currentReport.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedReport(selectedReport);
                      setShowPreview(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {(dateRange === 'custom') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept.toLowerCase()}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {employees.map(emp => (
                      <option key={emp} value={emp.toLowerCase()}>{emp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Export as:</span>
                  <div className="flex gap-2">
                    {['pdf', 'excel', 'csv'].map(format => (
                      <button
                        key={format}
                        onClick={() => setReportFormat(format)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          reportFormat === format
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Report Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <button
                      onClick={handleEmail}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {Object.entries(currentReport.metrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {typeof value === 'number' && key.includes('salary') 
                          ? formatCurrency(value)
                          : value}
                        {key === 'attritionRate' && '%'}
                        {key === 'averageRating' && '/5'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart Section - Simplified representation */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Analytics Overview</h4>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      {currentReport.chartData.labels.map((label, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{label}</span>
                            <span>
                              {currentReport.chartData.present 
                                ? currentReport.chartData.present[index]
                                : currentReport.chartData.amounts 
                                  ? formatCurrency(currentReport.chartData.amounts[index])
                                  : currentReport.chartData.sources 
                                    ? currentReport.chartData.sources[index]
                                    : currentReport.chartData.ratings 
                                      ? currentReport.chartData.ratings[index]
                                      : currentReport.chartData.enrolled 
                                        ? currentReport.chartData.enrolled[index]
                                        : currentReport.chartData.hires 
                                          ? currentReport.chartData.hires[index]
                                          : 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 rounded-full h-2"
                              style={{
                                width: `${
                                  (currentReport.chartData.present 
                                    ? (currentReport.chartData.present[index] / 500) * 100
                                    : currentReport.chartData.amounts 
                                      ? (currentReport.chartData.amounts[index] / 250000) * 100
                                      : currentReport.chartData.sources 
                                        ? (currentReport.chartData.sources[index] / 250) * 100
                                        : currentReport.chartData.ratings 
                                          ? (currentReport.chartData.ratings[index] / 200) * 100
                                          : currentReport.chartData.enrolled 
                                            ? (currentReport.chartData.enrolled[index] / 200) * 100
                                            : (currentReport.chartData.hires?.[index] / 20) * 100) || 0
                                }%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detailed Data Table */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Detailed Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentReport.chartData.labels.map((label, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-800">{label}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {currentReport.chartData.present 
                                ? currentReport.chartData.present[index]
                                : currentReport.chartData.amounts 
                                  ? formatCurrency(currentReport.chartData.amounts[index])
                                  : currentReport.chartData.sources 
                                    ? currentReport.chartData.sources[index]
                                    : currentReport.chartData.ratings 
                                      ? currentReport.chartData.ratings[index]
                                      : currentReport.chartData.enrolled 
                                        ? currentReport.chartData.enrolled[index]
                                        : currentReport.chartData.hires?.[index] || 0}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {Math.round(
                                (currentReport.chartData.present 
                                  ? (currentReport.chartData.present[index] / 500) * 100
                                  : currentReport.chartData.amounts 
                                    ? (currentReport.chartData.amounts[index] / 250000) * 100
                                    : currentReport.chartData.sources 
                                      ? (currentReport.chartData.sources[index] / 250) * 100
                                      : currentReport.chartData.ratings 
                                        ? (currentReport.chartData.ratings[index] / 200) * 100
                                        : currentReport.chartData.enrolled 
                                          ? (currentReport.chartData.enrolled[index] / 200) * 100
                                          : 0) || 0
                              )}%
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-green-600 text-sm">↑ {Math.floor(Math.random() * 15) + 1}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Insights Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">Key Insights</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Overall attendance rate is 97% for the selected period</li>
                    <li>• Employee satisfaction score has increased by 8% compared to last quarter</li>
                    <li>• Recruitment source effectiveness shows LinkedIn as top performer</li>
                    <li>• Projected turnover rate is below industry average</li>
                  </ul>
                </div>
              </div>

              {/* Report Footer */}
              <div className="p-4 bg-gray-50 rounded-b-lg text-center text-sm text-gray-500">
                Generated on {new Date().toLocaleString()} | HRMS System Report
              </div>
            </div>
          )}

          {/* No Report Generated State */}
          {!showPreview && !isGenerating && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Report Generated</h3>
              <p className="text-gray-600 mb-4">
                Configure your report settings and click "Generate Report" to view analytics
              </p>
              <div className="flex justify-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Select Date Range
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Download className="h-4 w-4" />
                  Export Data
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !showPreview && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Report</h3>
              <p className="text-gray-600">Please wait while we compile your data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;