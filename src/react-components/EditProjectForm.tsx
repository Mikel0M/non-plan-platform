import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IProject, userRole, status, phase } from '../classes/Project';
import { ICompany } from '../classes/Company';
import { IUser } from '../classes/User';
import { useTranslation } from './LanguageContext';
import { OpenStreetMapComponent } from './OpenStreetMapComponent';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { Calendar } from './Calendar';
import { HexColorPicker } from "react-colorful";
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

interface EditProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project: IProject;
  onSubmit: (updates: Partial<IProject>) => Promise<void>;
  t: (key: string) => string;
  companies?: ICompany[];
  users?: IUser[];
}

export const EditProjectForm: React.FC<EditProjectFormProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit,
  t,
  companies = [],
  users: usersProp,
}) => {
  // Use local users if prop is not provided
  const [users, setUsers] = useState<IUser[]>(usersProp ?? usersManagerInstance.getUsers());

  useEffect(() => {
    if (usersProp && usersProp.length > 0) {
      setUsers(usersProp);
    } else {
      setUsers(usersManagerInstance.getUsers());
    }
  }, [usersProp, isOpen]);

  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Array<{ userId: string, role: string }>>(
    project?.assignedUsers || []
  );
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);
  const [projectAddress, setProjectAddress] = useState<string>(project?.location || "");
  const [projectCoordinates, setProjectCoordinates] = useState<{ lat: number; lng: number } | null>(
    project?.latitude && project?.longitude
      ? { lat: project.latitude, lng: project.longitude }
      : null
  );
  const [plotNumber, setPlotNumber] = useState<string>(project?.plotNumber || "");
  const [debouncedAddress, setDebouncedAddress] = useState<string>(project?.location || "");
  const todayStr = new Date().toISOString().split('T')[0];
  const [formStartDate, setFormStartDate] = useState<string>(project?.startDate || todayStr);
  const [formFinishDate, setFormFinishDate] = useState<string>(project?.finishDate || todayStr);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [projectColor, setProjectColor] = useState<string>(project?.color || "#007bff");
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Other fields
  const [editName, setEditName] = useState(project?.name ?? "");
  const [editDescription, setEditDescription] = useState(project?.description ?? "");
  const [editUserRole, setEditUserRole] = useState<userRole>(project?.userRole ?? "not defined");
  const [editPhase, setEditPhase] = useState<phase>(project?.phase ?? "Design");
  const [editCost, setEditCost] = useState(project?.cost?.toString() ?? "");
  const [editStatus, setEditStatus] = useState<status>(project?.status ?? "Active");
  const [editIcon, setEditIcon] = useState(project?.icon ?? "");

  // Reset fields when opening
  useEffect(() => {
    if (isOpen && project) {
      setEditName(project.name ?? "");
      setEditDescription(project.description ?? "");
      setEditUserRole(project.userRole ?? "not defined");
      setEditPhase(project.phase ?? "Design");
      setEditCost(project.cost?.toString() ?? "");
      setEditStatus(project.status ?? "Active");
      setEditIcon(project.icon ?? "");
      setProjectColor(project.color ?? "#007bff");
      setSelectedUsers(project?.assignedUsers || []);
      setProjectAddress(project?.location || "");
      setProjectCoordinates(
        project?.latitude && project?.longitude
          ? { lat: project.latitude, lng: project.longitude }
          : null
      );
      setPlotNumber(project?.plotNumber || "");
      setDebouncedAddress(project?.location || "");
      setFormStartDate(project?.startDate || todayStr);
      setFormFinishDate(project?.finishDate || todayStr);
    }
    // eslint-disable-next-line
  }, [isOpen, project]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUsers = selectedUsers; // Already in { userId, role } format

    // Only save lat/lng if they are valid numbers (not 0 or undefined)
    const latitudeToSave = (projectCoordinates && typeof projectCoordinates.lat === 'number' && projectCoordinates.lat !== 0) ? projectCoordinates.lat : undefined;
    const longitudeToSave = (projectCoordinates && typeof projectCoordinates.lng === 'number' && projectCoordinates.lng !== 0) ? projectCoordinates.lng : undefined;
    // Only save plotNumber if not empty or default
    const plotNumberToSave = (plotNumber && plotNumber !== 'DefaultPlotNumber') ? plotNumber : undefined;

    const updates: Partial<IProject> = {
      icon: editIcon,
      color: projectColor,
      name: editName,
      description: editDescription,
      userRole: editUserRole,
      location: projectAddress,
      plotNumber: plotNumberToSave,
      latitude: latitudeToSave,
      longitude: longitudeToSave,
      cost: editCost ? parseFloat(editCost) : 0,
      status: editStatus,
      phase: editPhase,
      startDate: formStartDate,
      finishDate: formFinishDate,
      companyId: (e.target as any).companyId?.value || project.companyId,
      assignedUsers: assignedUsers,
      // Keep other fields as needed
    };

    try {
      await onSubmit(updates);
      onClose();
    } catch (error) {
      setErrorMessage((error as Error).message);
      setIsErrorModalOpen(true);
    }
  };

  // Toggle user selection and default role
  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.userId === userId);
      if (exists) {
        return prev.filter(u => u.userId !== userId);
      } else {
        return [...prev, { userId, role: "Developer" }];
      }
    });
  };

  // Update role for a selected user
  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedUsers(prev =>
      prev.map(u =>
        u.userId === userId ? { ...u, role: newRole } : u
      )
    );
  };

  const handleUserSelectionConfirm = () => {
    setIsUserSelectionModalOpen(false);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string, foundPlotNumber?: string) => {
    setProjectAddress(address);
    setProjectCoordinates({ lat, lng });
    if (foundPlotNumber && foundPlotNumber.trim()) {
      setPlotNumber(foundPlotNumber);
    }
    setDebouncedAddress(address);
  };

  const handleAddressChange = useCallback((newAddress: string) => {
    setProjectAddress(newAddress);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedAddress(newAddress);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Display selected users
  const getSelectedUsersDisplay = () => {
    if (selectedUsers.length === 0) return t("projects_no_users_selected") || "No users selected";
    if (selectedUsers.length === 1) {
      const user = users.find(u => u.id === selectedUsers[0].userId);
      return user ? `${user.name} ${user.surname}` : "1 user selected";
    }
    return `${selectedUsers.length} users selected`;
  };

  if (!isOpen) return null;

  // Combine project duration bar and todos for the calendar
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

  return (
    <>
      <dialog id="editProjectModal" className="projectModal" open>
        <form className="userForm form-wide" id="editProjectForm" onSubmit={handleFormSubmit}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {t("projects_edit_project") || "Edit Project"}
            <span style={{ marginLeft: "auto", position: "relative", display: "inline-flex" }}>
              <button
                type="button"
                className="acceptButton color-picker"
                style={{
                  background: projectColor,
                  color: "#fff",
                  height: 40,
                  boxSizing: "border-box",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 600,
                  fontSize: 14
                }}
                onClick={() => setShowColorPicker(v => !v)}
              >
                Project color
              </button>
              {showColorPicker && (
                <div
                  style={{
                    position: "absolute",
                    right: "100%",
                    top: 0,
                    zIndex: 100,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    background: "var(--background)",
                    borderRadius: 8,
                    padding: 8,
                    marginRight: 12
                  }}
                >
                  <HexColorPicker
                    color={projectColor}
                    onChange={setProjectColor}
                    style={{ width: 180, height: 180 }}
                  />
                </div>
              )}
            </span>
          </h2>
          <div className="formFieldContainer" >
            <label>
              <span className="material-icons-round">apartment</span>{t("projects_name") || "Name"}
            </label>
            <input
              name="name"
              type="text"
              placeholder={t("projects_name_placeholder") || "What's the name of your project?"}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              required
            />
            <label className="label-tip">
              {t("projects_name_tip") || "TIP give it a short name"}
            </label>
            <label>
              <span className="material-icons-round">calendar_view_week</span>
              {t("projects_phase") || "Design Phase"}
            </label>
            <select name="phase" value={editPhase} onChange={e => setEditPhase(e.target.value as phase)} className="modalInput">
              <option value="Design">{t("projects_phase_design") || "Design"}</option>
              <option value="Construction project">{t("projects_phase_construction_project") || "Construction project"}</option>
              <option value="Execution">{t("projects_phase_execution") || "Execution"}</option>
              <option value="Construction">{t("projects_phase_construction") || "Construction"}</option>
            </select>
            <label>
              <span className="material-icons-round">subject</span>{t("projects_description") || "Description"}
            </label>
            <textarea
              name="description"
              cols={30}
              rows={6}
              placeholder={t("projects_description_placeholder") || "Give your project a nice description!"}
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
            />
          </div>
          <div className="formFieldContainer">
            <label>
              <span className="material-icons-round">pin_drop</span>{t("projects_location") || "Location"}
            </label>
            <AddressAutocompleteInput
              value={projectAddress}
              onChange={handleAddressChange}
              onLocationSelect={handleLocationSelect}
              placeholder={t("projects_location_placeholder") || "Enter project address..."}
              className="modalInput"
            />
            <label className="label-tip">
              {t("projects_location_tip") || "Start typing to search for addresses"}
            </label>
            <div className="mapContainer" style={{ marginTop: 0 }}>
              <OpenStreetMapComponent
                address={debouncedAddress}
                latitude={projectCoordinates?.lat}
                longitude={projectCoordinates?.lng}
                onLocationSelect={handleLocationSelect}
                interactive={false}
                showMarker={true}
                height="440px"
                zoom={25}
                plotNumber={plotNumber}
              />
              <div style={{ fontSize: '10px', color: '#666', padding: '4px' }}>
                Debug: address="{debouncedAddress}", coords=({projectCoordinates?.lat || 'undefined'}, {projectCoordinates?.lng || 'undefined'})
              </div>
            </div>
            <label className="label-tip">
              {t("projects_map_tip") || "Click on the map to select precise location"}
            </label>
          </div>
          <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
          <div className="formFieldContainer">
            <label>
              <span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}
            </label>
            <input
              name="startDate"
              type="date"
              value={formStartDate}
              onChange={e => setFormStartDate(e.target.value)}
              className="modalInput"
            />
          </div>
          <div className="formFieldContainer">
            <label>
              <span className="material-icons-round">calendar_month</span>{t("projects_finish_date") || "Finish Date"}
            </label>
            <input
              name="finishDate"
              type="date"
              value={formFinishDate}
              onChange={e => setFormFinishDate(e.target.value)}
              className="modalInput"
            />
          </div>
          <div style={{ gridColumn: "1 / -1", margin: "12px 0" }}>
            <Calendar
              tasks={[
                {
                  id: "temp-project-bar",
                  title: editName || "Project",
                  startDate: formStartDate,
                  dueDate: formFinishDate,
                  completed: false,
                  color: projectColor,
                  isProjectDuration: true,
                },
                ...projectTasks
              ]}
              start={formStartDate}
              end={formFinishDate}
              projectColor={projectColor}
              projectName={editName || "Project"}
              hideTaskNames={false}
            />
          </div>
          <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
          <div className="formFieldContainer">
            <label>
              <span className="material-icons-round">business</span>{t("projects_company") || "Company"}
            </label>
            <select
              name="companyId"
              value={project.companyId || ""}
              className="modalInput"
              onChange={() => {}} // If you want to allow changing company, add a handler
            >
              <option value="">{t("projects_company_none") || "No company"}</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <label className="label-tip">
              {t("projects_company_tip") || "Company associated with this project"}
            </label>
          </div>
          <div className="formFieldContainer">
            <label>
              <span className="material-icons-round">people</span>{t("projects_assigned_users") || "Assigned Users"}
            </label>
            <button
              type="button"
              className="userSelectionButton"
              onClick={() => setIsUserSelectionModalOpen(true)}
            >
              <span className="material-icons-round">person_add</span>
              {getSelectedUsersDisplay()}
            </button>
            <label className="label-tip">
              {t("projects_assigned_users_tip") || "Click to select users for this project"}
            </label>
          </div>
          <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
          <div className="formFieldContainer">
            <label>
              <span className="material-icons-round">paid</span>{t("projects_cost") || "Estimated cost"}
            </label>
            <input
              name="cost"
              type="number"
              placeholder={t("projects_cost_placeholder") || "What's the estimated cost of the project?"}
              value={editCost}
              onChange={e => setEditCost(e.target.value)}
              className="modalInput"
            />
            <label className="label-tip">
              {t("projects_cost_tip") || "Estimated cost of the project"}
            </label>
          </div>
          <div className="formFieldContainer">
            <label>
              <span className="material-icons-round">not_listed_location</span>
              {t("projects_status") || "Status"}
            </label>
            <select name="status" value={editStatus} onChange={e => setEditStatus(e.target.value as status)} className="modalInput">
              <option value="Pending">{t("projects_status_pending") || "Pending"}</option>
              <option value="Active">{t("projects_status_active") || "Active"}</option>
              <option value="Finished">{t("projects_status_finished") || "Finished"}</option>
            </select>
          </div>
          <div className="cancelAccept">
            <button
              type="button"
              className="cancelButton"
              onClick={onClose}
            >
              {t("projects_cancel") || "Cancel"}
            </button>
            <button type="submit" className="acceptButton">
              {t("projects_accept") || "Accept"}
            </button>
          </div>
        </form>
      </dialog>

      {isErrorModalOpen && (
        <dialog id="editProjectErrorModal" className="projectModal" open>
          <form
            className="userForm"
            id="editProjectErrorForm"
            method="dialog"
            style={{ boxSizing: "border-box"}}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 20,
                padding: 10,
                margin: 0
              }}
            >
              <span
                className="material-icons-round"
                style={{ fontSize: 20, verticalAlign: "middle" }}
              >
                warning
              </span>
              {t("projects_error") || "Error"}
            </h2>
            <div
              style={{
                borderTop: "2px solid var(--complementary200)",
                marginTop: 8,
                marginBottom: 16
              }}
            />
            <p
              id="errorMessage"
              style={{ display: "flex", justifyContent: "center" }}
            >
              {errorMessage}
            </p>
            <div
              style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
            >
              <button
                type="button"
                className="cancelButton"
                style={{ marginRight: 10, height: 30 }}
                onClick={() => setIsErrorModalOpen(false)}
              >
                OK
              </button>
            </div>
          </form>
        </dialog>
      )}

      {isUserSelectionModalOpen && (
        <dialog id="userSelectionModal" className="projectModal" open>
          <form className="userForm" onSubmit={e => e.preventDefault()}>
            <h2 style={{ margin: 0, padding: "16px 0" }}>
              <span className="material-icons-round" style={{ verticalAlign: "middle", marginRight: 8 }}>
                people
              </span>
              {t("projects_select_users") || "Select Users"}
            </h2>
            <div className="userSelectionGrid">
              {users.map(user => {
                const selected = selectedUsers.find(u => u.userId === user.id);
                const role = selected ? selected.role : "Developer";
                return (
                  <div
                    key={user.id}
                    className={`userSelectionCard${selected ? ' selected' : ''}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: 8,
                      minHeight: 48
                    }}
                  >
                    <div className="userIcon" style={{ backgroundColor: user.color }}>
                      {user.icon}
                    </div>
                    <div className="userInfo" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
                      <div className="userName">{user.name} {user.surname}</div>
                    </div>
                    <select
                      value={role}
                      onChange={e => {
                        if (selected) {
                          handleRoleChange(user.id!, e.target.value);
                        }
                      }}
                      disabled={!selected}
                      style={{
                        marginLeft: 8,
                        minWidth: 100,
                        height: 32,
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <option value="Developer">Developer</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Architect">Architect</option>
                      <option value="Manager">Manager</option>
                      <option value="">Other...</option>
                    </select>
                    {selected ? (
                      <button
                        type="button"
                        className="cancelButton"
                        onClick={() => handleUserToggle(user.id!)}
                        title={t("projects_remove_user") || "Remove"}
                        style={{
                          marginLeft: 8,
                          minWidth: 40,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <span className="material-icons-round" style={{ fontSize: 20, verticalAlign: "middle" }}>close</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="acceptButton"
                        onClick={() => handleUserToggle(user.id!)}
                        title={t("projects_add_user") || "Add"}
                        style={{
                          marginLeft: 8,
                          minWidth: 40,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <span className="material-icons-round" style={{ fontSize: 20, verticalAlign: "middle" }}>check</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 16 }}>
              <button
                type="button"
                className="cancelButton"
                onClick={() => setIsUserSelectionModalOpen(false)}
              >
                {t("projects_cancel") || "Cancel"}
              </button>
              <button
                type="button"
                className="acceptButton"
                onClick={handleUserSelectionConfirm}
              >
                {t("projects_confirm") || "Confirm"} ({selectedUsers.length})
              </button>
            </div>
          </form>
        </dialog>
      )}
    </>
  );
};

