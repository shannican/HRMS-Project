import React, { useState, useEffect } from "react";
import axios from "../../../utils/axiosInstance";
import { useAuth } from "../../context/authHooks";
import toast from "react-hot-toast";
import moment from "moment";
import { FiEdit, FiTrash2, FiX, FiPlus, FiFilter, FiDownload } from "react-icons/fi";

// InputRow component for each day's row
const InputRow = ({ day, year, month, currentDate, worksheetData, handleEdit, setCurrentEntry, setIsDeleteModalOpen, isMobileView }) => {
  const entry = worksheetData.find((item) =>
    moment(item.date).isSame(moment(`${year}-${month}-${day}`, "YYYY-MM-DD"), "day")
  );
  const isFuture = moment(`${year}-${month}-${day}`, "YYYY-MM-DD").isAfter(currentDate, "day");

  // State to track expanded/collapsed status for each task
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleExpanded = (taskIndex) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskIndex]: !prev[taskIndex],
    }));
  };

  // Function to truncate task text after 4 words
  const truncateTask = (task) => {
    const words = task.split(" ");
    if (words.length > 4) {
      return words.slice(0, 4).join(" ") + "...";
    }
    return task;
  };

  if (isMobileView) {
    return (
      <div className={`bg-white rounded-lg p-3 shadow ${isFuture ? "opacity-50" : ""}`}>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          {moment(`${year}-${month}-${day}`, "YYYY-MM-DD").format("YYYY-MM-DD")}
        </h3>
        <div className="space-y-2 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">Check-in</label>
            <p>{entry ? entry.checkIn : "N/A"}</p>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Check-out</label>
            <p>{entry ? entry.checkOut : "N/A"}</p>
          </div>
          <div className="max-w-[200px]">
            <label className="block text-gray-600 mb-1">Tasks</label>
            {entry && entry.tasks.length > 0 ? (
              <ul className="list-disc list-inside">
                {entry.tasks.map((task, index) => {
                  const isExpanded = expandedTasks[index];
                  const shouldTruncate = task.split(" ").length > 4;
                  const displayedTask = isExpanded || !shouldTruncate ? task : truncateTask(task);

                  return (
                    <li key={index} className="flex items-center justify-between">
                      <span
                        className={isExpanded ? "whitespace-normal" : "whitespace-nowrap overflow-hidden text-ellipsis"}
                        style={{ maxWidth: "calc(100% - 60px)" }}
                      >
                        {displayedTask}
                      </span>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="text-blue-600 hover:text-blue-800 text-xs ml-2"
                        >
                          {isExpanded ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Time Spent</label>
            {entry && entry.timeSpent.length > 0 ? (
              <ul className="list-disc list-inside">
                {entry.timeSpent.map((time, index) => (
                  <li key={index}>{time}</li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Status</label>
            {entry && entry.taskStatuses && entry.taskStatuses.length > 0 ? (
              <ul className="list-disc list-inside">
                {entry.taskStatuses.map((status, index) => (
                  <li key={index}>{status}</li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div className="flex gap-2">
            {entry && !isFuture && (
              <>
                <button
                  onClick={() => handleEdit(entry)}
                  className="flex-1 py-1 px-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setCurrentEntry(entry);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex-1 py-1 px-2 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className={`border-b ${isFuture ? "bg-gray-100" : ""}`}>
      <td className="p-2 sm:p-3 text-xs sm:text-sm">{moment(`${year}-${month}-${day}`, "YYYY-MM-DD").format("YYYY-MM-DD")}</td>
      <td className="p-2 sm:p-3 text-xs sm:text-sm">{entry ? entry.checkIn : "N/A"}</td>
      <td className="p-2 sm:p-3 text-xs sm:text-sm">{entry ? entry.checkOut : "N/A"}</td>
      <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[200px]">
        {entry && entry.tasks.length > 0 ? (
          <ul className="list-disc list-inside">
            {entry.tasks.map((task, index) => {
              const isExpanded = expandedTasks[index];
              const shouldTruncate = task.split(" ").length > 4;
              const displayedTask = isExpanded || !shouldTruncate ? task : truncateTask(task);

              return (
                <li key={index} className="flex items-center justify-between">
                  <span
                    className={isExpanded ? "whitespace-normal" : "whitespace-nowrap overflow-hidden text-ellipsis"}
                    style={{ maxWidth: "calc(100% - 60px)" }}
                  >
                    {displayedTask}
                  </span>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-blue-600 hover:text-blue-800 text-xs ml-2"
                    >
                      {isExpanded ? "Read Less" : "Read More"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          "N/A"
        )}
      </td>
      <td className="p-2 sm:p-3 text-xs sm:text-sm">
        {entry && entry.timeSpent.length > 0 ? (
          <ul className="list-disc list-inside">
            {entry.timeSpent.map((time, index) => (
              <li key={index}>{time}</li>
            ))}
          </ul>
        ) : (
          "N/A"
        )}
      </td>
      <td className="p-2 sm:p-3 text-xs sm:text-sm">
        {entry && entry.taskStatuses && entry.taskStatuses.length > 0 ? (
          <ul className="list-disc list-inside">
            {entry.taskStatuses.map((status, index) => (
              <li key={index}>{status}</li>
            ))}
          </ul>
        ) : (
          "N/A"
        )}
      </td>
      <td className="p-2 sm:p-3 flex gap-1 sm:gap-2">
        {entry && !isFuture && (
          <>
            <button
              onClick={() => handleEdit(entry)}
              className="p-1 sm:p-2 text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <FiEdit className="text-sm sm:text-base" />
            </button>
            <button
              onClick={() => {
                setCurrentEntry(entry);
                setIsDeleteModalOpen(true);
              }}
              className="p-1 sm:p-2 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <FiTrash2 className="text-sm sm:text-base" />
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

// WorkReportModal component for displaying monthly work report
const WorkReportModal = ({ isOpen, onClose, worksheetData, year, month, isMobileView, currentDate }) => {
  // Filter worksheetData to show only from the 1st to the present day (May 18, 2025)
  const filteredWorksheetData = worksheetData.filter((entry) =>
    moment(entry.date).isSameOrBefore(currentDate, "day")
  );

  const handleDownloadCSV = () => {
    console.log("WorkReportModal: Generating CSV for", { year, month });
    const headers = ["Date", "Check-in", "Check-out", "Tasks", "Time Spent", "Status"];
    const rows = filteredWorksheetData.map((entry) => [
      `"${moment(entry.date).format("YYYY-MM-DD")}"`,
      `"${entry.checkIn}"`,
      `"${entry.checkOut}"`,
      `"${entry.tasks.join("; ").replace(/"/g, '""')}"`,
      `"${entry.timeSpent.join("; ").replace(/"/g, '""')}"`,
      `"${entry.taskStatuses ? entry.taskStatuses.join("; ").replace(/"/g, '""') : ""}"`,
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `work_report_${year}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("WorkReportModal: CSV downloaded");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl p-4 sm:p-6 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Work Report for {moment(`${year}-${month}`, "YYYY-MM").format("MMMM YYYY")} (1st to Present Day)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>
        {filteredWorksheetData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorksheetData.map((entry, rowIndex) => {
                    // State for expanded/collapsed status for each task in WorkReportModal
                    const [expandedTasks, setExpandedTasks] = useState({});

                    const toggleExpanded = (taskIndex) => {
                      setExpandedTasks((prev) => ({
                        ...prev,
                        [taskIndex]: !prev[taskIndex],
                      }));
                    };

                    // Function to truncate task text after 4 words
                    const truncateTask = (task) => {
                      const words = task.split(" ");
                      if (words.length > 4) {
                        return words.slice(0, 4).join(" ") + "...";
                      }
                      return task;
                    };

                    return (
                      <tr key={rowIndex}>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">{moment(entry.date).format("YYYY-MM-DD")}</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">{entry.checkIn}</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">{entry.checkOut}</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-[200px]">
                          <ul className="list-disc list-inside">
                            {entry.tasks.map((task, index) => {
                              const isExpanded = expandedTasks[index];
                              const shouldTruncate = task.split(" ").length > 4;
                              const displayedTask = isExpanded || !shouldTruncate ? task : truncateTask(task);

                              return (
                                <li key={index} className="flex items-center justify-between">
                                  <span
                                    className={isExpanded ? "whitespace-normal" : "whitespace-nowrap overflow-hidden text-ellipsis"}
                                    style={{ maxWidth: "calc(100% - 60px)" }}
                                  >
                                    {displayedTask}
                                  </span>
                                  {shouldTruncate && (
                                    <button
                                      onClick={() => toggleExpanded(index)}
                                      className="text-blue-600 hover:text-blue-800 text-xs ml-2"
                                    >
                                      {isExpanded ? "Read Less" : "Read More"}
                                    </button>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <ul className="list-disc list-inside">
                            {entry.timeSpent.map((time, i) => (
                              <li key={i}>{time}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          {entry.taskStatuses && entry.taskStatuses.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {entry.taskStatuses.map((status, i) => (
                                <li key={i}>{status}</li>
                              ))}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDownloadCSV}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <FiDownload /> Download Report
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">No tasks found from the 1st to the present day.</p>
        )}
      </div>
    </div>
  );
};

// AddEditModal component for adding/editing worksheet entries
const AddEditModal = ({ currentEntry, setCurrentEntry, handleSave, isMobileView, setIsModalOpen, isEditMode, existingDates }) => {
  const [formData, setFormData] = useState(
    currentEntry
      ? {
          checkIn: currentEntry.checkIn,
          checkOut: currentEntry.checkOut,
          tasks: currentEntry.tasks,
          timeSpent: currentEntry.timeSpent,
          taskStatuses: currentEntry.taskStatuses,
        }
      : {
          checkIn: moment().format("HH:mm"),
          checkOut: moment().format("HH:mm"),
          tasks: [""],
          timeSpent: [""],
          taskStatuses: ["Pending"],
        }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const handleTimeChange = (index, value) => {
    const newTimeSpent = [...formData.timeSpent];
    newTimeSpent[index] = value;
    setFormData((prev) => ({ ...prev, timeSpent: newTimeSpent }));
  };

  const handleStatusChange = (index, value) => {
    const newStatuses = [...formData.taskStatuses];
    newStatuses[index] = value;
    setFormData((prev) => ({ ...prev, taskStatuses: newStatuses }));
  };

  const addTaskField = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ""],
      timeSpent: [...prev.timeSpent, ""],
      taskStatuses: [...prev.taskStatuses, "Pending"],
    }));
  };

  const removeTaskField = (index) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
      timeSpent: prev.timeSpent.filter((_, i) => i !== index),
      taskStatuses: prev.taskStatuses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (formData.tasks.length !== formData.timeSpent.length || formData.tasks.length !== formData.taskStatuses.length) {
      toast.error("Number of tasks, times, and statuses must match");
      return;
    }
    if (
      formData.tasks.some((task) => !task.trim()) ||
      formData.timeSpent.some((time) => !time.trim()) ||
      formData.taskStatuses.some((status) => !status)
    ) {
      toast.error("All tasks, times, and statuses must be filled");
      return;
    }

    // Check if a task already exists for today in add mode
    if (!isEditMode) {
      const today = moment().format("YYYY-MM-DD");
      if (existingDates.includes(today)) {
        toast.error("You have already submitted a task for this date. Please edit the existing task.");
        return;
      }
    }

    console.log("AddEditModal: Submitting form data", formData);
    handleSave(formData);
    console.log("AddEditModal: Closing modal after submit");
    setIsModalOpen(false);
    setCurrentEntry(null);
  };

  const handleClose = () => {
    console.log("AddEditModal: Closing modal via close button");
    setIsModalOpen(false);
    setCurrentEntry(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg p-4 sm:p-6 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">{isEditMode ? "Edit Worksheet" : "Add Task"}</h3>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">Check-in Time</label>
            <input
              type="time"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleInputChange}
              className="w-full p-2 border rounded text-xs sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">Check-out Time</label>
            <input
              type="time"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleInputChange}
              className="w-full p-2 border rounded text-xs sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">Tasks, Time Spent, and Status</label>
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  placeholder="Task"
                  className="w-full p-2 border rounded text-xs sm:text-sm"
                />
                <input
                  type="text"
                  value={formData.timeSpent[index]}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  placeholder="e.g., 2h 30m"
                  className="w-24 p-2 border rounded text-xs sm:text-sm"
                />
                <select
                  value={formData.taskStatuses[index]}
                  onChange={(e) => handleStatusChange(index, e.target.value)}
                  className="w-32 p-2 border rounded text-xs sm:text-sm"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                  <option value="Hold">Hold</option>
                  <option value="Pending">Pending</option>
                </select>
                {formData.tasks.length > 1 && (
                  <button
                    onClick={() => removeTaskField(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTaskField}
              className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
            >
              <FiPlus className="mr-1" /> Add Another Task
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3 sm:mt-4">
          <button
            onClick={handleClose}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded text-xs sm:text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="py-2 px-4 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700"
          >
            {isEditMode ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

// DeleteModal component for confirming deletion
const DeleteModal = ({ currentEntry, setCurrentEntry, handleDelete, setIsDeleteModalOpen }) => {
  if (!currentEntry) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Confirm Delete</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Are you sure you want to delete the worksheet entry for{" "}
          {moment(currentEntry.date).format("YYYY-MM-DD")}?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              console.log("DeleteModal: Closing modal via cancel button");
              setIsDeleteModalOpen(false);
              setCurrentEntry(null);
            }}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded text-xs sm:text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="py-2 px-4 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkSheet = () => {
  console.log("Rendering WorkSheet component");
  const { user } = useAuth();
  const [worksheetData, setWorksheetData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState(moment().format("YYYY-MM")); // Default to current month
  const [filteredData, setFilteredData] = useState(null);

  // Today's date: May 18, 2025
  const currentDate = moment("2025-05-18");
  const year = filterMonth ? parseInt(filterMonth.split("-")[0]) : currentDate.year();
  const month = filterMonth ? parseInt(filterMonth.split("-")[1]) : currentDate.month() + 1;
  const today = currentDate.date(); // 18
  const daysInMonth = moment(filterMonth || currentDate).daysInMonth();
  const endDay = filterMonth && year === currentDate.year() && month === currentDate.month() + 1 ? today : daysInMonth; // Limit to present day for current month
  const daysArray = Array.from({ length: endDay }, (_, i) => endDay - i); // Days in reverse: [endDay, endDay-1, ..., 1]

  // Extract existing dates for validation
  const existingDates = worksheetData.map((entry) => moment(entry.date).format("YYYY-MM-DD"));

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch worksheet data for the selected month
  useEffect(() => {
    if (!user || !user.userId) {
      console.log("WorkSheet: User not authenticated, showing login toast");
      toast.error("Please log in to view worksheets");
      return;
    }

    const fetchWorksheetData = async () => {
      setIsLoading(true);
      console.log("WorkSheet: Fetching worksheet data for", { year, month, userId: user.userId });
      try {
        const response = await axios.get(`/api/worksheet/month?year=${year}&month=${month}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("WorkSheet: Worksheet data fetched:", response.data);
        setWorksheetData(response.data);
      } catch (error) {
        console.error("WorkSheet: Error fetching worksheet:", error);
        toast.error("Failed to fetch worksheet data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorksheetData();
  }, [year, month, user]);

  // Handle form submission (save or update)
  const handleSave = async (formData) => {
    console.log("WorkSheet: Saving worksheet with data", formData);
    try {
      const entry = {
        date: isEditModalOpen ? moment(currentEntry.date).toISOString() : moment().toISOString(), // Use today's date for new entries
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        tasks: formData.tasks,
        timeSpent: formData.timeSpent,
        taskStatuses: formData.taskStatuses,
      };

      if (isEditModalOpen) {
        // Update existing entry
        console.log("WorkSheet: Updating worksheet ID:", currentEntry._id);
        const response = await axios.put(`/api/worksheet/${currentEntry._id}`, entry, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setWorksheetData((prev) =>
          prev.map((item) => (item._id === currentEntry._id ? response.data : item))
        );
        toast.success("Worksheet updated successfully");
      } else {
        // Save new entry
        console.log("WorkSheet: Creating new worksheet");
        const response = await axios.post("/api/worksheet", entry, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setWorksheetData((prev) => [...prev, response.data]);
        toast.success("Worksheet saved successfully");
      }
      setFilteredData(null); // Reset filter after save
    } catch (error) {
      console.error("WorkSheet: Error saving worksheet:", error);
      if (error.response && error.response.status === 400 && error.response.data.message === "You have already submitted a task for this date") {
        toast.error("You have already submitted a task for this date. Please edit the existing task.");
      } else {
        toast.error("Failed to save worksheet");
      }
    }
  };

  // Handle edit button click
  const handleEdit = (entry) => {
    console.log("WorkSheet: Opening edit modal for entry:", entry._id);
    setCurrentEntry(entry);
    setIsEditModalOpen(true);
    setIsAddModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async () => {
    console.log("WorkSheet: Deleting worksheet ID:", currentEntry._id);
    try {
      await axios.delete(`/api/worksheet/${currentEntry._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWorksheetData((prev) => prev.filter((item) => item._id !== currentEntry._id));
      toast.success("Worksheet deleted successfully");
      setIsDeleteModalOpen(false);
      setCurrentEntry(null);
      setFilteredData(null); // Reset filter after delete
    } catch (error) {
      console.error("WorkSheet: Error deleting worksheet:", error);
      toast.error("Failed to delete worksheet");
    }
  };

  // Handle CSV download for the main table
  const handleDownloadCSV = () => {
    console.log("WorkSheet: Generating CSV for", { year, month });
    const dataToExport = filteredData || worksheetData;
    const headers = ["Date", "Check-in", "Check-out", "Tasks", "Time Spent", "Status"];
    const rows = daysArray.map((day) => {
      const entry = dataToExport.find((item) =>
        moment(item.date).isSame(moment(`${year}-${month}-${day}`, "YYYY-MM-DD"), "day")
      );
      return [
        `"${moment(`${year}-${month}-${day}`, "YYYY-MM-DD").format("YYYY-MM-DD")}"`,
        `"${entry ? entry.checkIn : ""}"`,
        `"${entry ? entry.checkOut : ""}"`,
        `"${entry ? entry.tasks.join("; ").replace(/"/g, '""') : ""}"`,
        `"${entry ? entry.timeSpent.join("; ").replace(/"/g, '""') : ""}"`,
        `"${entry && entry.taskStatuses ? entry.taskStatuses.join("; ").replace(/"/g, '""') : ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `worksheet_${year}_${month}${filteredData ? `_${moment(filterDate).format("YYYY-MM-DD")}` : ""}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("WorkSheet: CSV downloaded");
  };

  // Handle date filter
  const handleDateFilter = () => {
    if (!filterDate) {
      toast.error("Please select a date to filter");
      return;
    }

    const selectedDate = moment(filterDate);
    if (selectedDate.isAfter(currentDate, "day")) {
      toast.error("Cannot filter for future dates");
      return;
    }

    const filtered = worksheetData.filter((item) =>
      moment(item.date).isSame(selectedDate, "day")
    );
    setFilteredData(filtered);
    console.log("WorkSheet: Filtered data for date", filterDate, filtered);
  };

  if (isLoading) {
    console.log("WorkSheet: Rendering loading state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full sm:max-w-8xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Employee Worksheet</h1>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  setFilteredData(null); // Reset date filter when changing month
                  setFilterDate("");
                }}
                className="p-2 border rounded text-xs sm:text-sm"
              />
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="py-2 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 text-xs sm:text-sm flex items-center gap-2"
              >
                <FiFilter /> Work Report
              </button>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                max={currentDate.format("YYYY-MM-DD")}
                className="p-2 border rounded text-xs sm:text-sm"
              />
              <button
                onClick={handleDateFilter}
                className="py-2 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 text-xs sm:text-sm flex items-center gap-2"
              >
                <FiFilter /> Filter by Date
              </button>
              {filteredData && (
                <button
                  onClick={() => {
                    setFilteredData(null);
                    setFilterDate("");
                  }}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 text-xs sm:text-sm"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
            <button
              onClick={handleDownloadCSV}
              className="py-2 px-4 sm:px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-xs sm:text-sm flex items-center gap-2"
            >
              <svg
                className="h-4 sm:h-5 w-4 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Download CSV
            </button>
            <button
              onClick={() => {
                console.log("WorkSheet: Opening add task modal");
                setIsAddModalOpen(true);
                setIsEditModalOpen(false);
              }}
              className="py-2 px-4 sm:px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-xs sm:text-sm flex items-center gap-2"
            >
              <FiPlus /> Add Task
            </button>
          </div>
        </div>

        {isMobileView ? (
          <div className="space-y-4">
            {(filteredData || worksheetData).length > 0 ? (
              (filteredData || daysArray).map((day) => (
                <InputRow
                  key={filteredData ? day._id : day}
                  day={filteredData ? moment(day.date).date() : day}
                  year={year}
                  month={month}
                  currentDate={currentDate}
                  worksheetData={filteredData || worksheetData}
                  handleEdit={handleEdit}
                  setCurrentEntry={setCurrentEntry}
                  setIsDeleteModalOpen={setIsDeleteModalOpen}
                  isMobileView={isMobileView}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">No data found for the selected date</p>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredData || worksheetData).length > 0 ? (
                  (filteredData || daysArray).map((day) => (
                    <InputRow
                      key={filteredData ? day._id : day}
                      day={filteredData ? moment(day.date).date() : day}
                      year={year}
                      month={month}
                      currentDate={currentDate}
                      worksheetData={filteredData || worksheetData}
                      handleEdit={handleEdit}
                      setCurrentEntry={setCurrentEntry}
                      setIsDeleteModalOpen={setIsDeleteModalOpen}
                      isMobileView={isMobileView}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-gray-500">
                      No data found for the selected date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {isAddModalOpen && (
          <AddEditModal
            currentEntry={currentEntry}
            setCurrentEntry={setCurrentEntry}
            handleSave={handleSave}
            isMobileView={isMobileView}
            setIsModalOpen={setIsAddModalOpen}
            isEditMode={isEditModalOpen}
            existingDates={existingDates}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteModal
            currentEntry={currentEntry}
            setCurrentEntry={setCurrentEntry}
            handleDelete={handleDelete}
            setIsDeleteModalOpen={setIsDeleteModalOpen}
          />
        )}
        <WorkReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          worksheetData={worksheetData}
          year={year}
          month={month}
          isMobileView={isMobileView}
          currentDate={currentDate}
        />
      </div>
    </div>
  );
};

export default WorkSheet;