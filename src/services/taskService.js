import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Fetch tasks for a specific board
 */
export const fetchTasksByBoard = async (boardId) => {
  try {
    const apperClient = getApperClient();
    
    // Set up params to fetch tasks for the specific board
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Name" } },
        { Field: { Name: "title" } },
        { Field: { Name: "description" } },
        { Field: { Name: "status" } },
        { Field: { Name: "priority" } },
        { Field: { Name: "dueDate" } },
        { Field: { Name: "Tags" } },
        { Field: { Name: "board" } },
        { Field: { Name: "CreatedOn" } },
        { Field: { Name: "ModifiedOn" } }
      ],
      where: [
        {
          fieldName: "board",
          Operator: "ExactMatch",
          values: [boardId.toString()]
        }
      ],
      orderBy: [
        { field: "CreatedOn", direction: "desc" }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords('task26', params);
    
    if (!response || !response.data) {
      throw new Error("No data returned from the server");
    }
    
    // Format the tasks to match the application's expected structure
    const formattedTasks = response.data.map(task => ({
      ...task,
      id: task.Id.toString(), // Maintain compatibility with frontend expecting string ids
      title: task.title || task.Name, // Use title or fallback to Name
      createdAt: task.CreatedOn,
      updatedAt: task.ModifiedOn,
      tags: task.Tags || []
    }));
    
    return formattedTasks;
  } catch (error) {
    console.error(`Error fetching tasks for board ${boardId}:`, error);
    toast.error("Failed to load tasks");
    throw error;
  }
};

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare the record
    const params = {
      records: [{
        Name: taskData.title, // Use the title as the Name field
        title: taskData.title,
        description: taskData.description || "",
        status: taskData.status || "todo",
        priority: taskData.priority || "medium",
        dueDate: taskData.dueDate || null,
        Tags: taskData.tags || [],
        board: taskData.boardId // Reference to the board
      }]
    };
    
    const response = await apperClient.createRecord('task26', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create task");
    }
    
    const createdTask = response.results?.[0]?.data;
    
    if (!createdTask) {
      throw new Error("No task data returned after creation");
    }
    
    // Format the task to match the application's expected structure
    return {
      ...createdTask,
      id: createdTask.Id.toString(),
      title: createdTask.title || createdTask.Name,
      createdAt: createdTask.CreatedOn,
      updatedAt: createdTask.ModifiedOn,
      tags: createdTask.Tags || []
    };
  } catch (error) {
    console.error("Error creating task:", error);
    toast.error("Failed to create task");
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare the record
    const params = {
      records: [{
        Id: taskData.Id,
        Name: taskData.title, // Update Name to match title
        title: taskData.title,
        description: taskData.description || "",
        status: taskData.status || "todo",
        priority: taskData.priority || "medium",
        dueDate: taskData.dueDate || null,
        Tags: taskData.tags || [],
        board: taskData.boardId // Reference to the board
      }]
    };
    
    const response = await apperClient.updateRecord('task26', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update task");
    }
    
    const updatedTask = response.results?.[0]?.data;
    
    if (!updatedTask) {
      throw new Error("No task data returned after update");
    }
    
    // Format the task to match the application's expected structure
    return {
      ...updatedTask,
      id: updatedTask.Id.toString(),
      title: updatedTask.title || updatedTask.Name,
      createdAt: updatedTask.CreatedOn,
      updatedAt: updatedTask.ModifiedOn,
      tags: updatedTask.Tags || []
    };
  } catch (error) {
    console.error("Error updating task:", error);
    toast.error("Failed to update task");
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [taskId]
    };
    
    const response = await apperClient.deleteRecord('task26', params);
    
    return response && response.success;
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.error("Failed to delete task");
    throw error;
  }
};

/**
 * Update task status (used for drag and drop)
 */
export const updateTaskStatus = async (taskId, newStatus) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: taskId,
        status: newStatus
      }]
    };
    
    const response = await apperClient.updateRecord('task26', params);
    
    return response && response.success;
  } catch (error) {
    console.error("Error updating task status:", error);
    toast.error("Failed to update task status");
    throw error;
  }
};