import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Check, Search, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
  >
    <p className="font-medium">{message}</p>
  </motion.div>
);

const CameraSection = ({
  mode,
  showCamera,
  setShowCamera,
  status,
  setStatus,
  registrationData,
  setRegistrationData,
  refreshAttendance
}) => {
  const [matchedPerson, setMatchedPerson] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [registeredImage, setRegisteredImage] = useState(null);
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (showCamera) {
      initializeCamera();
    }
    return () => {
      stopWebcam();
    };
  }, [showCamera]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.scale(-1, 1); // Flip horizontally
      context.translate(-canvas.width, 0);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      return imageData;
    }
    return null;
  };

  const markAttendance = async (imageData) => {
    const blob = await fetch(imageData).then(r => r.blob());
    const formData = new FormData();
    formData.append("face_image", blob, "capture.jpg");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mark_attendance`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Attendance marking failed');
      }
      
      const result = await response.json();
      
      // Update the matched person state with the response data
      setMatchedPerson({
        name: result.user.name,
        time: result.user.time,
        
      });
      
      return result;
    } catch (error) {
      throw new Error(error.message || 'Attendance marking failed');
    }
  };

  const registerUser = async (imageData) => {
    const blob = await fetch(imageData).then(r => r.blob());
    const formData = new FormData();
    formData.append("name", registrationData.name);
    formData.append("roll_number", registrationData.rollNumber);
    formData.append("face_image", blob, "capture.jpg");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/register`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const result = await response.json();
      setRegisteredImage(imageData);
      setRegistrationData({ name: '', rollNumber: '' });
      return result;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const handleCapture = async () => {
    const imageData = captureImage();
    setStatus('processing');
    setError(null);

    try {
      if (mode === 'attendance') {
        await markAttendance(imageData);
      } else if (mode === 'register') {
        await registerUser(imageData);
        setRegisteredImage(imageData);
      }
      
      setStatus('success');
      await refreshAttendance();
      
      setTimeout(() => {
        setStatus('idle');
        setShowCamera(false);
        setMatchedPerson(null);
        if (mode === 'register') {
          setRegistrationData({ name: '', rollNumber: '' });
        }
      }, 2000);
    } catch (error) {
      console.log(error)
      setError(error.message);
      setStatus('idle');
      setCapturedImage(null);
      initializeCamera();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationComplete = () => {
    if (isClosing) {
      stopWebcam();
      setShowCamera(false);
      setStatus('idle');
      setMatchedPerson(null);
      setCapturedImage(null);
      setIsClosing(false);
    }
  };

  if (!showCamera) {
    return (
      <div className="text-center">
        {registeredImage && mode === 'register' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-blue-500 shadow-lg">
              <img 
                src={registeredImage} 
                alt="Registered User" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => {
              setShowCamera(true);
              setCapturedImage(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto transition-colors shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera size={24} className="text-blue-100" />
            <span className="font-semibold">Start Face Recognition</span>
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.95,
            transition: {
              duration: 0.3,
              ease: "easeInOut"
            }
          }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <AnimatePresence>
            {error && <ErrorMessage message={error} />}
          </AnimatePresence>

          <motion.div 
            className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-6 relative overflow-hidden shadow-xl"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {capturedImage ? (
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <motion.video 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                ref={videoRef}
                autoPlay 
                muted 
                className="w-full h-full object-cover opacity-90 scale-x-[-1]"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Success States */}
            <AnimatePresence>
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                  <div className="text-center text-white">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", damping: 8 }}
                      className="w-20 h-20 bg-white rounded-full mb-4 mx-auto flex items-center justify-center"
                    >
                      <Check size={40} className="text-blue-600" />
                    </motion.div>
                    
                    {mode === 'attendance' && matchedPerson ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h2 className="text-3xl font-bold mb-2">Welcome, {matchedPerson.name}!</h2>
                        <p className="text-lg text-white/90">Attendance Marked Successfully</p>
                        <div className="mt-4 text-sm text-white/80">
                          <p>{matchedPerson.time}</p>
                         
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h2 className="text-3xl font-bold mb-2">Registration Complete!</h2>
                        <p className="text-lg text-white/90">Face data stored successfully</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Processing Overlay */}
            <AnimatePresence>
              {status === 'processing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ 
                      duration: 1.5, 
                      ease: "linear", 
                      repeat: Infinity 
                    }}
                    className="absolute left-0 right-0 h-1 bg-blue-500/50"
                    style={{ 
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                      background: 'linear-gradient(to right, transparent, #3b82f6, transparent)'
                    }}
                  />

                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                    {mode === 'attendance' ? (
                      <Search size={24} className="absolute inset-0 m-auto text-blue-500" />
                    ) : (
                      <UserPlus size={24} className="absolute inset-0 m-auto text-blue-500" />
                    )}
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute bottom-8 text-white text-lg font-medium"
                  >
                    {mode === 'attendance' ? 'Searching...' : 'Registering...'}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.button
              onClick={handleClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X size={20} />
              <span className="font-medium">Close</span>
            </motion.button>
            
            {status === 'idle' && !capturedImage && (
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraSection;