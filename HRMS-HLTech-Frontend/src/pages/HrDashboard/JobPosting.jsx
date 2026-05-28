import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import PostJobModal from '../../components/PostJobModal';
import EditJobModal from '../../components/EditJobModel';
import CandidateAppliedList from '../../components/CandidateAppliedList';
import CandidateDetailsModel from '../../components/CandidateDetailsModel';

function JobPosting() {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobType: '',
    experienceRange: { minExperience: '', maxExperience: '' },
    salaryRange: { currency: 'INR ₹', minSalary: '', maxSalary: '', unit: 'Per Year', hideSalary: false },
    responsibilities: '',
    skills: '',
    customQuestions: [],
  });
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    category: '',
    dateRange: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(5);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');

  // Candidate Management Table State
  const [candidates, setCandidates] = useState([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const [showTop10, setShowTop10] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showMenu, setShowMenu] = useState(null);

  const hiringStages = [
    "Sourced", "Shortlisted", "On Hold", "Assessment Phase",
    "Interview Phase", "Offered", "Offer Accepted", "Hired"
  ];

  const tabs = [
    { name: "All", count: candidates.length },
    { name: "Sourced", count: candidates.filter(c => c.hiringStage === "Sourced").length },
    { name: "Shortlisted", count: candidates.filter(c => c.hiringStage === "Shortlisted").length },
    { name: "On Hold", count: candidates.filter(c => c.hiringStage === "On Hold").length },
    { name: "Assessment Phase", count: candidates.filter(c => c.hiringStage === "Assessment Phase").length },
    { name: "Interview Phase", count: candidates.filter(c => c.hiringStage === "Interview Phase").length },
    { name: "Offered", count: candidates.filter(c => c.hiringStage === "Offered").length },
    { name: "Offer Accepted", count: candidates.filter(c => c.hiringStage === "Offer Accepted").length },
    { name: "Hired", count: candidates.filter(c => c.hiringStage === "Hired").length },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to access this page');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

const fetchJobs = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token);
    const response = await fetch('http://localhost:5000/api/jobs', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Token expired or invalid, please log in again');
      }
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch jobs');
    }

    const data = await response.json();
    console.log('Fetched jobs:', data);
    setJobs(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    toast.error(error.message);
    if (error.message.includes('Unauthorized') || error.message.includes('Token expired')) {
      localStorage.removeItem('token'); // Clear expired token
      window.location.href = '/login';
    }
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  // Populate candidates from selectedJobForCandidates
  useEffect(() => {
    if (selectedJobForCandidates && selectedJobForCandidates.candidates) {
      const jobCandidates = selectedJobForCandidates.candidates.map(candidate => ({
        id: candidate.candidateId,
        name: candidate.candidateName,
        email: candidate.candidateEmail,
        skills: candidate.primarySkills ? candidate.primarySkills.split(',').map(skill => skill.trim()) : [],
        date: new Date(candidate.appliedAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).replace(/\d{4}/, year => year.slice(-2)),
        hiringStage: candidate.hiringStage || 'Sourced',
        isNew: (new Date() - new Date(candidate.appliedAt)) / (1000 * 60 * 60 * 24) <= 7,
        phoneNumber: candidate.phoneNumber,
        currentLocation: candidate.currentLocation,
        linkedInProfile: candidate.linkedInProfile,
        gitHubProfile: candidate.gitHubProfile,
        portfolioWebsite: candidate.portfolioWebsite,
        highestQualification: candidate.highestQualification,
        universityName: candidate.universityName,
        passingYear: candidate.passingYear,
        isFresher: candidate.isFresher,
        totalExperience: candidate.totalExperience,
        previousCompanyName: candidate.previousCompanyName,
        previousRole: candidate.previousRole,
        noticePeriod: candidate.noticePeriod,
        otherSkills: candidate.otherSkills,
        resumeUrl: candidate.resumeUrl,
        whyHireYou: candidate.whyHireYou,
        currentCTC: candidate.currentCTC,
        expectedCTC: candidate.expectedCTC,
      }));
      setCandidates(jobCandidates);
    } else {
      setCandidates([]);
    }
  }, [selectedJobForCandidates]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(jobs.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;

  // Filter jobs based on search query and filters
const filteredJobs = jobs.filter(job => {
  const matchesSearch = job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesJobType = !filters.jobType || job.jobType === filters.jobType;
  const matchesLocation = !filters.location || job.location === filters.location;
  const matchesCategory = !filters.category || job.jobType === filters.category;
  const matchesDateRange = !filters.dateRange || true;
  return matchesSearch && matchesJobType && matchesLocation && matchesCategory && matchesDateRange;
});

  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCheckboxChange = (id) => {
    setSelectedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter a custom question');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customQuestions: [...prev.customQuestions, newQuestion.trim()],
    }));
    setNewQuestion('');
  };

  const handleDeleteQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index),
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to post a job');
      setIsLoading(false);
      navigate('/login');
      return;
    }

    const requiredFields = [
      'jobTitle',
      'location',
      'jobType',
      'responsibilities',
      'skills',
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]?.trim());
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to post job');
      }

      toast.success('Job posted successfully!');
      setIsPostModalOpen(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to update a job');
      setIsLoading(false);
      navigate('/login');
      return;
    }

    const requiredFields = [
      'jobTitle',
      'location',
      'jobType',
      'responsibilities',
      'skills',
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]?.trim());
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${selectedJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update job');
      }

      toast.success('Job updated successfully!');
      setIsEditModalOpen(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete job');
      }

      toast.success('Job deleted successfully!');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/jobs/${id}/visibility`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to toggle job visibility');
      }

      const { message, visibility } = await response.json();
      toast.success(message);
      // Update the job's visibility in the local state
      setJobs(jobs.map(job => 
        job._id === id ? { ...job, visibility } : job
      ));
    } catch (error) {
      console.error('Error toggling job visibility:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    let minExperience = '';
    let maxExperience = '';
    if (job.experienceLevel && job.experienceLevel !== 'Not specified') {
      const [min, max] = job.experienceLevel.replace(' years', '').split('-').map(val => val.trim());
      minExperience = min || '';
      maxExperience = max || '';
    }
    setFormData({
      jobTitle: job.jobTitle,
      location: job.location,
      jobType: job.jobType,
      experienceRange: { minExperience, maxExperience },
      salaryRange: {
        currency: job.salaryRange.currency || 'INR ₹',
        minSalary: job.salaryRange.minSalary || '',
        maxSalary: job.salaryRange.maxSalary || '',
        unit: job.salaryRange.unit || 'Per Year',
        hideSalary: job.salaryRange.hideSalary || false,
      },
      responsibilities: job.responsibilities,
      skills: job.skills.join(', '),
      customQuestions: job.customQuestions,
    });
    setIsEditModalOpen(true);
  };

  const showCandidates = (job) => {
    setSelectedJobForCandidates(job);
  };

  const hideCandidates = () => {
    setSelectedJobForCandidates(null);
    setSelectedTab("All");
    setShowTop10(false);
    setCandidateSearchQuery("");
    setSortOrder("asc");
    setSelectedCandidates([]);
    setCandidates([]);
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      location: '',
      jobType: '',
      experienceRange: { minExperience: '', maxExperience: '' },
      salaryRange: { currency: 'INR ₹', minSalary: '', maxSalary: '', unit: 'Per Year', hideSalary: false },
      responsibilities: '',
      skills: '',
      customQuestions: [],
    });
    setNewQuestion('');
    setSelectedJob(null);
  };

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  };

  const handleToggleTop10 = () => {
    setShowTop10(!showTop10);
  };

  const handleCandidateSearchChange = (e) => {
    setCandidateSearchQuery(e.target.value);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleStageChange = (candidateId, newStage) => {
    setCandidates(candidates.map(c =>
      c.id === candidateId ? { ...c, hiringStage: newStage } : c
    ));

    const updateHiringStage = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/jobs/${selectedJobForCandidates._id}/candidates/${candidateId}/status`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStage }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update candidate hiring stage');
        }
      } catch (error) {
        console.error('Error updating candidate hiring stage:', error);
        toast.error(error.message);
      }
    };

    updateHiringStage();
  };

  const handleCandidateCheckboxChange = (id) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
    setShowMenu(null);
  };

  const toggleMenu = (candidateId) => {
    setShowMenu(showMenu === candidateId ? null : candidateId);
  };

  const filteredCandidates = candidates
    .filter(c => selectedTab === "All" || c.hiringStage === selectedTab)
    .filter(c => c.name.toLowerCase().includes(candidateSearchQuery.toLowerCase()))
    .sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const displayedCandidates = showTop10 ? filteredCandidates.slice(0, 10) : filteredCandidates;

  return (
    <div className="p-2 pt-6 bg-gray-50 min-w-[100vw] sm:min-w-full min-h-screen">
      <div className="max-w-8xl mx-auto">
        {selectedJobForCandidates ? (
          <CandidateAppliedList
            user={user}
            selectedJobForCandidates={selectedJobForCandidates}
            candidates={candidates}
            hideCandidates={hideCandidates}
            handleTabChange={handleTabChange}
            selectedTab={selectedTab}
            tabs={tabs}
            handleToggleTop10={handleToggleTop10}
            showTop10={showTop10}
            candidateSearchQuery={candidateSearchQuery}
            handleCandidateSearchChange={handleCandidateSearchChange}
            handleSortToggle={handleSortToggle}
            sortOrder={sortOrder}
            displayedCandidates={displayedCandidates}
            selectedCandidates={selectedCandidates}
            handleCandidateCheckboxChange={handleCandidateCheckboxChange}
            hiringStages={hiringStages}
            handleStageChange={handleStageChange}
            showMenu={showMenu}
            toggleMenu={toggleMenu}
            handleViewDetails={handleViewDetails}
          />
        ) : (
          <>
            {/* Top Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Job List
                  <span className="ml-2 text-sm text-gray-500">({filteredJobs.length} jobs)</span>
                </h1>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create a Job</span>
                </button>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by Job Title..."
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                  <select
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All Locations</option>
                    <option value="Bangalore, India">Bangalore, India</option>
                    <option value="Mumbai, India">Mumbai, India</option>
                    <option value="Delhi, India">Delhi, India</option>
                    <option value="Hyderabad, India">Hyderabad, India</option>
                    <option value="Pune, India">Pune, India</option>
                  </select>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Design">Design</option>
                    <option value="Analytics">Analytics</option>
                  </select>
                  <select
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">All Dates</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 3 Months">Last 3 Months</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900">No Job Postings Found</h3>
                <p className="mt-2 text-gray-600">Click "Create a Job" to create a new job listing.</p>
              </div>
            ) : isMobileView ? (
              <div className="space-y-3">
                {currentJobs.map((job) => (
                  <div key={job._id} className="border rounded-lg shadow-sm mb-4 overflow-hidden bg-white">
                    <div
                      className="p-4 flex justify-between items-start cursor-pointer"
                      onClick={() => showCandidates(job)}
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{job.jobTitle}</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {job.jobType}
                              </span>
                              
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {job.salary || 'NA'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                job.visibility === 'private' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {job.visibility === 'private' ? 'Private' : 'Public'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg border border-gray-300 text-sm ${
                      currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg border border-gray-300 text-sm ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          onChange={(e) =>
                            setSelectedJobs(e.target.checked ? filteredJobs.map((job) => job._id) : [])
                          }
                          checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                        />
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Job Type
                      </th>
                      
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date Posted
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Candidates
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Visibility
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentJobs.map((job) => (
                      <tr
                        key={job._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedJobs.includes(job._id)}
                            onChange={() => handleCheckboxChange(job._id)}
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {job.jobTitle}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {job.jobType}
                        </td>
                        
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {job.salary || 'NA'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(job.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <button
                            onClick={() => showCandidates(job)}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors duration-200"
                          >
                            {job.candidates?.length || 0}
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.visibility === 'private' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {job.visibility === 'private' ? 'Private' : 'Public'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex space-x-2">
                          <button
                            onClick={() => openEditModal(job)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(job._id)}
                            className={job.visibility === 'private' ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'}
                            title={job.visibility === 'private' ? 'Make Public' : 'Make Private'}
                          >
                            {job.visibility === 'private' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5 3L21 9.5 14.5 16M3 9.5h18" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.36 6.64a9 9 0 11-12.73 0M12 21V3" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <select
                      value={resultsPerPage}
                      onChange={handleResultsPerPageChange}
                      className="p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm ${
                        currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm ${
                          currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <PostJobModal
          isPostModalOpen={isPostModalOpen}
          setIsPostModalOpen={setIsPostModalOpen}
          formData={formData}
          setFormData={setFormData}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          isLoading={isLoading}
          handleCreateSubmit={handleCreateSubmit}
          handleInputChange={handleInputChange}
        />

        <EditJobModal
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          selectedJob={selectedJob}
          formData={formData}
          setFormData={setFormData}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          isLoading={isLoading}
          handleEditSubmit={handleEditSubmit}
          handleInputChange={handleInputChange}
          handleAddQuestion={handleAddQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
          resetForm={resetForm}
        />

        <CandidateDetailsModel
          selectedCandidate={selectedCandidate}
          isCandidateModalOpen={isCandidateModalOpen}
          setIsCandidateModalOpen={setIsCandidateModalOpen}
        />
      </div>
    </div>
  );
}

export default JobPosting;