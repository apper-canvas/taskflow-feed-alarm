import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import boardsReducer from './boardsSlice';
import tasksReducer from './tasksSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    boards: boardsReducer,
    tasks: tasksReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});