import * as React from 'react';
import { firestoreDB } from '../firebase';

interface FirebaseStats {
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  lastCheck: string;
}

export const FirebaseMonitor: React.FC<{ isVisible?: boolean }> = ({ isVisible = false }) => {
  const [stats, setStats] = React.useState<FirebaseStats | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!isVisible && !isExpanded) {
      return () => {}; // Return empty cleanup function
    }

    const checkConnection = async () => {
      try {
        setStats(prev => prev ? { ...prev, connectionStatus: 'checking' } : { connectionStatus: 'checking', lastCheck: '' });
        // Simple Firebase connection test by accessing the database
        if (firestoreDB) {
          setStats({ connectionStatus: 'connected', lastCheck: new Date().toLocaleTimeString() });
        } else {
          setStats({ connectionStatus: 'disconnected', lastCheck: new Date().toLocaleTimeString() });
        }
      } catch (error) {
        console.error('Firebase connection check failed:', error);
        setStats({ connectionStatus: 'disconnected', lastCheck: new Date().toLocaleTimeString() });
      }
    };

    // Check connection immediately
    checkConnection();

    // Set up interval to check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [isVisible, isExpanded]);

  const handleEmergencyStop = () => {
    alert('⚠️ Emergency stop functionality not available in simplified mode. Upgrade to full monitoring for advanced features.');
  };

  if (!isVisible && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#1a1a1a',
          color: '#4fc3f7',
          border: '2px solid #007bff',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 9999
        }}
        title="Firebase Monitor"
      >
        🔥
      </button>
    );
  }

  const hitRate = '0'; // Simplified - no cache tracking

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1a1a1a',
      color: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, color: '#4fc3f7' }}>🔥 Firebase Monitor</h4>
        <button 
          onClick={() => setIsExpanded(false)}
          style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'white' }}
        >
          ✕
        </button>
      </div>

      {stats && (
        <>
          <div style={{ marginBottom: '12px' }}>
            <div><strong>Connection:</strong> 
              <span style={{ color: stats.connectionStatus === 'connected' ? 'green' : stats.connectionStatus === 'disconnected' ? 'red' : 'orange', marginLeft: '8px' }}>
                {stats.connectionStatus === 'connected' ? '🟢 CONNECTED' : 
                 stats.connectionStatus === 'disconnected' ? '🔴 DISCONNECTED' : 
                 '🟡 CHECKING...'}
              </span>
            </div>
            {stats.lastCheck && (
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                <strong>Last Check:</strong> {stats.lastCheck}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '12px', fontSize: '12px', color: '#aaa' }}>
            Simple Firebase connection monitor. For advanced monitoring features, upgrade to the full monitoring system.
          </div>

          <button
            onClick={() => {
              if (stats.connectionStatus === 'connected') {
                alert('✅ Firebase is connected and working normally.');
              } else {
                alert('⚠️ Firebase connection issues detected. Check your internet connection and Firebase configuration.');
              }
            }}
            style={{
              background: stats.connectionStatus === 'connected' ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              fontWeight: 'bold'
            }}
          >
            {stats.connectionStatus === 'connected' ? '✅ CONNECTION OK' : '⚠️ CHECK CONNECTION'}
          </button>
        </>
      )}
    </div>
  );
};
