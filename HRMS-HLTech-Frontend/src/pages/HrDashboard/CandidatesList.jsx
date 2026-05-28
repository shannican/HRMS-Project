import React, { useState } from "react";
import axios from "axios";

const CandidatesList = ({ job, onBack }) => {
  const [candidates, setCandidates] = useState(job.candidates || []);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState("");

  const handleStatusUpdate = async (candidateId, status) => {
    try {
      setError("");
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      await axios.put(
        `http://localhost:5000/api/jobs/${job._id}/candidates/${candidateId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state to reflect the new status
      setCandidates((prevCandidates) =>
        prevCandidates.map((cand) =>
          cand.candidateId === candidateId ? { ...cand, status } : cand
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} candidate.`);
    }
  };

  const openModal = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const closeModal = () => {
    setSelectedCandidate(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-indigo-600 rounded-t-xl px-6 py-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          Candidates Applied for {job.jobTitle}
        </h3>
        <button
          onClick={onBack}
          className="text-white hover:text-gray-200 focus:outline-none transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <p className="text-red-500 text-sm text-center mb-6 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}
        {candidates.length === 0 ? (
          <p className="text-gray-700 text-center">No candidates have applied for this job yet.</p>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => openModal(candidate)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{candidate.candidateName}</h4>
                    <p className="text-sm text-gray-600">{candidate.candidateEmail}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied: {new Date(candidate.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </p>
                  </div>
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    {candidate.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(candidate.candidateId, "approved")}
                          className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(candidate.candidateId, "rejected")}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors duration-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-b-xl border-t border-gray-200 px-6 py-4 flex justify-end">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
        >
          Back to Jobs
        </button>
      </div>

      {/* Modal for Candidate Details */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 hide-scrollbar bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-green-900">
                Application Details - {selectedCandidate.candidateName}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-500">Full Name</p>
                  <p>{selectedCandidate.candidateName}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Email Address</p>
                  <p>{selectedCandidate.candidateEmail}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Phone Number</p>
                  <p>{selectedCandidate.phoneNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Current Location</p>
                  <p>{selectedCandidate.currentLocation || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">LinkedIn Profile</p>
                  <p>
                    {selectedCandidate.linkedInProfile ? (
                      <a
                        href={selectedCandidate.linkedInProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedCandidate.linkedInProfile}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">GitHub Profile</p>
                  <p>
                    {selectedCandidate.gitHubProfile ? (
                      <a
                        href={selectedCandidate.gitHubProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedCandidate.gitHubProfile}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-500">Portfolio Website</p>
                  <p>
                    {selectedCandidate.portfolioWebsite ? (
                      <a
                        href={selectedCandidate.portfolioWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedCandidate.portfolioWebsite}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-500">Highest Qualification</p>
                    <p>{selectedCandidate.highestQualification}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">University/College Name</p>
                    <p>{selectedCandidate.universityName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Passing Year</p>
                    <p>{selectedCandidate.passingYear}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-500">Fresher/Experienced</p>
                    <p>{selectedCandidate.isFresher ? "Fresher" : "Experienced"}</p>
                  </div>
                  {!selectedCandidate.isFresher && (
                    <>
                      <div>
                        <p className="font-medium text-gray-500">Total Experience (Years)</p>
                        <p>{selectedCandidate.totalExperience}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Previous Company Name</p>
                        <p>{selectedCandidate.previousCompanyName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Previous Role</p>
                        <p>{selectedCandidate.previousRole || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Notice Period</p>
                        <p>{selectedCandidate.noticePeriod || "Not provided"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-500">Primary Skills</p>
                    <p>{selectedCandidate.primarySkills}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Other Skills</p>
                    <p>{selectedCandidate.otherSkills || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-500">Why should we hire you?</p>
                    <p>{selectedCandidate.whyHireYou || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Current CTC (₹)</p>
                    <p>{selectedCandidate.currentCTC || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Expected CTC (₹)</p>
                    <p>{selectedCandidate.expectedCTC || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-500">Resume</p>
                    <p>
                      {selectedCandidate.resumeUrl ? (
                        <a
                          href={selectedCandidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesList;