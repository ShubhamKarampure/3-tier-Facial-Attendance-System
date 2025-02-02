import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import CameraSection from './components/CameraSection';
import RegistrationForm from './components/RegistrationForm';
import AttendanceTable from './components/AttendanceTable';
import StatusAlert from './components/StatusAlert';
import { Card, CardContent } from '@/components/ui/card';

const FacialRecognitionSystem = () => {
  // State management
  const [mode, setMode] = useState('attendance');
  const [status, setStatus] = useState('idle');
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    rollNumber: ''
  });

  
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/get_all_attendance`
      );
      
      if (!response.ok) {
        throw new Error(response.message);
      }

      const data = await response.json();
      // Update the attendance data using the attendance array from the response
      setAttendanceData(data.attendance.map(record => ({
        id: record.roll_number, 
        name: record.name,
        rollNumber: record.roll_number,
        attendance_status: record.attendance_status,
        time: record.time
      })));
    } catch (error) {
      console.error('Failed to fetch attendance:', error.message);
    }
  };


  // Reset form helper
  const resetForm = () => {
    setRegistrationData({ name: '', rollNumber: '' });
    setShowCamera(false);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Header />
        
        <ModeSelector 
          mode={mode} 
          setMode={setMode} 
          resetForm={resetForm} 
        />
        
        <Card>
          <CardContent className="p-6">
            {mode === 'register' && !showCamera ? (
              <RegistrationForm
                registrationData={registrationData}
                setRegistrationData={setRegistrationData}
                setShowCamera={setShowCamera}
              />
            ) : (
              <CameraSection
                mode={mode}
                showCamera={showCamera}
                setShowCamera={setShowCamera}
                status={status}
                setStatus={setStatus}
                registrationData={registrationData}
                setRegistrationData={setRegistrationData}
                onAttendanceMarked={fetchAttendanceData}
                refreshAttendance={fetchAttendanceData}
              />
            )}
          </CardContent>
        </Card>
        
        <StatusAlert 
          status={status} 
          mode={mode} 
        />
        
        <AttendanceTable 
          attendanceData={attendanceData} 
        />
      </div>
    </div>
  );
};

export default FacialRecognitionSystem;