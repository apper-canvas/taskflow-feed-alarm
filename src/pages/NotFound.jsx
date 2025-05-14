import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function NotFound() {
  // Icon declarations
  const HomeIcon = getIcon('Home');
  const AlertTriangleIcon = getIcon('AlertTriangle');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex mb-8">
          <AlertTriangleIcon className="w-24 h-24 text-accent" />
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-surface-900 dark:text-white mb-4"
        >
          404 Not Found
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-lg text-surface-600 dark:text-surface-400 max-w-md mx-auto mb-8"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;