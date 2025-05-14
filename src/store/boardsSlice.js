import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  boards: [],
  selectedBoardId: null,
  loading: false,
  error: null,
};

export const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoardsLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setBoardsSuccess: (state, action) => {
      state.boards = action.payload;
      state.loading = false;
      state.error = null;
    },
    setBoardsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedBoardId: (state, action) => {
      state.selectedBoardId = action.payload;
    },
    addBoard: (state, action) => {
      state.boards.push(action.payload);
    },
    updateBoard: (state, action) => {
      const index = state.boards.findIndex(board => board.Id === action.payload.Id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
    },
    removeBoard: (state, action) => {
      state.boards = state.boards.filter(board => board.Id !== action.payload);
    }
  },
});

export const { setBoardsLoading, setBoardsSuccess, setBoardsError, setSelectedBoardId, addBoard, updateBoard, removeBoard } = boardsSlice.actions;
export default boardsSlice.reducer;