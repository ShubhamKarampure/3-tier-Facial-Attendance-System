import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Check, Search, UserPlus } from 'lucide-react';
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
  const [capturedImage, setCapturedImage] = useState(null);
  const [registeredImage, setRegisteredImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (showCamera && videoRef.current && !capturedImage) {
      const getVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: 1280,
              height: 720,
              facingMode: "user"
            } 
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing webcam: ", error);
        }
      };
      getVideo();
    }

    return () => {
      stopWebcam();
    };
  }, [showCamera, capturedImage]);

  const stopWebcam = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas with horizontal flip
      const context = canvas.getContext('2d');
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.scale(-1, 1); // Reset scale
      
      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      // Stop the webcam
      stopWebcam();
      
      return imageData;
    }
  };

  const handleCapture = () => {
    const imageData = captureImage();
    setStatus('processing');
    
    // Simulate backend processing
    setTimeout(() => {
      if (mode === 'attendance') {
        setMatchedPerson({
          name: 'John Smith',
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString()
        });
      } else if (mode === 'register') {
        setRegisteredImage(imageData);
      }
      setStatus('success');
      
      // Reset and close after success
      setTimeout(() => {
        setStatus('idle');
        setShowCamera(false);
        setMatchedPerson(null);
        if (mode === 'register') {
          setRegistrationData({ name: '', rollNumber: '' });
        }
      }, 2000);
    }, 3000);
  };

  if (!showCamera) {
    return (
      <div className="text-center">
        {registeredImage && mode === 'register' ? (
          <div className="mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-blue-500 shadow-lg">
              <img 
                src={registeredImage} 
                alt="Registered User" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-6 relative overflow-hidden shadow-xl">
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <video 
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 8 }}
                  className="w-20 h-20 bg-white rounded-full mb-4 mx-auto flex items-center justify-center"
                >
                  <Check size={40} className="text-blue-600" />
                </motion.div>
                
                {mode === 'attendance' && matchedPerson ? (
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
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
              {/* Scanning Line Animation */}
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

              {/* Icon Animation */}
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

              {/* Status Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 text-white text-lg font-medium"
              >
                {mode === 'attendance' ? 'Searching...' : 'Registering...'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-4">
        <motion.button
          onClick={() => {
            stopWebcam();
            setShowCamera(false);
            setStatus('idle');
            setMatchedPerson(null);
            setCapturedImage(null);
          }}
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
      </div>
    </motion.div>
  );
};

export default CameraSection;