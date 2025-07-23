import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import * as Router from 'react-router-dom';
import { usersManagerInstance } from '../classes/UsersManager';
import { User } from '../classes/User';
import { useTranslation } from "./LanguageContext";
import UserCard from "./UserCard";
import { SearchBox } from './SearchBox';
import { ThreeViewer } from './ThreeViewer';
import { InfoProjectForm } from "./InfoProjectForm";
import { EditProjectForm } from "./EditProjectForm";
import { companiesManagerInstance } from '../classes/CompaniesManager';
import { ToDoForm } from './ToDoForm';
import { ItoDo } from '../classes/toDo';
import { toDoManagerInstance } from '../classes/toDoManager';
import { ProjectTasksList } from "./ProjectTaskList";


interface Props {
    projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
    const { t } = useTranslation();
    const [isInfoModalOpen, setIsInfoModalOpen] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    // Helper to translate status and role
    const translateStatus = (status: string) => t(`projects_status_${status?.toLowerCase()}`) || status;
    const translateRole = (role: string) => {
        // Normalize role key: lowercase and replace spaces with underscores
        const normalizedRole = role?.toLowerCase().replace(/\s+/g, '_');
        return t(`projects_role_${normalizedRole}`) || role;
    };

    props.projectsManager.onProjectDeleted = () => {
        // Project deletion handling is now managed by ProjectsManager
        // UI updates will be handled by the onProjectDeleted callback
    };

    // Helper to close modals by id
    const closeModal = (id: string) => {
        const modal = document.getElementById(id) as HTMLDialogElement | null;
        if (modal) modal.close();
    };

    const { id } = useParams();
    const [projectState, setProjectState] = React.useState(id ? props.projectsManager.getProject(id) : undefined);
    // Only update projectState when the project ID changes
    React.useEffect(() => {
      setProjectState(id ? props.projectsManager.getProject(id) : undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, props.projectsManager]);
    if (!projectState) {
      return <div>Project not found.</div>;
    }

    // Handler for opening the info modal
    const openInfoModal = () => setIsInfoModalOpen(true);

    // Handler for opening the edit modal from info modal
    const openEditModal = () => {
      setIsInfoModalOpen(false);
      setTimeout(() => setIsEditModalOpen(true), 100); // slight delay for smooth UX
    };

    // Handler for submitting the edit form
    const handleEditProject = async (updates: any) => {
      if (projectState) {
        await props.projectsManager.updateProject(projectState.id, updates);
        setProjectState(props.projectsManager.getProject(projectState.id));
      }
      setIsEditModalOpen(false);
    };

    // Edit modal state for controlled fields
    const [editName, setEditName] = React.useState("");
    const [editDescription, setEditDescription] = React.useState("");
    const [editLocation, setEditLocation] = React.useState("");
    const [editProgress, setEditProgress] = React.useState("");
    const [editCost, setEditCost] = React.useState("");
    const [editUserRole, setEditUserRole] = React.useState("");
    const [editStatus, setEditStatus] = React.useState("");
    const [editPhase, setEditPhase] = React.useState("");
    const [editStartDate, setEditStartDate] = React.useState("");
    const [editFinishDate, setEditFinishDate] = React.useState("");

    // Add state for edit modal fields
    const [editAssignedTo, setEditAssignedTo] = React.useState('');
    const [editCreatedBy, setEditCreatedBy] = React.useState('');

    // --- ToDo modal state ---
    const [isNewToDoOpen, setIsNewToDoOpen] = React.useState(false);
    const [isEditToDoOpen, setIsEditToDoOpen] = React.useState(false);
    const [selectedToDo, setSelectedToDo] = React.useState<ItoDo | null>(null);

    // --- ToDo logic ---
    const [toDos, setToDos] = React.useState<any[]>([]);
    React.useEffect(() => {
        if (projectState && projectState.id && props.projectsManager) {
            setToDos(projectState.toDos || []);
        }
    }, [projectState?.id]);

    // --- ToDoForm handlers ---
    const handleCreateToDo = (todoData: Omit<ItoDo, 'id' | 'created_at' | 'updated_at'>) => {
        if (!projectState) return;
        const newToDo: ItoDo = {
            ...todoData,
            id: Date.now().toString(),
            project_id: projectState.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completion_date: "",
        };
        projectState.addToDo(newToDo);
        setToDos([...projectState.toDos]);
        setIsNewToDoOpen(false);
    };

    const handleEditToDo = (todoData: Omit<ItoDo, 'id' | 'created_at' | 'updated_at'>) => {
        if (!selectedToDo || !projectState) return;
        const updatedToDo: ItoDo = {
            ...selectedToDo,
            ...todoData,
            updated_at: new Date().toISOString(),
        };
        projectState.updateToDo(updatedToDo);
        setToDos([...projectState.toDos]);
        setIsEditToDoOpen(false);
        setSelectedToDo(null);
    };

    const handleDeleteToDo = () => {
        if (!selectedToDo || !projectState) return;
        projectState.toDos = projectState.toDos.filter(td => td.id !== selectedToDo.id);
        setToDos([...projectState.toDos]);
        setIsEditToDoOpen(false);
        setSelectedToDo(null);
    };

    // Add state for to-dos
    const [newToDo, setNewToDo] = React.useState({
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      assigned_to: '',
      created_by: '',
      due_date: '',
      start_date: '',
      estimated_hours: '',
      actual_hours: '',
      dependencies: [] as unknown as string[],
      comments: '',
    });

    // Handle new to-do form changes
    const handleNewToDoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setNewToDo({ ...newToDo, [e.target.name]: e.target.value });
    };

    // Refs
    const toDoListContainerRef = React.useRef<HTMLDivElement | null>(null);

    // Handle new to-do form submit
    const handleNewToDoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newToDo.title) return;
      if (!projectState) return;
      // Build ItoDo object with correct types
      const toDoObj = {
        id: Date.now().toString(),
        title: newToDo.title,
        description: newToDo.description,
        status: newToDo.status as any, // toDoStatus
        priority: newToDo.priority as any, // toDoPriority
        assigned_to: newToDo.assigned_to,
        created_by: newToDo.created_by,
        due_date: newToDo.due_date,
        start_date: newToDo.start_date,
        estimated_hours: Number(newToDo.estimated_hours) || 0,
        actual_hours: Number(newToDo.actual_hours) || 0,
        project_id: projectState.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completion_date: '',
        dependencies: Array.isArray(newToDo.dependencies) ? newToDo.dependencies : (typeof newToDo.dependencies === 'string' && (newToDo.dependencies as string) ? (newToDo.dependencies as string).split(',').map(s => s.trim()) : []),
        progress_percentage: '25%' as const,
        comments: newToDo.comments ? newToDo.comments.split('\n').filter(c => c.trim()) : [],
      };
      projectState.addToDo(toDoObj);
      setToDos([...projectState.toDos]);
      setNewToDo({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        assigned_to: '',
        created_by: '',
        due_date: '',
        start_date: '',
        estimated_hours: '',
        actual_hours: '',
        dependencies: [] as unknown as string[],
        comments: ''
      });
      closeModal('newToDoModal');
    };

    // --- EDIT MODAL STATE ---
const [editToDo, setEditToDo] = React.useState<any | null>(null);
const [editToDoFields, setEditToDoFields] = React.useState({
  id: '',
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  assigned_to: '',
  created_by: '',
  due_date: '',
  start_date: '',
  estimated_hours: '',
  actual_hours: '',
  updated_at: '',
  dependencies: [] as string[],
  comments: '',
});

    // --- OPEN EDIT MODAL ---
    const openEditToDoModal = (todo: any) => {
      setEditToDo(todo);
      setEditToDoFields({
        id: todo.id || '',
        title: todo.title || '',
        description: todo.description || '',
        status: todo.status || 'Pending',
        priority: todo.priority || 'Medium',
        assigned_to: todo.assigned_to || '',
        created_by: todo.created_by || '',
        due_date: todo.due_date || '',
        start_date: todo.start_date || '',
        estimated_hours: todo.estimated_hours?.toString() || '',
        actual_hours: todo.actual_hours?.toString() || '',
        updated_at: todo.updated_at || '',
        dependencies: Array.isArray(todo.dependencies) ? todo.dependencies : [],
        comments: Array.isArray(todo.comments) ? todo.comments.join('\n') : (todo.comments || ''),
      });
      setTimeout(() => {
        const modal = document.getElementById('editToDoModal') as HTMLDialogElement | null;
        if (modal) modal.showModal();
      }, 0);
    };

    // --- HANDLE EDIT MODAL FIELD CHANGES ---
    const handleEditToDoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditToDoFields(prev => ({ ...prev, [name]: value }));
    };

    // --- HANDLE EDIT SUBMIT ---
    const handleEditToDoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!projectState) return;
      
      const id = editToDoFields.id;
      
      // Build the updated todo object with proper type conversions
      const updatedToDoData = {
        id: id,
        title: editToDoFields.title,
        description: editToDoFields.description,
        status: editToDoFields.status as any, // toDoStatus
        priority: editToDoFields.priority as any, // toDoPriority
        assigned_to: editToDoFields.assigned_to,
        created_by: editToDoFields.created_by,
        due_date: editToDoFields.due_date,
        start_date: editToDoFields.start_date,
        estimated_hours: parseFloat(editToDoFields.estimated_hours) || 0,
        actual_hours: parseFloat(editToDoFields.actual_hours) || 0,
        updated_at: new Date().toISOString(),
        project_id: projectState.id,
        created_at: editToDo.created_at || new Date().toISOString(),
        completion_date: editToDo.completion_date || '',
        progress_percentage: editToDo.progress_percentage || '25%',
        dependencies: editToDoFields.dependencies,
        comments: editToDoFields.comments ? editToDoFields.comments.split('\n').filter(c => c.trim()) : [],
      };

      try {
        // Use the project's updateToDo method to properly persist changes
        projectState.updateToDo(updatedToDoData);
        
        // Update local state to reflect changes in UI
        setToDos([...projectState.toDos]);
        
        setEditToDo(null);
        closeModal('editToDoModal');
      } catch (error) {
        console.error('Failed to update todo:', error);
        // You could add user feedback here
      }
    };

    // Add state for deleting a to-do
    const [toDoToDelete, setToDoToDelete] = React.useState<any | null>(null);

    // Handler for delete confirmation
    const handleConfirmDeleteToDo = () => {
        if (toDoToDelete && projectState) {
          projectState.toDos = projectState.toDos.filter(td => td.id !== toDoToDelete.id);
          setToDos([...projectState.toDos]);
          setToDoToDelete(null);
          closeModal('DeleteTaskModal');
          closeModal('editToDoModal');
        }
      };

    // State for assigning users
    const [assignUserModalOpen, setAssignUserModalOpen] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState('');
    const [customRole, setCustomRole] = React.useState('');
    const [assignError, setAssignError] = React.useState('');

    // Handler for assigning user
    const handleAssignUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!projectState) return;
      if (!selectedUserId || !customRole) {
        setAssignError('Please select a user and enter a role.');
        return;
      }
      if (projectState.assignedUsers.some(u => u.userId === selectedUserId)) {
        setAssignError('This user is already assigned to this project.');
        return;
      }
      
      try {
        const newAssignedUsers = [...projectState.assignedUsers, { userId: selectedUserId, role: customRole }];
        
        // Update in Firebase
        await props.projectsManager.updateProject(projectState.id || '', { assignedUsers: newAssignedUsers });
        
        // Update local state
        const updated = Object.assign(Object.create(Object.getPrototypeOf(projectState)), {
          ...projectState,
          assignedUsers: newAssignedUsers,
        });
        setProjectState(updated);
        
        setAssignUserModalOpen(false);
        setSelectedUserId('');
        setCustomRole('');
        setAssignError('');
        
        console.log("User assigned successfully");
      } catch (error) {
        console.error("Failed to assign user:", error);
        setAssignError('Failed to assign user. Please try again.');
      }
    };

    // State for user to delete
    const [userToDelete, setUserToDelete] = React.useState<{userId: string, name: string} | null>(null);
    // Handler for confirming user removal
    const handleConfirmDeleteUser = async () => {
      if (!userToDelete || !projectState) return;
      
      try {
        const updatedAssigned = projectState.assignedUsers.filter(u => u.userId !== userToDelete.userId);
        
        // Update in Firebase
        await props.projectsManager.updateProject(projectState.id || '', { assignedUsers: updatedAssigned });
        
        // Update local state
        const updated = Object.assign(Object.create(Object.getPrototypeOf(projectState)), {
          ...projectState,
          assignedUsers: updatedAssigned,
        });
        setProjectState(updated);
        
        setUserToDelete(null);
        closeModal('DeleteUserModal');
        
        console.log("User removed successfully");
      } catch (error) {
        console.error("Failed to remove user:", error);
      }
    };

    // Helper to get assigned users for dropdowns
const assignedUsers = projectState.assignedUsers
  .map(au => usersManagerInstance.getUsers().find(u => u.id === au.userId))
  .filter((user): user is User => Boolean(user));

    // Add navigation
const navigate = Router.useNavigate();

    // --- HANDLE DELETE PROJECT CONFIRMATION ---
const handleConfirmDeleteProject = async () => {
  if (projectState && projectState.id) {
    try {
      await props.projectsManager.deleteProject(projectState.id);
      closeModal('DeleteProjectModal');
      navigate('/'); // or navigate('/projects') if that's your route
    } catch (error) {
      console.error('Failed to delete project:', error);
      // The error will be handled by the ProjectsManager's onProjectError callback
    }
  }
};

    // State for active card (users or todo)
const [activeLeftCard, setActiveLeftCard] = React.useState<'users' | 'todo'>('todo');

    // Add state for to-do search
    const [toDoSearchQuery, setToDoSearchQuery] = React.useState("");
    // Filter to-dos by title
    const filteredToDos = toDos.filter(todo =>
      todo.title.toLowerCase().includes(toDoSearchQuery.toLowerCase())
    );

    // Add state for assigned user search
    const [assignedUserSearchQuery, setAssignedUserSearchQuery] = React.useState("");
    // Filter assigned users by name or surname
    const filteredAssignedUsers = projectState.assignedUsers
      .map(au => usersManagerInstance.getUsers().find(u => u.id === au.userId))
      .filter((user): user is User => Boolean(user))
      .filter(user =>
        user.name.toLowerCase().includes(assignedUserSearchQuery.toLowerCase()) ||
        user.surname.toLowerCase().includes(assignedUserSearchQuery.toLowerCase())
      );

    // --- Helper to get all other tasks in the same project (for new/edit modals) ---
function getOtherTasks(project: any, excludeId: string | null = null) {
  if (!project || !project.toDos) return [];
  return project.toDos.filter((td: any) => excludeId ? td.id !== excludeId : true);
}

    // --- RENDER ---
    return (
      <div className="page" id="projectDetails">
        <div className="project-details-layout">
          <div className="project-details-left-col">
            <div className="dashboardCard project-dashboard-card" >
              <div className="upperDashboard">
                <p
                  id="iconPD"
                  style={{
                    fontSize: "var(--fontSizeBig)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: projectState.color,
                    padding: 5,
                    borderRadius: "50%",
                    aspectRatio: 1,
                    width: 40,
                    height: 40,
                    color: "white"
                  }}
                  data-project-info="iconPD"
                >
                  {projectState.icon}
                </p>
                <div className="flex-row-gap-10">
                  <button
                    id="infoProject"
                    className="buttonTertiary"
                    onClick={openInfoModal}
                    style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, padding: 0, minWidth: 0, border: "none", background: "var(--primary)", color: "white" }}
                    title={t("projects_info") || "Info"}
                  >
                    <span className="material-icons-round">info</span>
                  </button>
                  <button
                    id="deleteProjectBtn"
                    className="roundButton"
                    onClick={() => {
                      const modal = document.getElementById('DeleteProjectModal') as HTMLDialogElement | null;
                      if (modal) modal.showModal();
                    }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", backgroundColor: "#ff3b3b", color: "white", fontSize: 24, border: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", cursor: "pointer" }}
                    title={t("projects_delete") || "Delete"}
                  >
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              </div>
              <div className="middleDashboard">
                <h5 data-project-info="nameBigPD">{projectState.name}</h5>
                <p data-project-info="descriptionPD">
                  {projectState.description || t("projects_no_description") || "No description provided."}
                </p>
              </div>
              <div className="bottomDashboard">
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
                    {t("projects_status") || "Status"}
                  </p>
                  <p data-project-info="statusPD">{translateStatus(projectState.status) || t("projects_no_status") || "No status provided."}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
                    {t("projects_cost") || "Cost"}
                  </p>
                  <p data-project-info="costPD">{projectState.cost || t("projects_no_cost") || "No cost provided."}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
                    {t("projects_role") || "Role"}
                  </p>
                  <p data-project-info="rolePD">{translateRole(projectState.userRole) || t("projects_no_role") || "No role provided."}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
                    {t("projects_start_date") || "Start Date"}
                  </p>
                  <p data-project-info="startPD">{projectState.startDate || t("projects_no_start_date") || "No start date provided."}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
                    {t("projects_finish_date") || "Finish Date"}
                  </p>
                  <p data-project-info="finishPD">{projectState.finishDate || t("projects_no_finish_date") || "No finish date provided."}</p>
                </div>
              </div>
              {/* Progress bar - always visible, not clipped */}
              <div style={{ backgroundColor: "#404040", width: "calc(100% - 40px)", height: 25, borderRadius: 50, overflow: "hidden", margin: "20px auto 30px auto", position: "relative" }}>
                <div id="percentageDiv" style={{ width: `${projectState.progress ?? 0}%`, height: "100%", backgroundColor: (projectState.progress ?? 0) >= 50 ? "var(--green)" : "orange", borderRadius: "10px 0 0 10px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", color: "white", fontWeight: "bold", transition: "width 0.5s" }}>
                  <span id="progressText" style={{ position: "absolute", width: "100%", textAlign: "center", left: 0 }}>{projectState.progress ?? 0}%</span>
                </div>
              </div>
            </div>
            {activeLeftCard === 'users' && (
              <div className="dashboardCard project-assigned-users-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="tabs-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ margin: 0, whiteSpace: 'nowrap' }}>{t("projects_assigned_users") || "Assigned Users"}</h4>
                    <button
                      className={activeLeftCard === 'users' ? 'tabCircle active' : 'tabCircle'}
                      onClick={() => setActiveLeftCard('todo')}
                      type="button"
                      title={t("projects_show_todo") || "Show To-Do"}
                    >
                      <span className="material-icons-round">checklist</span>
                    </button>
                    {/* Assigned user search bar, right of title and icon */}
                    <SearchBox
                      value={assignedUserSearchQuery}
                      onValueChange={setAssignedUserSearchQuery}
                      style={{ minWidth: 180 }}
                      placeholder={t("search_users") || "Search for users"}
                    />
                  </div>
                  <button className="buttonTertiary" onClick={() => setAssignUserModalOpen(true)}>
                    <span className="material-icons-round">add</span>
                  </button>
                </div>
                <div>
      {filteredAssignedUsers.length > 0 ? (
        filteredAssignedUsers.map((user, idx) => {
          const au = projectState.assignedUsers.find(au => au.userId === user.id);
          if (!user || !au) return null;
          return (
            <UserCard
              key={au.userId}
              user={user}
              projectRole={au.role} // Pass the project-specific role
              onEdit={id => window.openEditUserModal && window.openEditUserModal(id)}
              onDelete={id => {
                setUserToDelete({ userId: id, name: `${user.name} ${user.surname}` });
                const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null;
                if (modal) modal.showModal();
              }}
            />
          );
        })
      ) : (
        <div style={{color: '#aaa'}}>
          {t("projects_no_users_assigned")}
        </div>
      )}
    </div>
              </div>
            )}
            {activeLeftCard === 'todo' && (
              <div className="dashboardCard project-todo-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                  <div className="tabs-row">
                    <h4 style={{ margin: 0, whiteSpace: 'nowrap' }}>{t("projects_todo") || "To-Do"}</h4>
                    <button
                      className={activeLeftCard === 'todo' ? 'tabCircle active' : 'tabCircle'}
                      onClick={() => setActiveLeftCard('users')}
                      type="button"
                      title={t("projects_show_assigned_users") || "Show Assigned Users"}
                    >
                      <span className="material-icons-round">group</span>
                    </button>
                  </div>
                  <button id="newToDoBtn" className="buttonTertiary" style={{ marginLeft: 8 }} onClick={() => setIsNewToDoOpen(true)}>
                    <span className="material-icons-round">add</span>
                  </button>
                </div>
                {/* --- Use ProjectTasksList here --- */}
                <div className="todo-cards-list">
    <ProjectTasksList
      todos={toDos}
      onEdit={todo => {
        setSelectedToDo(todo);
        setIsEditToDoOpen(true);
      }}
      updateTodo={async (id, updates) => {
        // Find the todo and update it in projectState
        const todo = projectState.toDos.find(td => td.id === id);
        if (todo) {
          const updated = { ...todo, ...updates, updated_at: new Date().toISOString() };
          projectState.updateToDo(updated);
          setToDos([...projectState.toDos]);
          return updated; // <-- Return the updated todo to match Promise<ItoDo>
        }
        return Promise.reject(new Error("Todo not found"));
      }}
    />
  </div>
              </div>
            )}
          </div>
          <div className="project-details-right-col">
          <ThreeViewer/>
          </div>
        </div>
        {/* All dialogs and modals remain here, outside the grid */}
        {/* Assign User Modal */}
      <dialog open={assignUserModalOpen} className="modal-z10 assign-user-modal">
        <form onSubmit={handleAssignUser} className="app-modal-form">
          <h2>{t("projects_assign_user") || "Assign User to Project"}</h2>
          <div className="formFieldContainer">
            <label>{t("projects_user") || "User"}</label>
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
              <option value="">{t("projects_select_user") || "Select user"}</option>
              {usersManagerInstance.getUsers().map(user => (
                <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
              ))}
            </select>
          </div>
          <div className="formFieldContainer">
            <label>{t("projects_role_in_project") || "Role in this project"}</label>
            <input type="text" value={customRole} onChange={e => setCustomRole(e.target.value)} placeholder={t("projects_role_placeholder") || "e.g. Project Lead, Consultant..."} />
          </div>
          {assignError && <div className="error-text">{assignError}</div>}
          <div className="cancelAccept">
            <button type="button" className="cancelButton" onClick={() => { setAssignUserModalOpen(false); setAssignError(''); }}>{t("projects_cancel") || "Cancel"}</button>
            <button type="submit" className="acceptButton">{t("projects_assign") || "Assign"}</button>
          </div>
        </form>
      </dialog>
      <dialog id="DeleteProjectModal">
            <form className="app-modal-form" id="DeleteNewProjectForm">
                <h2>{t("projects_confirm_delete_project") || "Are you sure you want to delete the project?"}</h2>
                <div className="cancelAccept">
                    <button
                        type="button"
                        className="cancelButton"
                        onClick={() => closeModal('DeleteProjectModal')}>{t("projects_cancel") || "Cancel"}
                    </button>
                    <button type="button" className="acceptButton" id="ConfirmDeleteButton" onClick={handleConfirmDeleteProject}>{t("projects_delete") || "Delete"}</button>
                </div>
            </form>
        </dialog>
        <dialog id="DeleteTaskModal">
            <form className="app-modal-form" id="DeleteNewTaskForm">
                <h2>{t("projects_confirm_delete_task") || "Are you sure you want to delete the task:"} {toDoToDelete?.title ? `"${toDoToDelete.title}"?` : "?"}</h2>
                <div className="cancelAccept">
                    <button
                        type="button"
                        className="cancelButton"
                        onClick={() => { setToDoToDelete(null); closeModal('DeleteTaskModal'); }}>
                        {t("projects_cancel") || "Cancel"}
                    </button>
                    <button type="button" className="acceptButton" id="ConfirmDeleteButton" onClick={handleConfirmDeleteToDo}>{t("projects_delete") || "Delete"}</button>
                </div>
            </form>
        </dialog>
        
        <InfoProjectForm
  isOpen={isInfoModalOpen}
  onClose={() => setIsInfoModalOpen(false)}
  onEdit={openEditModal}
  project={projectState}
  t={t}
  companies={companiesManagerInstance.getCompanies()}
  users={usersManagerInstance.getUsers()}
/>
      <EditProjectForm
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  project={projectState}
  onSubmit={handleEditProject}
  t={t}
  companies={companiesManagerInstance.getCompanies()}
  users={usersManagerInstance.getUsers()}
/>

            {/* New ToDo */}
            <ToDoForm
                open={isNewToDoOpen}
                onClose={() => setIsNewToDoOpen(false)}
                onSubmit={handleCreateToDo}
                projects={[projectState]}
                selectedProjectId={projectState.id}
                submitLabel={t("projects_accept") || "Accept"}
                availableTasks={toDos}
                showTitle={false}
            />

            {/* Edit ToDo */}
            <ToDoForm
                open={isEditToDoOpen}
                onClose={() => {
                    setIsEditToDoOpen(false);
                    setSelectedToDo(null);
                }}
                onSubmit={handleEditToDo}
                onDelete={handleDeleteToDo}
                initialData={selectedToDo || undefined}
                projects={[projectState]}
                selectedProjectId={projectState.id}
                submitLabel={t("projects_accept") || "Accept"}
                availableTasks={toDos}
                showTitle={false}
            />

    </div>
  );
};