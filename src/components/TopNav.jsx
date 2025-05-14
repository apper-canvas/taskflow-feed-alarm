import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { AuthContext } from '../App';
import getIcon from '../utils/iconUtils';

function TopNav() {
  const { toggleDarkMode, darkMode, logout } = useContext(AuthContext);
  const user = useSelector((state) => state.user.user);
  
  const MoonIcon = getIcon('Moon');
  const SunIcon = getIcon('Sun');
  const LogOutIcon = getIcon('LogOut');
  const UserIcon = getIcon('User');

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 32 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-600"
              >
                <path 
                  d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 25.2c-6.186 0-11.2-5.014-11.2-11.2S9.814 4.8 16 4.8 27.2 9.814 27.2 16 22.186 27.2 16 27.2z" 
                  fill="currentColor"
                />
                <path 
                  d="M22 14h-4v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4h-4c-1.1 0-2 .9-2 2s.9 2 2 2h4v4c0 1.1.9 2 2 2s2-.9 2-2v-4h4c1.1 0 2-.9 2-2s-.9-2-2-2z" 
                  fill="currentColor"
                />
              </svg>
            </motion.div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">TaskFlow</h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center mr-3">
              <div className="hidden sm:flex items-center gap-2 text-surface-700 dark:text-surface-300">
                <UserIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{user.firstName || user.emailAddress}</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-surface-600" />}
          </button>
          
          <button onClick={logout} className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors" aria-label="Log out">
            <LogOutIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNav;