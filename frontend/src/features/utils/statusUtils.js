export const getStatusMessage = (status, mode) => {
  switch (status) {
    case 'capturing':
      return 'Capturing image...';
    case 'processing':
      return mode === 'attendance' ? 'Verifying identity...' : 'Registering face...';
    case 'success':
      return mode === 'attendance' ? 'Attendance marked successfully!' : 'Registration successful!';
    case 'error':
      return 'An error occurred. Please try again.';
    default:
      return '';
  }
};