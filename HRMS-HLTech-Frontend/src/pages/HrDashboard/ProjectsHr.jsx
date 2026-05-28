import React, { useState } from 'react';

function ProjectsHr() {
  const [projects, setProjects] = useState([
    { name: 'School', status: 'Running', openTasks: 5, createdDate: '2023-05-01', createdBy: 'Md Jahidul Islam', description: 'Developing a school management system.' },
    { name: 'Furniture', status: 'Running', openTasks: 3, createdDate: '2023-06-15', createdBy: 'John Doe', description: 'E-commerce platform for furniture sales.' },
    { name: 'Company Website', status: 'Finished', openTasks: 0, createdDate: '2023-04-10', createdBy: 'Jane Smith', description: 'Revamping the company website.' },
    { name: 'Travel', status: 'Running', openTasks: 8, createdDate: '2023-07-01', createdBy: 'Alice Brown', description: 'Travel booking application.' },
    { name: 'Others', status: 'Cancelled', openTasks: 0, createdDate: '2023-03-20', createdBy: 'Bob Wilson', description: 'Miscellaneous tasks.' },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Running', openTasks: 0, createdDate: new Date().toISOString().split('T')[0], createdBy: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description || !newProject.createdBy) {
      alert('Please fill in all required fields');
      return;
    }
    setProjects([...projects, { ...newProject, openTasks: parseInt(newProject.openTasks) || 0 }]);
    setNewProject({ name: '', description: '', status: 'Running', openTasks: 0, createdDate: new Date().toISOString().split('T')[0], createdBy: '' });
    setIsAddModalOpen(false);
  };

  // Summary card data
  const summaryCards = [
    { title: 'New Projects', count: 3, icon: '📝' },
    { title: 'Running Projects', count: projects.filter(p => p.status === 'Running').length, icon: '🚀' },
    { title: 'On Hold Projects', count: 1, icon: '⏰' },
    { title: 'Finished Project', count: projects.filter(p => p.status === 'Finished').length, icon: '🚩' },
    { title: 'Upcoming Projects', count: 1, icon: '📅' },
    { title: 'All Projects', count: projects.length, icon: '💡' },
  ];

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-w-[100vw] sm:min-w-full min-h-screen">
      {/* Project Summary Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all text-center"
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{card.count}</p>
              <p className="text-sm text-gray-600 mt-1">{card.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Projects Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Projects ({projects.length})</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <svg
                className="w-5 h-5 text-gray-500 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Projects
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              onClick={() => handleProjectClick(project)}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-shadow"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600"><strong>Status:</strong> {project.status}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                  </svg>
                  <span className="text-gray-600"><strong>Open Tasks:</strong> {project.openTasks}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm-1 4h10v10H5V6z" />
                  </svg>
                  <span className="text-gray-600"><strong>Created Date:</strong> {project.createdDate}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a4 4 0 100-8 4 4 0 000 8zm0 2a6 6 0 01-6-6H2a8 8 0 0016 0h-2a6 6 0 01-6 6z" />
                  </svg>
                  <span className="text-gray-600"><strong>Created By:</strong> {project.createdBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{selectedProject.name}</h3>
            <p className="text-gray-600 mb-2"><strong>Status:</strong> {selectedProject.status}</p>
            <p className="text-gray-600 mb-2"><strong>Open Tasks:</strong> {selectedProject.openTasks}</p>
            <p className="text-gray-600 mb-2"><strong>Created Date:</strong> {selectedProject.createdDate}</p>
            <p className="text-gray-600 mb-2"><strong>Created By:</strong> {selectedProject.createdBy}</p>
            <p className="text-gray-600 mb-4"><strong>Description:</strong> {selectedProject.description}</p>
            <button
              onClick={() => setSelectedProject(null)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Project</h3>
            <form onSubmit={handleAddProject}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="Running">Running</option>
                  <option value="Finished">Finished</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Open Tasks</label>
                <input
                  type="number"
                  value={newProject.openTasks}
                  onChange={(e) => setNewProject({ ...newProject, openTasks: e.target.value })}
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Created Date</label>
                <input
                  type="date"
                  value={newProject.createdDate}
                  onChange={(e) => setNewProject({ ...newProject, createdDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Created By</label>
                <input
                  type="text"
                  value={newProject.createdBy}
                  onChange={(e) => setNewProject({ ...newProject, createdBy: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsHr;