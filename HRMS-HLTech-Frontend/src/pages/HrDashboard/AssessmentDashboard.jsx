import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiPlus, FiX, FiCheck, FiXCircle } from 'react-icons/fi';

const AssessmentDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  // Sample data with approval status
  useEffect(() => {
    const sampleAssessments = [
      {
        id: 1,
        name: 'React Basics',
        duration: 60,
        questionsCount: 20,
        createdDate: '2025-05-10',
        skillLevel: 'Beginner',
        description: 'Basic React concepts',
        questions: [
          {
            text: 'What is JSX?',
            options: ['Syntax', 'Framework', 'Library', 'None'],
            correctAnswer: 'Syntax'
          }
        ],
        results: [
          { candidateName: 'John Doe', score: 85, timeTaken: '45 mins', date: '2025-05-12', status: 'Pending' }
        ]
      },
      {
        id: 2,
        name: 'JavaScript Advanced',
        duration: 45,
        questionsCount: 15,
        createdDate: '2025-05-15',
        skillLevel: 'Advanced',
        description: 'Advanced JavaScript concepts',
        questions: [
          {
            text: 'What is closure?',
            options: ['Function', 'Scope', 'Object', 'Variable'],
            correctAnswer: 'Scope'
          }
        ],
        results: [
          { candidateName: 'Jane Smith', score: 92, timeTaken: '35 mins', date: '2025-05-16', status: 'Approved' }
        ]
      }
    ];
    setAssessments(sampleAssessments);
  }, []);

  const handleDelete = (assessment) => {
    setSelectedAssessment(assessment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setAssessments(assessments.filter(a => a.id !== selectedAssessment.id));
    setIsDeleteModalOpen(false);
    setSelectedAssessment(null);
  };

  const handleApprove = (assessmentId, resultIndex) => {
    setAssessments(prevAssessments => 
      prevAssessments.map(assessment => 
        assessment.id === assessmentId
          ? {
              ...assessment,
              results: assessment.results.map((result, index) => 
                index === resultIndex ? { ...result, status: 'Approved' } : result
              )
            }
          : assessment
      )
    );
  };

  const handleReject = (assessmentId, resultIndex) => {
    setAssessments(prevAssessments => 
      prevAssessments.map(assessment => 
        assessment.id === assessmentId
          ? {
              ...assessment,
              results: assessment.results.map((result, index) => 
                index === resultIndex ? { ...result, status: 'Rejected' } : result
              )
            }
          : assessment
      )
    );
  };

  const filteredAssessments = assessments.filter(assessment => 
    assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterSkill ? assessment.skillLevel === filterSkill : true)
  );

  return (
    <div className="min-h-screen min-w-[99vw] sm:min-w-full bg-gray-50 p-2 md:p-6">
      <div className="max-w-8xl">
        {/* Header */}
        <div className="flex flex-row md:flex-row justify-between items-center mb-4 sm:mt-0 mt-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">
            Assessment Dashboard
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm md:text-base"
          >
            <FiPlus className="text-sm md:text-base" /> 
            <span className="hidden sm:inline">Create New</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 p-2 text-sm md:text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <FiFilter className="text-gray-600 hidden md:block" />
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="w-full md:w-auto p-2 text-sm md:text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">All Skills</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Assessments Table - Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredAssessments.map(assessment => (
            <div key={assessment.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{assessment.name}</h3>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  {assessment.skillLevel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p>{assessment.duration} mins</p>
                </div>
                <div>
                  <p className="text-gray-500">Questions</p>
                  <p>{assessment.questionsCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{assessment.createdDate}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedAssessment(assessment);
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                  title="Edit"
                >
                  <FiEdit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(assessment)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setSelectedAssessment(assessment);
                    setIsResultsModalOpen(true);
                  }}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                  title="View Results"
                >
                  <FiEye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Assessments Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-gray-600">Test Name</th>
                <th className="p-4 text-left text-gray-600">Duration</th>
                <th className="p-4 text-left text-gray-600">Questions</th>
                <th className="p-4 text-left text-gray-600">Created Date</th>
                <th className="p-4 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map(assessment => (
                <tr key={assessment.id} className="border-t">
                  <td className="p-4">{assessment.name}</td>
                  <td className="p-4">{assessment.duration} mins</td>
                  <td className="p-4">{assessment.questionsCount}</td>
                  <td className="p-4">{assessment.createdDate}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(assessment)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setIsResultsModalOpen(true);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Assessment Modal */}
        {isCreateModalOpen && (
          <AssessmentFormModal
            onClose={() => setIsCreateModalOpen(false)}
            onSave={(newAssessment) => {
              setAssessments([...assessments, { id: assessments.length + 1, ...newAssessment }]);
              setIsCreateModalOpen(false);
            }}
          />
        )}

        {/* Edit Assessment Modal */}
        {isEditModalOpen && selectedAssessment && (
          <AssessmentFormModal
            assessment={selectedAssessment}
            onClose={() => setIsEditModalOpen(false)}
            onSave={(updatedAssessment) => {
              setAssessments(assessments.map(a => 
                a.id === selectedAssessment.id ? { ...a, ...updatedAssessment } : a
              ));
              setIsEditModalOpen(false);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-3 md:mb-4">Confirm Delete</h3>
              <p className="mb-4 md:mb-6">Are you sure you want to delete "{selectedAssessment?.name}"?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm md:text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {isResultsModalOpen && selectedAssessment && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg p-4 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Results for {selectedAssessment.name}</h3>
                <button 
                  onClick={() => setIsResultsModalOpen(false)} 
                  className="text-gray-500 p-1"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Mobile Results View */}
              <div className="md:hidden space-y-3">
                {selectedAssessment.results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{result.candidateName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        result.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Score</p>
                        <p>{result.score}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time Taken</p>
                        <p>{result.timeTaken}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p>{result.date}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <button className="text-indigo-600 text-sm hover:underline">
                        View Details
                      </button>
                      {result.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(selectedAssessment.id, index)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <FiCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(selectedAssessment.id, index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Reject"
                          >
                            <FiXCircle size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Results View */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-gray-600">Candidate Name</th>
                      <th className="p-3 text-left text-gray-600">Score</th>
                      <th className="p-3 text-left text-gray-600">Time Taken</th>
                      <th className="p-3 text-left text-gray-600">Date</th>
                      <th className="p-3 text-left text-gray-600">Status</th>
                      <th className="p-3 text-left text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAssessment.results.map((result, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{result.candidateName}</td>
                        <td className="p-3">{result.score}%</td>
                        <td className="p-3">{result.timeTaken}</td>
                        <td className="p-3">{result.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            result.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            result.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button className="text-indigo-600 hover:underline text-sm">
                            View Details
                          </button>
                          {result.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(selectedAssessment.id, index)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(selectedAssessment.id, index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <FiXCircle size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AssessmentFormModal = ({ assessment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: assessment?.name || '',
    description: assessment?.description || '',
    duration: assessment?.duration || '',
    skillLevel: assessment?.skillLevel || 'Beginner',
    questions: assessment?.questions || [{ text: '', options: ['', '', '', ''], correctAnswer: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    if (field === 'text') {
      updatedQuestions[index].text = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = value;
    }
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAssessment = {
      ...formData,
      questionsCount: formData.questions.length,
      createdDate: new Date().toISOString().split('T')[0]
    };
    onSave(newAssessment);
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            {assessment ? 'Edit Assessment' : 'Create New Assessment'}
          </h3>
          <button onClick={onClose} className="text-gray-500 p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Test Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm md:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm md:text-base"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm md:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Skill Level</label>
            <select
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm md:text-base"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Questions</label>
            {formData.questions.map((question, index) => (
              <div key={index} className="border p-3 rounded-lg mb-3 relative">
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="absolute top-1 right-1 text-red-600 p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Question text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm md:text-base"
                    required
                  />
                </div>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Option ${optIndex + 1}`}
                      value={option}
                      onChange={(e) => handleQuestionChange(index, `option-${optIndex}`, e.target.value)}
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm md:text-base"
                      required
                    />
                    <input
                      type="radio"
                      name={`correctAnswer-${index}`}
                      value={option}
                      checked={question.correctAnswer === option}
                      onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                      className="ml-1"
                    />
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1 text-indigo-600 hover:underline text-sm md:text-base"
            >
              <FiPlus size={14} /> Add Question
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm md:text-base"
            >
              Save Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentDashboard;