import React, { useEffect, useState } from 'react';

interface FirebaseErrorNotificationProps {
  onRetry?: () => void;
  onDismiss?: () => void;
}

const FirebaseErrorNotification: React.FC<FirebaseErrorNotificationProps> = ({ onRetry, onDismiss }) => {
  const [error, setError] = useState<{ message: string; retries: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleFirebaseQuotaError = (event: CustomEvent) => {
      setError(event.detail);
      setVisible(true);
    };

    // Add event listener for firebase quota errors
    window.addEventListener(
      'firebase-quota-exceeded',
      handleFirebaseQuotaError as EventListener
    );

    return () => {
      window.removeEventListener(
        'firebase-quota-exceeded',
        handleFirebaseQuotaError as EventListener
      );
    };
  }, []);

  const handleRetry = () => {
    setVisible(false);
    if (onRetry) onRetry();
  };

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible || !error) return null;

  return (
    <div className="firebase-error-notification">
      <div className="notification-content">
        <div className="notification-header">
          <h3>Database Error</h3>
          <button className="close-button" onClick={handleDismiss}>×</button>
        </div>
        <div className="notification-body">
          <p>{error.message}</p>
          <p className="notification-details">
            The application has reached Firebase quota limits. This typically happens on free tiers 
            or when there's unusually high activity.
          </p>
        </div>
        <div className="notification-footer">
          <button className="retry-button" onClick={handleRetry}>Try Again</button>
          <button className="dismiss-button" onClick={handleDismiss}>Dismiss</button>
        </div>
      </div>
      <style>
        {`
          .firebase-error-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            width: 350px;
            z-index: 1000;
            animation: slide-in 0.3s ease-out;
            border-left: 4px solid #f44336;
          }
          
          .notification-content {
            padding: 16px;
          }
          
          .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          
          .notification-header h3 {
            margin: 0;
            color: #f44336;
            font-size: 16px;
          }
          
          .close-button {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #888;
          }
          
          .notification-body {
            margin-bottom: 16px;
          }
          
          .notification-body p {
            margin: 8px 0;
            font-size: 14px;
          }
          
          .notification-details {
            color: #666;
            font-size: 12px !important;
          }
          
          .notification-footer {
            display: flex;
            justify-content: flex-end;
          }
          
          .retry-button, .dismiss-button {
            padding: 8px 16px;
            margin-left: 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          
          .retry-button {
            background-color: #f44336;
            color: white;
          }
          
          .dismiss-button {
            background-color: #f1f1f1;
            color: #333;
          }
          
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FirebaseErrorNotification;
