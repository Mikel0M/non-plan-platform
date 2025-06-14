import * as React from 'react';
import * as Router from 'react-router-dom';

export function Sidebar({ customStyle }: { customStyle?: React.CSSProperties }) {
    const navigate = Router.useNavigate();
    return (
        <aside id="sidebar" style={{ display: 'flex', ...customStyle }}>
            <ul id="nav-buttons">
                <Router.Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li id="projectsBtn"><span className="material-icons-round">maps_home_work</span>Projects</li>
                </Router.Link>
                <li id="usersBtn" style={{ cursor: 'pointer' }} onClick={() => navigate('#users')}> {/* Placeholder for future route */}
                    <span className="material-icons-round">people</span>Users
                </li>
                <li><span className="material-icons-round">dashboard</span>Dashboard</li>
                <Router.Link to="/toDo" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li id="toDoBtn"><span className="material-icons-round">task</span>Tasks/To-Do</li>
                </Router.Link>
                <li><span className="material-icons-round">date_range</span>Calendar</li>
                <li><span className="material-icons-round">folder_open</span>Documents</li>
                <li><span className="material-icons-round">build</span>Tools</li>
            </ul>
        </aside> 
    ) 
}