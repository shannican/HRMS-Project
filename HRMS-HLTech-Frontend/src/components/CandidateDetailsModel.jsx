import React from 'react';

const CandidateDetailsModel = ({ selectedCandidate, isCandidateModalOpen, setIsCandidateModalOpen }) => {
  if (!isCandidateModalOpen || !selectedCandidate) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-t-xl px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-white">Candidate Details</h3>
          <button
            onClick={() => setIsCandidateModalOpen(false)}
            className="text-white hover:text-gray-200 focus:outline-none transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <p className="text-gray-900">{selectedCandidate.name}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <p className="text-gray-900">{selectedCandidate.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
              <p className="text-gray-900">{selectedCandidate.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Current Location</label>
              <p className="text-gray-900">{selectedCandidate.currentLocation || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">LinkedIn Profile</label>
              <p className="text-gray-900">
                {selectedCandidate.linkedInProfile ? (
                  <a href={selectedCandidate.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {selectedCandidate.linkedInProfile}
                  </a>
                ) : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">GitHub Profile</label>
              <p className="text-gray-900">
                {selectedCandidate.gitHubProfile ? (
                  <a href={selectedCandidate.gitHubProfile} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {selectedCandidate.gitHubProfile}
                  </a>
                ) : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Portfolio Website</label>
              <p className="text-gray-900">
                {selectedCandidate.portfolioWebsite ? (
                  <a href={selectedCandidate.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {selectedCandidate.portfolioWebsite}
                  </a>
                ) : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Highest Qualification</label>
              <p className="text-gray-900">{selectedCandidate.highestQualification || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">University Name</label>
              <p className="text-gray-900">{selectedCandidate.universityName || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Passing Year</label>
              <p className="text-gray-900">{selectedCandidate.passingYear || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Fresher</label>
              <p className="text-gray-900">{selectedCandidate.isFresher ? 'Yes' : 'No'}</p>
            </div>
            {!selectedCandidate.isFresher && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Total Experience (Years)</label>
                  <p className="text-gray-900">{selectedCandidate.totalExperience || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Previous Company Name</label>
                  <p className="text-gray-900">{selectedCandidate.previousCompanyName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Previous Role</label>
                  <p className="text-gray-900">{selectedCandidate.previousRole || 'Not provided'}</p>
                </div>
              </>
            )}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Notice Period</label>
              <p className="text-gray-900">{selectedCandidate.noticePeriod || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Primary Skills</label>
              <p className="text-gray-900">{selectedCandidate.skills.join(', ') || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Other Skills</label>
              <p className="text-gray-900">{selectedCandidate.otherSkills || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Resume</label>
              <p className="text-gray-900">
                {selectedCandidate.resumeUrl ? (
                  <a href={selectedCandidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    View Resume
                  </a>
                ) : 'Not provided'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Why Hire You?</label>
              <p className="text-gray-900">{selectedCandidate.whyHireYou || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Current CTC</label>
              <p className="text-gray-900">{selectedCandidate.currentCTC ? `${selectedCandidate.currentCTC} ₹` : 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Expected CTC</label>
              <p className="text-gray-900">{selectedCandidate.expectedCTC ? `${selectedCandidate.expectedCTC} ₹` : 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Application Date</label>
              <p className="text-gray-900">{selectedCandidate.date}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Hiring Stage</label>
              <p className="text-gray-900">{selectedCandidate.hiringStage}</p>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-50 rounded-b-xl border-t border-gray-200 px-6 py-4 flex justify-end z-10">
          <button
            onClick={() => setIsCandidateModalOpen(false)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModel;