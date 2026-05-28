import React, { useState } from 'react';
import toast from 'react-hot-toast';

const EditJobModal = ({ isEditModalOpen, setIsEditModalOpen, selectedJob, formData, setFormData, newQuestion, setNewQuestion, isLoading, handleEditSubmit, handleInputChange }) => {
  // State for skills input and AI recommendations
  const [skills, setSkills] = useState(formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : []);
  const [skillsInput, setSkillsInput] = useState('');
  const [skillsError, setSkillsError] = useState('');
  const [isGenerateMode, setIsGenerateMode] = useState(false);
  const [generateInput, setGenerateInput] = useState('');
  const [recommendedSkills, setRecommendedSkills] = useState([
    'React', 'Node.js', 'JavaScript', 'Python', 'Java', 'TypeScript', 'SQL', 'AWS'
  ]);

  // State for custom questions types, initialized with formData.customQuestionsTypes if available
  const [questionTypes, setQuestionTypes] = useState(
    formData.customQuestionsTypes && formData.customQuestionsTypes.length === formData.customQuestions.length
      ? formData.customQuestionsTypes
      : formData.customQuestions.map(() => 'Yes/No')
  );
  const [newQuestionType, setNewQuestionType] = useState('Yes/No'); // State for the new question type

  if (!isEditModalOpen || !selectedJob) return null;

  // Handle changes for nested salary range fields
  const handleSalaryRangeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [name]: value,
      },
    }));
  };

  // Handle checkbox for hiding salary
  const handleHideSalaryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        hideSalary: e.target.checked,
      },
    }));
  };

  // Handle changes for nested experience range fields
  const handleExperienceRangeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      experienceRange: {
        ...prev.experienceRange,
        [name]: value,
      },
    }));
  };

  // Handle skills input change
  const handleSkillsInputChange = (e) => {
    setSkillsInput(e.target.value);
  };

  // Add skill on Enter key press or comma
  const handleSkillsKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillsInput.trim();
      if (skill) {
        if (skills.length >= 6 && !skills.includes(skill)) {
          setSkillsError('You can add a maximum of 6 skills.');
          return;
        }
        if (!skills.includes(skill)) {
          const updatedSkills = [...skills, skill];
          setSkills(updatedSkills);
          setFormData((prev) => ({
            ...prev,
            skills: updatedSkills.join(', '),
          }));
          setSkillsInput('');
          setSkillsError('');
        }
      }
    }
  };

  // Remove a skill
  const removeSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setFormData((prev) => ({
      ...prev,
      skills: updatedSkills.join(', '),
    }));
    setSkillsError('');
  };

  // Toggle generative AI mode
  const toggleGenerateMode = () => {
    setIsGenerateMode(true);
  };

  // Handle generative AI input change
  const handleGenerateInputChange = (e) => {
    setGenerateInput(e.target.value);
  };

  // Add AI-recommended skill
  const addRecommendedSkill = (skill) => {
    if (skills.length >= 6 && !skills.includes(skill)) {
      setSkillsError('You can add a maximum of 6 skills.');
      return;
    }
    if (!skills.includes(skill)) {
      const updatedSkills = [...skills, skill];
      setSkills(updatedSkills);
      setFormData((prev) => ({
        ...prev,
        skills: updatedSkills.join(', '),
      }));
      setSkillsError('');
    }
  };

  // Add skill on comma in generative AI mode
  const handleGenerateKeyDown = (e) => {
    if (e.key === ',') {
      e.preventDefault();
      const skill = generateInput.trim();
      if (skill) {
        setRecommendedSkills((prev) => [...new Set([...prev, skill])]);
        setGenerateInput('');
      }
    }
  };

  // Handle custom question type change for existing questions
  const handleQuestionTypeChange = (index, value) => {
    const updatedTypes = [...questionTypes];
    updatedTypes[index] = value;
    setQuestionTypes(updatedTypes);
    // Update formData with the new question types
    setFormData((prev) => ({
      ...prev,
      customQuestionsTypes: updatedTypes,
    }));
  };

  // Add a custom question
  const addQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter a custom question');
      return;
    }
    if (formData.customQuestions.length >= 5) {
      toast.error('You can add a maximum of 5 custom questions.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customQuestions: [...prev.customQuestions, newQuestion.trim()],
      customQuestionsTypes: [...(prev.customQuestionsTypes || []), newQuestionType],
    }));
    setQuestionTypes((prev) => [...prev, newQuestionType]);
    setNewQuestion('');
    setNewQuestionType('Yes/No'); // Reset to default after adding
  };

  // Delete a custom question
  const deleteQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index),
      customQuestionsTypes: prev.customQuestionsTypes ? prev.customQuestionsTypes.filter((_, i) => i !== index) : [],
    }));
    setQuestionTypes((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission to ensure customQuestionsTypes is included
  const onSubmit = (e) => {
    e.preventDefault();
    // Ensure customQuestionsTypes is part of formData before submission
    setFormData((prev) => ({
      ...prev,
      customQuestionsTypes: questionTypes,
    }));
    handleEditSubmit(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-t-xl px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-white">Edit Job</h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="text-white hover:text-gray-200 focus:outline-none transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="e.g., Bangalore, India"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              >
                <option value="" disabled>
                  Select Job Type
                </option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            {/* Experience Range Section (Optional) */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Experience Range (Years)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                <input
                  type="number"
                  name="minExperience"
                  value={formData.experienceRange?.minExperience || ''}
                  onChange={handleExperienceRangeChange}
                  placeholder="1"
                  min="0"
                  className="w-full sm:w-24 p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <span className="text-gray-500 mx-2">to</span>
                <input
                  type="number"
                  name="maxExperience"
                  value={formData.experienceRange?.maxExperience || ''}
                  onChange={handleExperienceRangeChange}
                  placeholder="2"
                  min="0"
                  className="w-full sm:w-24 p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <span className="text-gray-500">years</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Optional: Leave blank to set as NA.</p>
            </div>
            {/* Salary Range Section */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Salary Range (₹)</label>
              <div className="flex flex-col space-y-4 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                  <select
                    name="currency"
                    value={formData.salaryRange?.currency || 'INR ₹'}
                    onChange={handleSalaryRangeChange}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full sm:w-32"
                  >
                    <option value="INR ₹">INR ₹</option>
                    <option value="USD $">USD $</option>
                    <option value="EUR €">EUR €</option>
                  </select>
                  <input
                    type="text"
                    name="minSalary"
                    value={formData.salaryRange?.minSalary || ''}
                    onChange={handleSalaryRangeChange}
                    placeholder="₹ 5,00,000"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                  <span className="text-gray-500 mx-2">to</span>
                  <input
                    type="text"
                    name="maxSalary"
                    value={formData.salaryRange?.maxSalary || ''}
                    onChange={handleSalaryRangeChange}
                    placeholder="₹ 6,00,000"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                  <select
                    name="unit"
                    value={formData.salaryRange?.unit || 'Per Year'}
                    onChange={handleSalaryRangeChange}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full sm:w-32"
                  >
                    <option value="Per Year">Per Year</option>
                    <option value="Per Month">Per Month</option>
                    <option value="Per Hour">Per Hour</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="hideSalary"
                      checked={formData.salaryRange?.hideSalary || false}
                      onChange={handleHideSalaryChange}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 text-sm">Hide salary from candidate</span>
                  </label>
                  <a href="#" className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Salary Estimator</span>
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Optional: Leave blank to set as NA.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-706 font-medium mb-2">
                Responsibilities <span className="text-red-500">*</span>
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y"
                rows="4"
                placeholder="List the key responsibilities (e.g., Write clean code, Collaborate with team)..."
                required
              ></textarea>
            </div>
            {/* Skills Section */}
            <div className="md:col-span-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Skills</h3>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Skills (Maximum 6) *
                  </label>
                  <div className="space-y-4">
                    {/* Skills Input */}
                    <div>
                      <div className="flex flex-wrap items-center border border-gray-300 rounded-lg p-2 min-h-[2.5rem]">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center bg-teal-100 text-teal-800 text-sm font-medium px-2.5 py-0.5 rounded-full m-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 text-teal-600 hover:text-teal-800 focus:outline-none"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={skillsInput}
                          onChange={handleSkillsInputChange}
                          onKeyDown={handleSkillsKeyDown}
                          placeholder={skills.length === 0 ? 'e.g., React, Node.js, Java' : ''}
                          className="flex-1 p-1 border-none focus:ring-0 outline-none text-sm"
                        />
                      </div>
                      {skillsError && <p className="text-red-500 text-sm mt-1">{skillsError}</p>}
                    </div>

                    {/* AI Recommended Skills */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">AI Recommended Skills</h4>
                      <div className="flex max-w-4xl flex-wrap gap-2">
                        {recommendedSkills.map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addRecommendedSkill(skill)}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                              skills.includes(skill)
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            } transition-colors duration-200`}
                          >
                            {skill}
                            <span className="ml-1">
                              {skills.includes(skill) ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {isGenerateMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={generateInput}
                              onChange={handleGenerateInputChange}
                              onKeyDown={handleGenerateKeyDown}
                              placeholder="e.g., MongoDB, TypeScript"
                              className="w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setIsGenerateMode(false)}
                              className="text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={toggleGenerateMode}
                            className="text-teal-600 hover:text-teal-800 text-sm underline focus:outline-none"
                          >
                            Generate More
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Custom Questions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-gray-700 font-medium">Custom Questions</label>
            </div>
            {formData.customQuestions.map((question, index) => (
              <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => deleteQuestion(index)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                  <div className="w-full sm:w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={questionTypes[index] || 'Yes/No'}
                      onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition-all duration-200 text-sm"
                    >
                      <option value="Yes/No">Yes/No</option>
                      <option value="Numeric">Numeric</option>
                      <option value="Text">Text</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <input
                      type="text"
                      value={question}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="w-full sm:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition-all duration-200 text-sm"
                  >
                    <option value="Yes/No">Yes/No</option>
                    <option value="Numeric">Numeric</option>
                    <option value="Text">Text</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Question"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>
            {formData.customQuestions.length < 5 && (
              <button
                type="button"
                onClick={addQuestion}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Add another question ({formData.customQuestions.length + 1}/5)</span>
              </button>
            )}
          </div>
          <div className="sticky bottom-0 bg-gray-50 rounded-b-xl border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 z-10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg shadow-sm text-sm font-medium text-white ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              } transition-all duration-200`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;