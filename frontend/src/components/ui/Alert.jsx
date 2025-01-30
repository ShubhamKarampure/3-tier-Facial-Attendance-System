// src/components/ui/alert.jsx
export const Alert = ({ children, variant = 'info' }) => {
  const variantClasses = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
  };

  return (
    <div className={`alert ${variantClasses[variant]} p-4 rounded-md`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => (
  <div className="alert-description text-sm mt-2">{children}</div>
);
