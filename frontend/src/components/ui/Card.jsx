// src/components/ui/card.jsx
export const Card = ({ children }) => (
  <div className="card border border-gray-200 rounded-lg shadow-lg p-4">{children}</div>
);

export const CardContent = ({ children }) => (
  <div className="card-content p-4">{children}</div>
);
