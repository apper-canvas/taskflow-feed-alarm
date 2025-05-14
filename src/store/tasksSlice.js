import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: {},  // Organized by boardId: { [boardId]: tasks[] }
  loading: false,
  error: null,
  filterPriority: 'all',
  searchTerm: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasksLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setTasksSuccess: (state, action) => {
      const { boardId, tasks } = action.payload;
      state.tasks[boardId] = tasks;
      state.loading = false;
      state.error = null;
    },
    setTasksError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addTask: (state, action) => {
      const { boardId, task } = action.payload;
      if (!state.tasks[boardId]) {
        state.tasks[boardId] = [];
      }
      state.tasks[boardId].push(task);
    },
    updateTask: (state, action) => {
      const { boardId, task } = action.payload;
      if (state.tasks[boardId]) {
        const index = state.tasks[boardId].findIndex(t => t.Id === task.Id);
        if (index !== -1) {
          state.tasks[boardId][index] = task;
        }
      }
    },
    removeTask: (state, action) => {
      const { boardId, taskId } = action.payload;
      if (state.tasks[boardId]) {
        state.tasks[boardId] = state.tasks[boardId].filter(task => task.Id !== taskId);
      }
    },
    setTaskFilter: (state, action) => {
      const { filterPriority, searchTerm, sortBy, sortDirection } = action.payload;
      if (filterPriority !== undefined) state.filterPriority = filterPriority;
      if (searchTerm !== undefined) state.searchTerm = searchTerm;
      if (sortBy !== undefined) state.sortBy = sortBy;
      if (sortDirection !== undefined) state.sortDirection = sortDirection;
    }
  },
});

export const { setTasksLoading, setTasksSuccess, setTasksError, addTask, updateTask, removeTask, setTaskFilter } = tasksSlice.actions;
export default tasksSlice.reducer;