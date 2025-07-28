import * as React from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "../firebase";
import LoginModal from "./LoginModal";
import { usersManagerInstance } from '../classes/UsersManager';
import { companiesManagerInstance } from '../classes/CompaniesManager';
import { projectsManagerInstance } from '../classes/ProjectsManager';

interface AppWrapperProps {
    children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // --- Add auth state ---
    const [user, setUser] = React.useState<User | null>(null);
    const [checkingAuth, setCheckingAuth] = React.useState(true);

    React.useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setCheckingAuth(false);
        });
        return unsubscribe;
    }, []);

    React.useEffect(() => {
        if (!user) return;
        const initializeApp = async () => {
            try {
                console.log('[AppWrapper] Initializing app data...');
                await usersManagerInstance.ensureUsersLoaded();
                await companiesManagerInstance.ensureCompaniesLoaded();
                await projectsManagerInstance.ensureProjectsLoaded();
                setIsInitialized(true);
                console.log('[AppWrapper] App initialization complete');
            } catch (error) {
                console.error('[AppWrapper] Failed to initialize app:', error);
                setError('Failed to load app data. Please refresh the page.');
            } finally {
                setIsLoading(false);
            }
        };
        initializeApp();
    }, [user]);

    // Auto-refresh users and companies when window regains focus (user switches back to tab)
    React.useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isInitialized) {
                try {
                    console.log('[AppWrapper] Window focused - refreshing users, companies, and projects...');
                    await Promise.all([
                        usersManagerInstance.refreshUsersFromFirebase(),
                        companiesManagerInstance.refreshCompaniesFromFirebase(),
                        projectsManagerInstance.refreshProjectsFromFirebase()
                    ]);
                    console.log('[AppWrapper] Users, companies, and projects refreshed on focus');
                } catch (error) {
                    console.error('[AppWrapper] Failed to refresh data on focus:', error);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isInitialized]);

    if (checkingAuth) {
        return null; // or a spinner
    }

    // Show login modal if not authenticated
    if (!user) {
        return <LoginModal open={true} onClose={() => {}} />;
    }

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666', fontSize: '14px' }}>Loading app data...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{ color: '#e74c3c', fontSize: '18px' }}>⚠️ {error}</div>
                <button 
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
