import React from 'react';
import { Alert,AlertDescription } from '@/components/ui/Alert';
import { getStatusMessage } from '../utils/statusUtils';

const StatusAlert = ({ status, mode }) => {
  if (status !== 'success') return null;

  return (
    <Alert className="mb-8 bg-green-50 text-green-600 border-green-200">
      <AlertDescription>
        {getStatusMessage(status, mode)}
      </AlertDescription>
    </Alert>
  );
};

export default StatusAlert;