import * as React from 'react';
import * as Router from 'react-router-dom';

export function Sidebar({ customStyle }: { customStyle?: React.CSSProperties }) {
    const navigate = Router.useNavigate();
    const location = Router.useLocation();
    // Helper to determine if a route is active
    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };
    return (
        <aside id="sidebar" style={{ display: 'flex', ...customStyle }}>
            <ul id="nav-buttons">
                <Router.Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li id="projectsBtn" className={isActive('/') ? 'active' : ''}><span className="material-icons-round">maps_home_work</span>Projects</li>
                </Router.Link>
                <li id="usersBtn" style={{ cursor: 'pointer' }} className={location.hash === '#users' ? 'active' : ''} onClick={() => navigate('#users')}>
                    <span className="material-icons-round">people</span>Users
                </li>
                <li className={location.pathname === '/dashboard' ? 'active' : ''}><span className="material-icons-round">dashboard</span>Dashboard</li>
                <Router.Link to="/toDo" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li id="toDoBtn" className={isActive('/toDo') ? 'active' : ''}><span className="material-icons-round">task</span>Tasks/To-Do</li>
                </Router.Link>
                <li className={location.pathname === '/calendar' ? 'active' : ''}><span className="material-icons-round">date_range</span>Calendar</li>
                <li className={location.pathname === '/documents' ? 'active' : ''}><span className="material-icons-round">folder_open</span>Documents</li>
                <li className={location.pathname === '/tools' ? 'active' : ''}><span className="material-icons-round">build</span>Tools</li>
            </ul>
        </aside> 
    ) 
}