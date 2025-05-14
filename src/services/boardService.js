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
 * Fetch all boards for the current user
 */
export const fetchBoards = async () => {
  try {
    const apperClient = getApperClient();
    
    // Set up params to fetch boards owned by the current user
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Name" } },
        { Field: { Name: "description" } },
        { Field: { Name: "Tags" } },
        { Field: { Name: "Owner" } },
        { Field: { Name: "CreatedOn" } },
        { Field: { Name: "CreatedBy" } }
      ],
      orderBy: [
        { field: "CreatedOn", direction: "desc" }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords('board', params);
    
    if (!response || !response.data) {
      throw new Error("No data returned from the server");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching boards:", error);
    toast.error("Failed to load boards");
    throw error;
  }
};

/**
 * Create a new board
 */
export const createBoard = async (boardData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare the record
    const params = {
      records: [{
        Name: boardData.name,
        description: boardData.description || "",
        Tags: boardData.tags || []
      }]
    };
    
    const response = await apperClient.createRecord('board', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to create board");
    }
    
    const createdBoard = response.results?.[0]?.data;
    
    if (!createdBoard) {
      throw new Error("No board data returned after creation");
    }
    
    return createdBoard;
  } catch (error) {
    console.error("Error creating board:", error);
    toast.error("Failed to create board");
    throw error;
  }
};

/**
 * Update an existing board
 */
export const updateBoard = async (boardData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare the record
    const params = {
      records: [{
        Id: boardData.Id,
        Name: boardData.Name,
        description: boardData.description || "",
        Tags: boardData.Tags || []
      }]
    };
    
    const response = await apperClient.updateRecord('board', params);
    
    if (!response || !response.success) {
      throw new Error("Failed to update board");
    }
    
    const updatedBoard = response.results?.[0]?.data;
    
    if (!updatedBoard) {
      throw new Error("No board data returned after update");
    }
    
    return updatedBoard;
  } catch (error) {
    console.error("Error updating board:", error);
    toast.error("Failed to update board");
    throw error;
  }
};

/**
 * Delete a board
 */
export const deleteBoard = async (boardId) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [boardId]
    };
    
    const response = await apperClient.deleteRecord('board', params);
    
    return response && response.success;
  } catch (error) {
    console.error("Error deleting board:", error);
    toast.error("Failed to delete board");
    throw error;
  }
};