import React from 'react';
import { IProject } from '../classes/Project';
import { ICompany } from '../classes/Company';
import { IUser } from '../classes/User';
import { useTranslation } from './LanguageContext';
import { OpenStreetMapComponent } from './OpenStreetMapComponent';
import { Calendar } from './Calendar';
import { usersManagerInstance } from '../classes/UsersManager';

function getToDoColor(todo: any) {
  if (typeof todo.getColor === "function") return todo.getColor();
  switch (todo.status) {
    case "In Progress": return "#FFA500";
    case "Completed": return "var(--primary)";
    case "Pending": return "#969697";
    case "On Hold": return "var(--red)";
    default: return "#969697";
  }
}

interface InfoProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  project: IProject;
  t: (key: string) => string;
  companies?: ICompany[];
  users?: IUser[];
}

export const InfoProjectForm: React.FC<InfoProjectFormProps> = ({
  isOpen,
  onClose,
  onEdit,
  project,
  t,
  companies = [],
  users: usersProp,
}) => {
  const users = usersProp ?? usersManagerInstance.getUsers();

  // Prepare tasks for the calendar, including dependencies
  const projectTasks = (project.toDos || []).map(todo => ({
    ...todo,
    id: todo.id || `${todo.title}-${todo.start_date || ""}-${todo.due_date || ""}`,
    startDate: todo.start_date,
    dueDate: todo.due_date,
    completed: todo.isComplete ?? false,
    color: getToDoColor(todo),
    title: todo.title,
    dependencies: Array.isArray(todo.dependencies) ? todo.dependencies : [],
    rawToDo: todo, // <-- THIS IS THE KEY FOR ARROWS!
  }));

  if (!isOpen) return null;

  // Robust company display (handles different interfaces)
  const getCompanyName = () => {
    if (!companies || companies.length === 0) return t("projects_company_none") || "No company";
    const byId = companies.find(c => c.id === project.companyId);
    if (byId && (byId as any).name) return (byId as any).name;
    if (byId && (byId as any).cName) return (byId as any).cName;
    const byCName = companies.find(c => (c as any).cName === project.companyId);
    if (byCName) return (byCName as any).cName;
    return t("projects_company_none") || "No company";
  };

  return (
    <dialog id="infoProjectModal" className="projectModal" open style={{ maxHeight: "90vh", overflow: "auto" }}>
      <form className="userForm form-wide" id="infoProjectForm">
        <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {t("projects_info_project") || "Project Information"}
        </h2>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">apartment</span>{t("projects_name") || "Name"}
          </label>
          <div>{project.name}</div>
          <label>
            <span className="material-icons-round">calendar_view_week</span>
            {t("projects_phase") || "Design Phase"}
          </label>
          <div>{project.phase}</div>
          <label>
            <span className="material-icons-round">subject</span>{t("projects_description") || "Description"}
          </label>
          <div>{project.description}</div>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">pin_drop</span>{t("projects_location") || "Location"}
          </label>
          <div>{project.location}</div>
          <div className="mapContainer" style={{ marginTop: 0, pointerEvents: "none" }}>
            <OpenStreetMapComponent
              address={project.location}
              latitude={project.latitude}
              longitude={project.longitude}
              interactive={false}
              showMarker={true}
              height="440px"
              zoom={25}
              plotNumber={project.plotNumber}
            />
          </div>
        </div>
        <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}
          </label>
          <div>{project.startDate}</div>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">calendar_month</span>{t("projects_finish_date") || "Finish Date"}
          </label>
          <div>{project.finishDate}</div>
        </div>
        <div style={{ gridColumn: "1 / -1", margin: "12px 0" }}>
          <Calendar
            tasks={[
              {
                id: "temp-project-bar",
                title: project.name || "Project",
                startDate: project.startDate,
                dueDate: project.finishDate,
                completed: false,
                color: project.color,
                isProjectDuration: true,
              },
              ...projectTasks
            ]}
            start={project.startDate}
            end={project.finishDate}
            projectColor={project.color}
            projectName={project.name || "Project"}
            hideTaskNames={false}
          />
        </div>
        <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">business</span>{t("projects_company") || "Company"}
          </label>
          <div>{getCompanyName()}</div>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">people</span>{t("projects_assigned_users") || "Assigned Users"}
          </label>
          <div>
            {(!project.assignedUsers || project.assignedUsers.length === 0) ? (
              t("projects_no_users_selected") || "No users selected"
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {project.assignedUsers.map(au => {
                  const user = users.find(u => u.id === au.userId);
                  return (
                    <li key={au.userId} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span>{user ? `${user.name} ${user.surname}` : au.userId}</span>
                      <span style={{ marginLeft: "auto", fontStyle: "italic", color: "#888" }}>
                        {au.role}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">paid</span>{t("projects_cost") || "Estimated cost"}
          </label>
          <div>{project.cost}</div>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">not_listed_location</span>
            {t("projects_status") || "Status"}
          </label>
          <div>{project.status}</div>
        </div>
        <div className="cancelAccept">
          <button
            type="button"
            className="acceptButton"
            style={{ order: 2 }}
            onClick={onClose}
          >
            {t("projects_ok") || "OK"}
          </button>
          <button
            type="button"
            className="cancelButton"
            style={{ order: 1 }}
            onClick={onEdit}
          >
            <span className="material-icons-round" style={{ marginRight: 6 }}>edit</span>
            {t("projects_edit") || "Edit"}
          </button>
        </div>
      </form>
    </dialog>
  );
};

