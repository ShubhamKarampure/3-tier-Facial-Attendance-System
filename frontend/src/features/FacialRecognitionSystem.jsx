import React, { useState } from 'react';
import Header    from './components/Header';
import ModeSelector from './components/ModeSelector';
import CameraSection from './components/CameraSection';
import RegistrationForm from './components/RegistrationForm';
import AttendanceTable from './components/AttendanceTable';
import StatusAlert from './components/StatusAlert';
import { attendanceData } from './data/mockData';
import { Card,CardContent } from '@/components/ui/Card';

const FacialRecognitionSystem = () => {
  const [mode, setMode] = useState('attendance');
  const [status, setStatus] = useState('idle');
  const [showCamera, setShowCamera] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    rollNumber: ''
  });

  const resetForm = () => {
    setRegistrationData({ name: '', rollNumber: '' });
    setShowCamera(false);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <ModeSelector mode={mode} setMode={setMode} resetForm={resetForm} />
        
        <Card className="bg-white shadow-lg mb-8">
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
              />
            )}
          </CardContent>
        </Card>

        <StatusAlert status={status} mode={mode} />
        <AttendanceTable attendanceData={attendanceData} />
      </div>
    </div>
  );
};

export default FacialRecognitionSystem;