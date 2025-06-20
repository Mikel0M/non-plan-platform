import * as React from 'react';
import * as Router from 'react-router-dom';
import { useTranslation } from "./LanguageContext";

export function Sidebar({ customStyle }: { customStyle?: React.CSSProperties }) {
    const { t } = useTranslation();
    const navigate = Router.useNavigate();
    const location = Router.useLocation();
    // Helper to determine if a route is active
    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };
    // Sidebar width is preserved by not changing any style or layout
    return (
        <aside id="sidebar" style={{ display: 'flex', width: 180, minWidth: 180, maxWidth: 180, ...customStyle }}>
            <ul id="nav-buttons">
                <Router.Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li id="projectsBtn" className={isActive('/') ? 'active' : ''}><span className="material-icons-round">maps_home_work</span>{t("sidebar_projects") || "Projects"}</li>
                </Router.Link>
                <Router.Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li id="usersBtn" className={isActive('/users') ? 'active' : ''} style={{ cursor: 'pointer' }}>
                        <span className="material-icons-round">people</span>{t("sidebar_users") || "Users"}
                    </li>
                </Router.Link>
                <li className={location.pathname === '/dashboard' ? 'active' : ''}><span className="material-icons-round">dashboard</span>{t("sidebar_dashboard") || "Dashboard"}</li>
                <Router.Link to="/toDo" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li id="toDoBtn" className={isActive('/toDo') ? 'active' : ''}><span className="material-icons-round">task</span>{t("sidebar_tasks") || "Tasks/To-Do"}</li>
                </Router.Link>
                <li className={location.pathname === '/calendar' ? 'active' : ''}><span className="material-icons-round">date_range</span>{t("sidebar_calendar") || "Calendar"}</li>
                <li className={location.pathname === '/documents' ? 'active' : ''}><span className="material-icons-round">folder_open</span>{t("sidebar_documents") || "Documents"}</li>
                <li className={location.pathname === '/tools' ? 'active' : ''}><span className="material-icons-round">build</span>{t("sidebar_tools") || "Tools"}</li>
            </ul>
        </aside> 
    ) 
}