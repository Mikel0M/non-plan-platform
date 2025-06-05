import * as React from 'react';

export function Sidebar({ customStyle }: { customStyle?: React.CSSProperties }) {
    return (
        <aside id="sidebar" style = {{display: 'flex'}}>
            <ul id="nav-buttons">
                <li id="projectsBtn"><span className="material-icons-round">maps_home_work</span>Projects</li>
                <li id="usersBtn"><span className="material-icons-round">people</span>Users</li>
                <li><span className="material-icons-round">dashboard</span>Dashboard</li>
                <li><span className="material-icons-round">task</span>Tasks/To-Do</li>
                <li><span className="material-icons-round">date_range</span>Calendar</li>
                <li><span className="material-icons-round">folder_open</span>Documents</li>
                <li><span className="material-icons-round">build</span>Tools</li>
            </ul>
        </aside> 
    ) 
}