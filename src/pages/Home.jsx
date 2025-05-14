import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoards, createBoard, deleteBoard } from '../services/boardService';
import { setBoardsLoading, setBoardsSuccess, setBoardsError, setSelectedBoardId, addBoard, removeBoard } from '../store/boardsSlice';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

function Home() {
  const dispatch = useDispatch();
  const { boards, selectedBoardId, loading, error } = useSelector(state => state.boards);
  
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  
  // Load boards on component mount
  useEffect(() => {
    const loadBoards = async () => {
      try {
        dispatch(setBoardsLoading());
        const boardsData = await fetchBoards();
        dispatch(setBoardsSuccess(boardsData));
        
        // Set selected board if none is selected or the selected one doesn't exist
        if (!selectedBoardId && boardsData.length > 0) {
          dispatch(setSelectedBoardId(boardsData[0].Id));
        } else if (selectedBoardId && !boardsData.find(board => board.Id === selectedBoardId) && boardsData.length > 0) {
          dispatch(setSelectedBoardId(boardsData[0].Id));
        }
      } catch (error) {
        dispatch(setBoardsError(error.message));
        toast.error("Failed to load boards");
      }
    };
    
    loadBoards();
  }, [dispatch, selectedBoardId]);
  
  // Icons
  const PlusIcon = getIcon('Plus');
  const LayoutDashboardIcon = getIcon('LayoutDashboard');
  const TrashIcon = getIcon('Trash');
  const XIcon = getIcon('X');
  const LoadingIcon = getIcon('Loader');
    
  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      toast.error('Board name cannot be empty');
      return;
    }
    
    try {
      const boardData = {
        name: newBoardName.trim(),
        description: newBoardDescription.trim()
      };
      
      const newBoard = await createBoard(boardData);
      dispatch(addBoard(newBoard));
      dispatch(setSelectedBoardId(newBoard.Id));
      
      setIsCreatingBoard(false);
      setNewBoardName('');
      setNewBoardDescription('');
      toast.success('Board created successfully');
    } catch (error) {
      toast.error('Failed to create board');
    }
  };
  
  const handleDeleteBoard = async (boardId) => {
    if (boards.length <= 1) {
      toast.error('Cannot delete the only board');
      return;
    }
    
    try {
      const success = await deleteBoard(boardId);
      
      if (success) {
        // If the deleted board was the selected one, select another board
        if (selectedBoardId === boardId) {
          const remainingBoard = boards.find(board => board.Id !== boardId);
          if (remainingBoard) {
            dispatch(setSelectedBoardId(remainingBoard.Id));
          }
        }
        
        dispatch(removeBoard(boardId));
        toast.success('Board deleted successfully');
      } else {
        toast.error('Failed to delete board');
      }
    } catch (error) {
      toast.error('Error deleting board');
    }
  };
  
  const currentBoard = boards.find(board => board.Id === selectedBoardId);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-1">
            Welcome to TaskFlow
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Organize, prioritize, and complete your tasks efficiently
          </p>
        </div>
        
        <button
          onClick={() => setIsCreatingBoard(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Board</span>
        </button>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <LoadingIcon className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-surface-600 dark:text-surface-400">Loading boards...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 btn btn-outline text-red-600 dark:text-red-400">Retry</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ display: loading ? 'none' : 'grid' }}>
        <motion.div 
          className="lg:col-span-1 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="neu-card">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <LayoutDashboardIcon className="w-5 h-5 text-primary" />
              <span>Boards</span>
            </h2>
            
            <ul className="space-y-2">
              {boards.map(board => (
                <li key={board.id} className="relative">
                  <button 
                    onClick={() => dispatch(setSelectedBoardId(board.Id))}
                    className={`w-full text-left p-3 rounded-lg transition-all flex justify-between items-center group ${
                      selectedBoardId === board.Id
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light'
                        : 'hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                    }`}
                  > 
                    <span className="font-medium truncate">{board.name}</span>
                    
                    {boards.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBoard(board.id);
                        }} 
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-surface-300 dark:hover:bg-surface-600 transition-opacity"
                        aria-label="Delete board"
                      >
                        <TrashIcon className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                      </button>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {currentBoard && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-surface-800 dark:text-white">
                  {currentBoard.Name}
                </h2>
                {currentBoard.description && (
                  <p className="text-surface-600 dark:text-surface-400 mt-1">
                    {currentBoard.description}
                  </p>
                )}
              </div>
              
              <MainFeature boardId={currentBoard.Id} />
            </>
          )}
        </motion.div>
      </div>
      
      {/* Create Board Modal */}
      {isCreatingBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Create New Board</h2>
              <button 
                onClick={() => setIsCreatingBoard(false)}
                className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
              >
                <XIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="boardName" className="label">Board Name</label>
                <input
                  id="boardName"
                  type="text"
                  className="input w-full"
                  placeholder="My Project Board"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="boardDescription" className="label">Description (Optional)</label>
                <textarea
                  id="boardDescription"
                  className="input w-full min-h-[80px]"
                  placeholder="What is this board for?"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsCreatingBoard(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateBoard}
                  className="btn btn-primary"
                >
                  Create Board
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Home;