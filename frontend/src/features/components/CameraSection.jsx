import React from 'react';
import { Camera, X, Check, Loader2, Search, UserCheck, Brain, Database} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraSection = ({
  mode,
  showCamera,
  setShowCamera,
  status,
  setStatus,
  registrationData,
  setRegistrationData
}) => {
  const [matchedPerson, setMatchedPerson] = React.useState(null);

  const attendanceSteps = [
    { id: 'capture', icon: Camera, label: 'Capturing Face' },
    { id: 'matching', icon: Search, label: 'Finding Match' },
    { id: 'success', icon: UserCheck, label: 'Marking Attendance' }
  ];

  const registrationSteps = [
    { id: 'capture', icon: Camera, label: 'Capturing Face' },
    { id: 'train', icon: Brain, label: 'Training Model' },
    { id: 'store', icon: Database, label: 'Storing Data' },
    { id: 'complete', icon: Check, label: 'Registration Complete' }
  ];

  const currentSteps = mode === 'register' ? registrationSteps : attendanceSteps;

  const handleCapture = () => {
    const stepDelay = 1500;
    setStatus('capture');
    
    // Simulate the process with delays
    currentSteps.forEach((step, index) => {
      setTimeout(() => {
        setStatus(step.id);
        if (mode === 'attendance' && step.id === 'matching') {
          // Simulate finding a match
          setMatchedPerson({
            name: 'John Smith',
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString()
          });
        }
      }, index * stepDelay);
    });

    // Reset and close after all steps
    setTimeout(() => {
      setStatus('idle');
      setTimeout(() => {
        setShowCamera(false);
        setMatchedPerson(null);
        if (mode === 'register') {
          setRegistrationData({ name: '', rollNumber: '' });
        }
      }, 2000);
    }, currentSteps.length * stepDelay + 1000);
  };

  const getCurrentStep = () => {
    return currentSteps.findIndex(step => step.id === status);
  };

  if (!showCamera) {
    return (
      <div className="text-center">
        <motion.button
          onClick={() => setShowCamera(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto transition-colors shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Camera size={24} className="text-blue-100" />
          <span className="font-semibold">Start Face Recognition</span>
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-6 relative overflow-hidden shadow-xl">
        {status === 'success' && matchedPerson ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 8 }}
                className="w-20 h-20 bg-white rounded-full mb-4 mx-auto flex items-center justify-center"
              >
                <UserCheck size={40} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-2">Welcome, {matchedPerson.name}!</h2>
                <p className="text-lg text-white/90">Attendance Marked Successfully</p>
                <div className="mt-4 text-sm text-white/80">
                  <p>{matchedPerson.time}</p>
                  <p>{matchedPerson.date}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <>
            <img 
              src="/api/placeholder/640/360" 
              alt="Camera Preview" 
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Scanning Animation */}
            <AnimatePresence>
              {status === 'capture' && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                  className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-lg"
                  style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                />
              )}
            </AnimatePresence>

            {/* Face Matching Animation */}
            <AnimatePresence>
              {status === 'matching' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                    <Search size={24} className="absolute inset-0 m-auto text-blue-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <motion.button
          onClick={() => {
            setShowCamera(false);
            setStatus('idle');
            setMatchedPerson(null);
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <X size={20} />
          <span className="font-medium">Close</span>
        </motion.button>
        
        {status === 'idle' && (
          <motion.button
            onClick={handleCapture}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera size={20} className="text-blue-100" />
            <span className="font-medium">Capture</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default CameraSection;