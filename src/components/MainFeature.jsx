import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setTasksLoading, setTasksSuccess, setTasksError, addTask, updateTask, removeTask, setTaskFilter } from '../store/tasksSlice';
import { fetchTasksByBoard, createTask, updateTask as apiUpdateTask, deleteTask, updateTaskStatus } from '../services/taskService';
import getIcon from '../utils/iconUtils';
import { format } from 'date-fns';
// Define task status columns
const COLUMNS = [
  { id: 'todo', name: 'To Do', color: 'bg-blue-500', icon: 'CheckCircle2' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-yellow-500', icon: 'Clock' },
  { id: 'done', name: 'Done', color: 'bg-green-500', icon: 'CheckCircle' }
];

// Priority options
const PRIORITIES = [
  { id: 'low', name: 'Low', color: 'bg-blue-400' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-400' },
  { id: 'high', name: 'High', color: 'bg-orange-400' },
  { id: 'urgent', name: 'Urgent', color: 'bg-red-500' }
];

function MainFeature({ boardId }) {
  const dispatch = useDispatch();
  const { tasks: allTasks, loading, error, filterPriority, searchTerm, sortBy, sortDirection } = useSelector(state => state.tasks);
  
  // Get tasks for this board
  const tasks = allTasks[boardId] || [];
  
  // Load tasks for this board
  useEffect(() => {
    const loadTasks = async () => {
      try {
        dispatch(setTasksLoading());
        const tasksData = await fetchTasksByBoard(boardId);
        dispatch(setTasksSuccess({ boardId, tasks: tasksData }));
      } catch (error) {
        dispatch(setTasksError(error.message));
        toast.error("Failed to load tasks");
      }
    };
    
    loadTasks();
  }, [boardId, dispatch]);
  
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    tags: []
  });
  const [newTagInput, setNewTagInput] = useState('');
  const [draggingTask, setDraggingTask] = useState(null);
  const [dropTargetColumn, setDropTargetColumn] = useState(null);

  // Set up icons
  const PlusIcon = getIcon('Plus');
  const XIcon = getIcon('X');
  const TagIcon = getIcon('Tag');
  const CalendarIcon = getIcon('Calendar');
  const AlertCircleIcon = getIcon('AlertCircle');
  const EditIcon = getIcon('Edit');
  const TrashIcon = getIcon('Trash');
  const FilterIcon = getIcon('Filter');
  const InfoIcon = getIcon('Info');
  const SearchIcon = getIcon('Search');
  const ArrowUpDownIcon = getIcon('ArrowUpDown');
  const CheckCircle2Icon = getIcon('CheckCircle2');
  const ClockIcon = getIcon('Clock');
  const CheckCircleIcon = getIcon('CheckCircle');
  const LoaderIcon = getIcon('Loader');

  // Filtering state
  const [showFilters, setShowFilters] = useState(false); 
  

  // Reset form
  const resetTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      tags: []
    });
    setNewTagInput('');
  };

  // Create or update task
  const handleSaveTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        const taskToUpdate = tasks.find(task => task.id === editingTask);
        if (taskToUpdate) {
          const updatedTaskData = {
            Id: taskToUpdate.Id,
            ...newTask,
            boardId: boardId
          };
          const updatedTask = await apiUpdateTask(updatedTaskData);
          dispatch(updateTask({ boardId, task: updatedTask }));
          toast.success('Task updated successfully');
        }
      } else {
        // Create new task
        const newTaskData = {
          ...newTask,
          boardId: boardId
        };
        const createdTask = await createTask(newTaskData);
        dispatch(addTask({ boardId, task: createdTask }));
        toast.success('Task created successfully');
      }
      
      setIsCreatingTask(false);
      setEditingTask(null);
      resetTaskForm();
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
    }
  };

  // Open edit modal
  const handleEditTask = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      tags: task.tags || []
    });
    setEditingTask(task.id);
    setIsCreatingTask(true);
  };

  // Add tag to task
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    
    if (!newTask.tags.includes(newTagInput.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, newTagInput.trim()]
      }));
    }
    
    setNewTagInput('');
  };

  // Remove tag from task
  const handleRemoveTag = (tagToRemove) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle drag start
  const handleDragStart = (task) => { 
    setDraggingTask(task);
  };

  // Handle drag over column
  const handleDragOver = (columnId, e) => { 
    e.preventDefault();
    setDropTargetColumn(columnId);
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        dispatch(removeTask({ boardId, taskId }));
        toast.success('Task deleted');
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      toast.error('Error deleting task');
    }
  };

  // Handle drop
  const handleDrop = async (columnId) => {
    if (draggingTask && draggingTask.status !== columnId) {
      try {
        const success = await updateTaskStatus(draggingTask.Id || draggingTask.id, columnId);
        if (success) {
          const updatedTask = { ...draggingTask, status: columnId };
          dispatch(updateTask({ boardId, task: updatedTask }));
          toast.info(`Task moved to ${COLUMNS.find(col => col.id === columnId).name}`);
        }
      } catch (error) {
        toast.error('Failed to update task status');
      }
    }
    setDraggingTask(null);
    setDropTargetColumn(null);
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    return tasks
      .filter(task => {
        // Priority filter
        if (filterPriority !== 'all' && task.priority !== filterPriority) {
          return false;
        }
        
        // Search filter
        if (
          searchTerm &&
          !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        ) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Sort based on selected criteria
        let valA, valB;
        
        switch (sortBy) {
          case 'dueDate':
              valA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; 
            valB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            break;
          case 'priority':
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            valA = priorityOrder[a.priority];
            valB = priorityOrder[b.priority];
            break;
          case 'createdAt':
          default:
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
        }
        
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Set task filter in Redux
  const handleFilterChange = (filterData) => {
    dispatch(setTaskFilter(filterData));
  };

  // Handle filter form state changes
  const setFilterPriority = (value) => handleFilterChange({ filterPriority: value });
  const setSearchTerm = (value) => handleFilterChange({ searchTerm: value });
  const setSortBy = (value) => handleFilterChange({ sortBy: value });
  const setSortDirection = (value) => handleFilterChange({ sortDirection: value });
  
  
  // Get tasks for a specific column
  const getTasksForColumn = (columnId) => {
    return filteredTasks.filter(task => task.status === columnId);
  };

  // Task drag wrapper component
  const TaskCard = ({ task }) => {
    const priorityInfo = PRIORITIES.find(p => p.id === task.priority);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="card p-4 mb-3 cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={() => handleDragStart(task)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-surface-900 dark:text-white">{task.title}</h3>
          <div className="flex gap-1">
            <button 
              onClick={() => handleEditTask(task)}
              className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500"
              aria-label="Edit task"
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500"
              aria-label="Delete task"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-surface-700 dark:text-surface-300 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {task.tags && task.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200 flex items-center gap-1" 
            >
              <TagIcon className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${priorityInfo.color}`}></span>
            <span className="text-surface-600 dark:text-surface-400">{priorityInfo.name}</span>
          </div>
          
          {task.dueDate && (
            <div className="flex items-center gap-1 text-surface-600 dark:text-surface-400">
              <CalendarIcon className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span> 
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <button
          onClick={() => {
            setIsCreatingTask(true);
            setEditingTask(null);
            resetTaskForm();
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Task</span>
        </button>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="input pl-9 w-full sm:w-64"
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center gap-2"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Priority</label>
                <select
                  className="input w-full"
                  value={filterPriority} 
                  onChange={e => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  {PRIORITIES.map(priority => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Sort By</label>
                <select
                  className="input w-full"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Created Date</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              
              <div>
                <label className="label">Sort Direction</label>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="input w-full flex justify-between items-center" 
                >
                  <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                  <ArrowUpDownIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-surface-600 dark:text-surface-400">Loading tasks...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 btn btn-outline text-red-600 dark:text-red-400">Retry</button>
        </div>
      )}
      
      {!loading && !error && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(column => {
          const columnTasks = getTasksForColumn(column.id);
          const ColumnIcon = getIcon(column.icon);
          
          return (
            <div 
              key={column.id}
              className={`bg-white dark:bg-surface-800 rounded-xl border-t-4 ${column.color} shadow-card dark:shadow-none`}
              onDragOver={(e) => handleDragOver(column.id, e)}
              onDrop={() => handleDrop(column.id)}
              style={{ 
                borderTopLeftRadius: '0.5rem', 
                borderTopRightRadius: '0.5rem'
              }}
            >
              <div className="p-4 border-b border-surface-200 dark:border-surface-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                    <ColumnIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                    <span>{column.name}</span>
                  </h3>
                  <span className="bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200 text-xs font-medium px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              
              <div 
                className={`p-4 min-h-[200px] transition-colors ${
                  dropTargetColumn === column.id ? 'bg-surface-100 dark:bg-surface-700/50' : ''
                }`}
              >
                <AnimatePresence>
                  {columnTasks.length > 0 ? (
                    columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center py-8 text-center text-surface-500 dark:text-surface-400"
                    >
                      <InfoIcon className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm">No tasks here yet</p>
                      <p className="text-xs mt-1">Drag tasks here or add a new one</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      )}
      
      {/* Task Modal */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button 
                onClick={() => {
                  setIsCreatingTask(false);
                  setEditingTask(null);
                }}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
              >
                <XIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTask(); }} className="space-y-4">
              <div>
                <label htmlFor="taskTitle" className="label">Task Title *</label>
                <input
                  id="taskTitle"
                  type="text"
                  className="input w-full"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="taskDescription" className="label">Description</label>
                <textarea
                  id="taskDescription"
                  className="input w-full min-h-[80px]"
                  placeholder="Add details about this task..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskStatus" className="label">Status</label>
                  <select
                    id="taskStatus"
                    className="input w-full"
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    {COLUMNS.map(column => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="taskPriority" className="label">Priority</label>
                  <select
                    id="taskPriority"
                    className="input w-full"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="taskDueDate" className="label">Due Date</label>
                <input
                  id="taskDueDate"
                  type="date"
                  className="input w-full"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              
              <div>
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newTask.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs px-2 py-1 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200 flex items-center gap-1"
                    >
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Add a tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={handleAddTag}
                    className="btn btn-outline"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsCreatingTask(false);
                    setEditingTask(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Information banner for empty state */}
      {tasks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center mt-8"
        >
          <div className="flex flex-col items-center p-4">
            <CheckCircle2Icon className="w-16 h-16 text-primary mb-4 opacity-80" />
            <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">Get Started with TaskFlow</h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4 max-w-md mx-auto">
              Create your first task by clicking the "Add Task" button above. 
              Organize your work and track progress across different statuses.
            </p>
            <button
              onClick={() => {
                setIsCreatingTask(true);
                setEditingTask(null);
                resetTaskForm();
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Your First Task</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default MainFeature;