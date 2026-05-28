import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ViewOfferLetter from './ViewOfferLetter';
import html2pdf from 'html2pdf.js';

const CandidateAppliedList = ({
  user,
  selectedJobForCandidates,
  candidates,
  hideCandidates,
  handleTabChange,
  selectedTab,
  tabs: propTabs, // Rename to avoid conflict
  handleToggleTop10,
  showTop10,
  candidateSearchQuery,
  handleCandidateSearchChange,
  handleSortToggle,
  sortOrder,
  displayedCandidates,
  selectedCandidates,
  handleCandidateCheckboxChange,
  handleStageChange,
  showMenu,
  toggleMenu,
  handleViewDetails,
}) => {
  const navigate = useNavigate();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showHiredModal, setShowHiredModal] = useState(false);
  const [showViewOfferModal, setShowViewOfferModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedOfferData, setSelectedOfferData] = useState(null);
  const [formData, setFormData] = useState({
    Employee_Designation: '',
    Employee_Joining_Date: '',
    Probation_Period: '',
    Annual_CTC: '',
  });
  const [hiredFormData, setHiredFormData] = useState({
    employeeCode: '',
    password: '',
  });

  // Define the updated hiring stages with "Selection"
  const updatedHiringStages = [
    'Sourced',
    'Shortlisted',
    'On Hold',
    'Assessment Phase',
    'Technical Interview',
    'HR Round Interview',
    'Selection',
    'Offered',
    'Offer Accepted',
    'Hired',
  ];

  // Override tabs to ensure correct stage names and counts
  const tabs = updatedHiringStages.map(stage => ({
    name: stage,
    count: candidates.filter(c => c.hiringStage === stage).length,
  }));

  const offerLetterRef = useRef();

  const handleAssignAssessment = async (candidate) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJobForCandidates._id}/candidates/${candidate.id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'Assessment Phase' }),
        }
      );
      if (response.ok) {
        handleStageChange(candidate.id, 'Assessment Phase');
      }
      toggleMenu(null);
    } catch (error) {
      console.error('Error assigning assessment:', error);
    }
  };

  const openOfferModal = (candidateId) => {
    setSelectedCandidateId(candidateId);
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setSelectedCandidateId(null);
    setFormData({
      Employee_Designation: '',
      Employee_Joining_Date: '',
      Probation_Period: '',
      Annual_CTC: '',
    });
    toggleMenu(null);
  };

  const openHiredModal = (candidateId) => {
    setSelectedCandidateId(candidateId);
    setShowHiredModal(true);
  };

  const closeHiredModal = () => {
    setShowHiredModal(false);
    setSelectedCandidateId(null);
    setHiredFormData({
      employeeCode: '',
      password: '',
    });
    toggleMenu(null);
  };

  const openViewOfferModal = (candidate) => {
    console.log('Candidate data when opening modal:', candidate);
    if (candidate.hiringStage === 'Offered' || candidate.hiringStage === 'Offer Accepted') {
      const candidateDetails = {
        candidateName: candidate.name || candidate.candidateName || '[Name]',
        phoneNumber: candidate.phoneNumber || '[Number]',
        currentLocation: candidate.currentLocation || '[Address]',
        candidateEmail: candidate.email || 'N/A',
        expectedCTC: candidate.expectedCTC || 'N/A',
        noticePeriod: candidate.noticePeriod || 'N/A',
      };

      console.log('Raw candidate.offerFormData:', candidate.offerFormData);
      console.log('Raw candidate.offerLetter:', candidate.offerLetter);

      const formData = candidate.offerFormData && Object.keys(candidate.offerFormData).length > 0
        ? candidate.offerFormData
        : {
            Employee_Designation: '[Employee_Designation]',
            Employee_Joining_Date: '[Employee_Joining_Date]',
            Probation_Period: 'three months',
            Annual_CTC: '[Annual_CTC]'
          };

      console.log('Processed formData:', formData);

      const inferredStatus = candidate.hiringStage === 'Offer Accepted' ? 'accepted' : (candidate.offerStatus || 'Pending');

      const offerData = {
        jobId: selectedJobForCandidates._id,
        candidateId: candidate.id,
        offerLetter: candidate.offerLetter || 'Offer letter content not available',
        candidateDetails,
        formData,
        offerStatus: inferredStatus,
      };

      console.log('Offer data being set for ViewOfferLetter:', offerData);

      setSelectedOfferData(offerData);
      setShowViewOfferModal(true);
    } else {
      alert('No offer letter available for this candidate.');
    }
    toggleMenu(null);
  };

  const closeViewOfferModal = () => {
    setShowViewOfferModal(false);
    setSelectedOfferData(null);
  };

  const handleDownloadPDF = (ref, candidateName) => {
    const element = ref.current;
    if (!element) {
      alert('Error: Unable to generate PDF. Element not found.');
      return;
    }

    console.log('offerLetterRef content:', element.innerHTML);

    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => {
          console.error('Error loading image:', img.src);
          reject(new Error(`Failed to load image: ${img.src}`));
        };
      });
    });

    Promise.all(imagePromises)
      .then(() => {
        const opt = {
          margin: 0.5,
          filename: `Offer_Letter_${candidateName.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            windowWidth: 842,
          },
          jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait' 
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        html2pdf()
          .set(opt)
          .from(element)
          .save()
          .catch(error => {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
          });
      })
      .catch(error => {
        console.error('Error loading images for PDF:', error);
        alert('Failed to generate PDF. Image loading issue.');
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHiredInputChange = (e) => {
    const { name, value } = e.target;
    setHiredFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOffer = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const candidate = displayedCandidates.find(c => c.id === selectedCandidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }

      const candidateDetails = {
        candidateName: candidate.name || candidate.candidateName || '[Name]',
        phoneNumber: candidate.phoneNumber || 'N/A',
        currentLocation: candidate.currentLocation || 'N/A',
      };

      const offerLetterContent = `
        Offer Letter
        Date: May 24, 2025

        Ms./Mr. ${candidateDetails.candidateName}
        Mobile: ${candidateDetails.phoneNumber}
        Address: ${candidateDetails.currentLocation}

        Dear ${candidateDetails.candidateName},

        Based on your performance in the Technical and HR interview rounds, we are pleased to offer you the position of ${formData.Employee_Designation} at HL Tech India Private Limited, Bhopal, effective from ${formData.Employee_Joining_Date}.

        You will be on a probation period of ${formData.Probation_Period} from the date of joining. However, this period may be extended or shortened based on your performance. Your roles and responsibilities were discussed with you during the interview. Your CTC has been set at Rs. ${Number(formData.Annual_CTC).toLocaleString("en-IN")} per annum.

        The allowances, benefits, and other terms and conditions of your employment will be detailed in the Appointment Letter, which will be provided to you on the date of joining, as per the company policies applicable at that time.

        If you accept this offer, please confirm your acceptance by replying to this email. For any queries, feel free to contact the undersigned.

        Once again, congratulations and welcome to the HL Tech India Pvt. Ltd. family!

        Best regards,

        Arunakshi Pratap Singh
        HR Manager
        HL Tech India Private Limited

        Corporate Address: 78, Indrapuri Sector-C, Bhopal (M.P.) 462022
        Email: info@hltechindia.com
        Contact: +91 94305 52744, +91 85389 11038
      `;

      const requestBody = {
        offerLetter: offerLetterContent,
        hiringStage: 'Offered',
        formData,
      };

      console.log('Submitting offer letter request:', {
        url: `http://localhost:5000/api/jobs/${selectedJobForCandidates._id}/candidates/${selectedCandidateId}/offer-letter`,
        body: requestBody,
      });

      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJobForCandidates._id}/candidates/${selectedCandidateId}/offer-letter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();
      console.log('Offer letter response:', { status: response.status, data: responseData });

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to generate offer letter');
      }

      handleStageChange(selectedCandidateId, 'Offered');
      closeOfferModal();
      navigate(`/job-posting`, { 
        state: { 
          jobId: selectedJobForCandidates._id,
          candidateId: selectedCandidateId,
          offerLetter: offerLetterContent,
          candidateDetails,
          formData,
        },
      });
    } catch (error) {
      console.error('Error generating offer letter:', error);
      alert('Failed to generate offer letter. Please try again. Error: ' + error.message);
    }
  };

  const handleSubmitHired = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const candidate = displayedCandidates.find(c => c.id === selectedCandidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }

      if (!hiredFormData.employeeCode || !hiredFormData.password) {
        alert('Please fill in both Employee Code and Password.');
        return;
      }

      if (hiredFormData.password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }

      const requestBody = {
        employeeCode: hiredFormData.employeeCode,
        password: hiredFormData.password,
      };

      console.log('Submitting hired candidate request:', {
        url: `http://localhost:5000/api/jobs/${selectedJobForCandidates._id}/candidates/${selectedCandidateId}/hire`,
        body: requestBody,
      });

      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJobForCandidates._id}/candidates/${selectedCandidateId}/hire`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();
      console.log('Hired candidate response:', { status: response.status, data: responseData });

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to hire candidate');
      }

      handleStageChange(selectedCandidateId, 'Hired');
      closeHiredModal();
      alert('Candidate hired successfully! An email with login details has been sent.');
    } catch (error) {
      console.error('Error hiring candidate:', error);
      alert('Failed to hire candidate. Please try again. Error: ' + error.message);
    }
  };

  const handleStageChangeWrapper = async (candidateId, newStage) => {
    if (newStage === 'Offered') {
      openOfferModal(candidateId);
    } else if (newStage === 'Hired') {
      openHiredModal(candidateId);
    } else {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found for API request');
          alert('Authentication token missing. Please log in again.');
          return;
        }

        console.log('Updating hiring stage:', { candidateId, newStage });

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

        const responseData = await response.json();
        console.log('API response:', { status: response.status, data: responseData });

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to update hiring stage');
        }

        // Update the parent state only if the API call is successful
        handleStageChange(candidateId, newStage);
      } catch (error) {
        console.error('Error updating hiring stage:', error);
        alert(`Failed to update hiring stage: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-2 md:p-2 bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto">
        {/* Top Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex items-center space-x-3">
              <button onClick={hideCandidates} className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {selectedJobForCandidates.jobTitle}
                <span className="ml-2 text-sm text-gray-500">({selectedJobForCandidates.views || 125} views)</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{user?.fullName || 'Admin'}</span>
              <span>|</span>
              <span>{selectedJobForCandidates.location.split(',')[0]}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.name}
                onClick={() => handleTabChange(tab.name)}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  selectedTab === tab.name
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-indigo-600'
                } flex items-center space-x-1 whitespace-nowrap`}
              >
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Toggle and Total Candidates */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleTop10}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  showTop10 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Top 10
              </button>
              <button
                onClick={handleToggleTop10}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  !showTop10 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                All
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total Candidates: {candidates.length}</span>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                New: {candidates.filter(c => c.isNew).length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <input
                type="text"
                value={candidateSearchQuery}
                onChange={handleCandidateSearchChange}
                placeholder="Name, Tags, or Keywords"
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button onClick={handleSortToggle} className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m4 4l-4-4m-4 4v12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Candidate Table */}
        {candidates.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">No Candidates Found</h3>
            <p className="mt-2 text-gray-600">No candidates have applied for this job yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      onChange={(e) =>
                        handleCandidateCheckboxChange(e.target.checked ? candidates.map(c => c.id) : [])
                      }
                      checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                    />
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Skills
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hiring Stage
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedCandidates.map(candidate => (
                  <tr key={candidate.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleCandidateCheckboxChange(candidate.id)}
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <div className="flex items-center space-x-2">
                        <span>{candidate.name}</span>
                        {candidate.isNew && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {candidate.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-col items-start space-y-1">
                        {candidate.skills.slice(0, 2).map((skill, index) => (
                          <span key={index}>{skill}</span>
                        ))}
                        {candidate.skills.length > 2 && (
                          <button
                            onClick={() => handleViewDetails(candidate)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-1"
                          >
                            View Skills
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {candidate.date}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <select
                        value={candidate.hiringStage}
                        onChange={(e) => handleStageChangeWrapper(candidate.id, e.target.value)}
                        className="p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {updatedHiringStages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 relative">
                      <div className="relative">
                        <button onClick={() => toggleMenu(candidate.id)} className="text-gray-600 hover:text-gray-800">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {showMenu === candidate.id && (
                          <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <button
                              onClick={() => handleViewDetails(candidate)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleAssignAssessment(candidate)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Assign Assessment
                            </button>
                            <button
                              onClick={() => openViewOfferModal(candidate)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Offer Letter
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Offer Letter Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Generate Offer Letter</h3>
                <button
                  onClick={closeOfferModal}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Designation</label>
                  <input
                    type="text"
                    name="Employee_Designation"
                    value={formData.Employee_Designation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Joining Date</label>
                  <input
                    type="date"
                    name="Employee_Joining_Date"
                    value={formData.Employee_Joining_Date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Probation Period</label>
                  <input
                    type="text"
                    name="Probation_Period"
                    value={formData.Probation_Period}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 3 months"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual CTC</label>
                  <input
                    type="number"
                    name="Annual_CTC"
                    value={formData.Annual_CTC}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 500000"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeOfferModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOffer}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hired Modal */}
        {showHiredModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Hire Candidate</h3>
                <button
                  onClick={closeHiredModal}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Code</label>
                  <input
                    type="text"
                    name="employeeCode"
                    value={hiredFormData.employeeCode}
                    onChange={handleHiredInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., HLT01012"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={hiredFormData.password}
                    onChange={handleHiredInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeHiredModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitHired}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Offer Letter Modal */}
        {showViewOfferModal && selectedOfferData && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 50,
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '8px 16px',
                width: '100%',
                maxWidth: '672px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                  }}
                >
                  {selectedOfferData.offerStatus === 'accepted' ? 'Accepted Offer Letter' : 'View Offer Letter'}
                </h3>
                <button
                  onClick={closeViewOfferModal}
                  style={{
                    color: '#4b5563',
                    cursor: 'pointer',
                  }}
                >
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  marginBottom: '16px',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Offer Status: 
                  <span
                    style={{
                      marginLeft: '8px',
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor:
                        selectedOfferData.offerStatus === 'accepted'
                          ? '#d1fae5'
                          : selectedOfferData.offerStatus === 'rejected'
                          ? '#fee2e2'
                          : '#fef3c7',
                      color:
                        selectedOfferData.offerStatus === 'accepted'
                          ? '#065f46'
                          : selectedOfferData.offerStatus === 'rejected'
                          ? '#991b1b'
                          : '#92400e',
                    }}
                  >
                    {selectedOfferData.offerStatus.charAt(0).toUpperCase() + selectedOfferData.offerStatus.slice(1)}
                  </span>
                </p>
              </div>
              <div
                style={{
                  maxHeight: '550px',
                  overflowY: 'auto',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }}
                ref={offerLetterRef}
              >
                <ViewOfferLetter
                  state={{
                    jobId: selectedOfferData.jobId,
                    candidateId: selectedOfferData.candidateId,
                    offerLetter: selectedOfferData.offerLetter,
                    candidateDetails: selectedOfferData.candidateDetails,
                    formData: selectedOfferData.formData,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => handleDownloadPDF(offerLetterRef, selectedOfferData.candidateDetails.candidateName)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  Download as PDF
                </button>
                <button
                  onClick={closeViewOfferModal}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateAppliedList;