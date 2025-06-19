import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import * as Router from 'react-router-dom';
import { toDoManager } from '../classes/toDoManager';
import { usersManagerInstance } from '../classes/UsersManager';

interface Props {

    projectsManager: ProjectsManager
    toDoManager: toDoManager;
}

export function ToDoPage(props: Props) {
    // Helper to close modals by id
    const closeModal = (id: string) => {
        const modal = document.getElementById(id) as HTMLDialogElement | null;
        if (modal) modal.close();
    };
    const routeParams = Router.useParams<{ id: string }>();
    console.log("toDoPage routeParams:", routeParams.id);
    const { id } = useParams();
    // Ensure id is a string before using it
    const [projectState, setProjectState] = React.useState(id ? props.projectsManager.getProject(id) : undefined);
    React.useEffect(() => {
      props.projectsManager.setChangeButton();
      setProjectState(id ? props.projectsManager.getProject(id) : undefined);
    }, [props.projectsManager, id]);


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



    // Add state for to-dos
    const [toDos, setToDos] = React.useState<any[]>([]);

    // Load to-dos for the current project
    React.useEffect(() => {
      if (projectState && projectState.id && props.projectsManager) {
        // If your ProjectsManager or Project class has a method to get to-dos for a project, use it here
        // Example: setToDos(props.projectsManager.getToDosForProject(projectState.id));
        // For now, try to get from projectState.toDos if available
        setToDos(projectState.toDos || []);
      }
    }, [projectState]);

    // State for new to-do form fields
    const [newToDo, setNewToDo] = React.useState({
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Standard',
      assigned_to: '',
      created_by: '',
      due_date: '',
      start_date: '',
      estimated_hours: '',
      actual_hours: '',
      updated_at: '',
      dependencies: '', // comma-separated string for input
      comments: '', // string for textarea
    });

    // Handle new to-do form changes
    const handleNewToDoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewToDo(prev => ({ ...prev, [name]: value }));
    };

    // Refs
    const toDoListContainerRef = React.useRef<HTMLDivElement | null>(null);

    // Handle new to-do form submit
    const handleNewToDoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const project = newToDoProject || projectState;
      if (!newToDo.title) return;
      if (!project) return;
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
        project_id: project.id,
        created_at: new Date().toISOString(),
        updated_at: newToDo.updated_at || new Date().toISOString(),
        completion_date: '',
        dependencies: newToDo.dependencies ? newToDo.dependencies.split(',').map(s => s.trim()) : [],
        progress_percentage: '25%' as const,
        comments: newToDo.comments ? [newToDo.comments] : [],
      };
      project.addToDo(toDoObj);
      setToDos([...project.toDos]);
      setNewToDo({
        title: '', description: '', status: 'Pending', priority: 'Standard', assigned_to: '', created_by: '', due_date: '', start_date: '', estimated_hours: '', actual_hours: '', updated_at: '', dependencies: '', comments: ''
      });
      setNewToDoProject(null);
      closeModal('newToDoModal');
    };

    // State for editing a to-do
    const [editToDo, setEditToDo] = React.useState<any | null>(null);
    const [editToDoFields, setEditToDoFields] = React.useState({
      id: '',
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Standard',
      assigned_to: '',
      created_by: '',
      due_date: '',
      start_date: '',
      estimated_hours: '',
      actual_hours: '',
      updated_at: '',
      dependencies: '',
      comments: '',
    });
    const [editToDoProject, setEditToDoProject] = React.useState<any | null>(null);

    // Function to open the edit modal for a to-do
    const openEditToDoModal = (todo: any) => {
      setEditToDo(todo);
      // Find the project for this to-do
      const project = props.projectsManager.list.find(p => p.id === todo.project_id);
      setEditToDoProject(project || null);
      setEditToDoFields({
        id: todo.id || '',
        title: todo.title || '',
        description: todo.description || '',
        status: todo.status || 'Pending',
        priority: todo.priority || 'Standard',
        assigned_to: todo.assigned_to || '',
        created_by: todo.created_by || '',
        due_date: todo.due_date || '',
        start_date: todo.start_date || '',
        estimated_hours: todo.estimated_hours || '',
        actual_hours: todo.actual_hours || '',
        updated_at: todo.updated_at || '',
        dependencies: (todo.dependencies || []).join(', '),
        comments: (todo.comments || []).join('\n'),
      });
      setTimeout(() => {
        const modal = document.getElementById('editToDoModal') as HTMLDialogElement | null;
        if (modal) modal.showModal();
      }, 0);
    };

    // Handle edit to-do form changes
    const handleEditToDoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditToDoFields(prev => ({ ...prev, [name]: value }));
    };

    // Handler for editing a to-do
    const handleEditToDoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const id = editToDoFields.id;
      // Update the to-do in all projects
      props.projectsManager.list.forEach(project => {
        if (project.toDos) {
          project.toDos.forEach(td => {
            if (td.id === id) {
              td.title = editToDoFields.title;
              td.description = editToDoFields.description;
              td.status = editToDoFields.status as any;
              td.priority = editToDoFields.priority as any;
              td.assigned_to = editToDoFields.assigned_to;
              td.created_by = editToDoFields.created_by;
              td.start_date = editToDoFields.start_date;
              td.updated_at = editToDoFields.updated_at;
              td.estimated_hours = parseFloat(editToDoFields.estimated_hours) || 0;
              td.actual_hours = parseFloat(editToDoFields.actual_hours) || 0;
              td.due_date = editToDoFields.due_date;
              td.dependencies = editToDoFields.dependencies ? editToDoFields.dependencies.split(',').map(s => s.trim()) : [];
              td.comments = editToDoFields.comments ? [editToDoFields.comments] : [];
            }
          });
        }
      });
      // Force re-render by updating state
      setToDos([]); // Clear first to force update
      setTimeout(() => setToDos([]), 0); // Double clear in case of async
      setTimeout(() => setToDos(props.projectsManager.list.flatMap(p => p.toDos || [])), 10);
      closeModal('editToDoModal');
    };

    // State for new to-do modal and project
    const [newToDoProject, setNewToDoProject] = React.useState<any | null>(null);
    const newToDoModalRef = React.useRef<HTMLDialogElement | null>(null);

    // Function to open the new to-do modal for a specific project
    const openNewToDoModal = (project: any) => {
      setNewToDoProject(project);
      setTimeout(() => {
        if (newToDoModalRef.current) newToDoModalRef.current.showModal();
      }, 0);
    };

    // Add state to track which to-do is being deleted
    const [toDoToDelete, setToDoToDelete] = React.useState<any | null>(null);

    // Handler for delete confirmation
    const handleConfirmDeleteToDo = () => {
      if (toDoToDelete) {
        // Remove from the correct project in the manager
        props.projectsManager.list.forEach(project => {
          if (project.toDos) {
            project.toDos = project.toDos.filter(td => td.id !== toDoToDelete.id);
          }
        });
        // Update UI with all to-dos
        setToDos(props.projectsManager.list.flatMap(p => p.toDos || []));
        setToDoToDelete(null);
        closeModal('DeleteTaskModal');
        closeModal('editToDoModal');
      }
    };

    // Helper to get assigned users for a project
    const getAssignedUsers = (project) => {
      if (!project || !project.assignedUsers) return [];
      return project.assignedUsers
        .map(au => usersManagerInstance.getUsers().find(u => u.id === au.userId))
        .filter(Boolean);
    };

    return (
      <div className="page page-column" id="toDoPage">
        <div className="todo-cards-list" style={{ gap: '10px' }}>
          {props.projectsManager.list.map(project => (
            <div key={project.id} className="todo-card">
              <div className="todo-card-header">
                <h3 className="todo-card-title">{project.name}</h3>
                <button
                  className="buttonTertiary todo-add-btn"
                  onClick={() => openNewToDoModal(project)}
                  title="Add To-Do"
                >
                  <span className="material-icons-round">add</span>
                  <span className="material-icons-round">check_circle</span>
                </button>
              </div>
              {/* Header row for task columns */}
              <div className="todo-items-header">
                <span></span>
                <span className="todo-header-label">Title</span>
                <span className="todo-header-label">Priority</span>
                <span className="todo-header-label">Responsible Person</span>
                <span className="todo-header-label">Due Date</span>
                <span></span>
              </div>
              {(!project.toDos || project.toDos.length === 0) ? (
                <div className="todo-empty">No to-dos for this project.</div>
              ) : (
                <div className="todo-tasks-list">
                  {project.toDos.map(todo => {
                    let statusClass = 'status-pending';
                    switch (todo.status) {
                      case 'Pending': statusClass = 'status-pending'; break;
                      case 'In Progress': statusClass = 'status-inprogress'; break;
                      case 'Completed': statusClass = 'status-completed'; break;
                      case 'On Hold': statusClass = 'status-onhold'; break;
                      default: statusClass = 'status-pending';
                    }
                    const assignedUser = (project.assignedUsers || [])
                      .map(au => usersManagerInstance.getUsers().find(u => u.id === au.userId))
                      .find(u => u && u.id === todo.assigned_to);
                    return (
                      <div
                        key={todo.id}
                        className={`todoItem ${statusClass}`}
                        onClick={() => openEditToDoModal(todo)}
                      >
                        <span className="todo-task-icon">
                          <span className="material-icons-round">check_circle</span>
                        </span>
                        <span className="todo-task-value" style={{ fontWeight: 600 }}>{todo.title}</span>
                        <span className="todo-task-value">{todo.priority}</span>
                        <span className="todo-task-value">{assignedUser ? `${assignedUser.name} ${assignedUser.surname}` : ''}</span>
                        <span className="todo-task-value">{todo.due_date}</span>
                        <span className="todo-task-delete">
                          <button
                            className="buttonTertiary"
                            style={{background: '#FC3140', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8, justifySelf: 'end'}}
                            title="Delete task"
                            onClick={e => {
                              e.stopPropagation();
                              setToDoToDelete(todo);
                              const modal = document.getElementById('DeleteTaskModal') as HTMLDialogElement | null;
                              if (modal) modal.showModal();
                            }}
                          >
                            <span className="material-icons-round" style={{fontSize: 18}}>close</span>
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Edit To-Do Modal */}
        <dialog id="editToDoModal">
          <form className="userForm form-wide" id="editToDoForm" onSubmit={handleEditToDoSubmit}>
            <input type="hidden" id="editToDoId" name="id" value={editToDoFields.id} />
            <h2>Edit Task</h2>
            <div className="userCard">
              <div className="formFieldContainer">
                <label><span className="material-icons-round">apartment</span>Title</label>
                <input name="title" type="text" id="editToDoTitle" value={editToDoFields.title} onChange={handleEditToDoChange} />
                <label className="label-tip">TIP give it a short title</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>Description</label>
                <textarea name="description" cols={30} rows={5} placeholder="Description" id="editToDoDescription" value={editToDoFields.description} onChange={handleEditToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Status</label>
                <select name="status" id="editToDoStatus" value={editToDoFields.status} onChange={handleEditToDoChange}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Priority</label>
                <select name="priority" id="editToDoPriority" value={editToDoFields.priority} onChange={handleEditToDoChange}>
                  <option>High</option>
                  <option>Standard</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>Estimated hours</label>
                <input name="estimated_hours" type="number" placeholder="Estimated hours for the task" id="editToDoEstimatedHours" value={editToDoFields.estimated_hours} onChange={handleEditToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>Estimated hours for the task</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>Actual hours</label>
                <input name="actual_hours" type="number" placeholder="Hours used so far" id="editToDoActualHours" value={editToDoFields.actual_hours} onChange={handleEditToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>Hours used so far</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Responsible Person</label>
                <select name="assigned_to" id="editToDoAssignedTo" value={editToDoFields.assigned_to} onChange={handleEditToDoChange}>
                  <option value="">Select responsible person</option>
                  {(editToDoProject ? getAssignedUsers(editToDoProject) : []).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Created By</label>
                <select name="created_by" id="editToDoCreatedBy" value={editToDoFields.created_by} onChange={handleEditToDoChange}>
                  <option value="">Select creator</option>
                  {(editToDoProject ? getAssignedUsers(editToDoProject) : []).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_today</span>Start Date</label>
                <input name="start_date" type="date" id="editToDoStartDate" value={editToDoFields.start_date} onChange={handleEditToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_month</span>Due Date</label>
                <input name="due_date" type="date" id="editToDoDueDate" value={editToDoFields.due_date} onChange={handleEditToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Dependencies</label>
                <input name="dependencies" id="editToDoDependencies" value={editToDoFields.dependencies} onChange={handleEditToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>Comma-separated task IDs</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>Comments</label>
                <textarea name="comments" cols={30} rows={5} placeholder="Add any clarification comment" id="editToDoComments" value={editToDoFields.comments} onChange={handleEditToDoChange} />
              </div>
            </div>
            <div className="cancelAccept">
              <button type="button" className="cancelButton" onClick={() => closeModal('editToDoModal')}>
                Cancel
              </button>
              <button type="submit" className="acceptButton" id="submitEditToDoButton">
                Accept
              </button>
              <button
                type="button"
                className="deleteButton"
                style={{ marginLeft: 16 }}
                onClick={() => {
                  setToDoToDelete(editToDo);
                  const modal = document.getElementById('DeleteTaskModal') as HTMLDialogElement | null;
                  if (modal) modal.showModal();
                }}
              >
                Delete
              </button>
            </div>
          </form>
        </dialog>

        {/* New To-Do Modal */}
        <dialog id="newToDoModal" ref={newToDoModalRef}>
          <form className="userForm form-wide" id="newToDoForm" onSubmit={handleNewToDoSubmit}>
            <h2>New Task</h2>
            <div className="userCard">
              <div className="formFieldContainer">
                <label><span className="material-icons-round">apartment</span>Title</label>
                <input name="title" type="text" id="newToDoTitle" value={newToDo.title} onChange={handleNewToDoChange} />
                <label className="label-tip">TIP give it a short title</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>Description</label>
                <textarea name="description" cols={30} rows={5} placeholder="Description" id="newToDoDescription" value={newToDo.description} onChange={handleNewToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Status</label>
                <select name="status" id="newToDoStatus" value={newToDo.status} onChange={handleNewToDoChange}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Priority</label>
                <select name="priority" id="newToDoPriority" value={newToDo.priority} onChange={handleNewToDoChange}>
                  <option>High</option>
                  <option>Standard</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>Estimated hours</label>
                <input name="estimated_hours" type="number" placeholder="Estimated hours for the task" id="newToDoEstimatedHours" value={newToDo.estimated_hours} onChange={handleNewToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>Estimated hours for the task</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>Actual hours</label>
                <input name="actual_hours" type="number" placeholder="Hours used so far" id="newToDoActualHours" value={newToDo.actual_hours} onChange={handleNewToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>Hours used so far</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Responsible Person</label>
                <select name="assigned_to" id="newToDoAssignedTo" value={newToDo.assigned_to} onChange={handleNewToDoChange}>
                  <option value="">Select user</option>
                  {getAssignedUsers(newToDoProject || projectState).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Created By</label>
                <select name="created_by" id="newToDoCreatedBy" value={newToDo.created_by} onChange={handleNewToDoChange}>
                  <option value="">Select user</option>
                  {getAssignedUsers(newToDoProject || projectState).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_today</span>Start Date</label>
                <input name="start_date" type="date" id="newToDoStartDate" value={newToDo.start_date} onChange={handleNewToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_month</span>Due Date</label>
                <input name="due_date" type="date" id="newToDoDueDate" value={newToDo.due_date} onChange={handleNewToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>Dependencies</label>
                <input name="dependencies" id="newToDoDependencies" value={newToDo.dependencies} onChange={handleNewToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>Comma-separated task IDs</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>Comments</label>
                <textarea name="comments" cols={30} rows={5} placeholder="Add any clarification comment" id="newToDoComments" value={newToDo.comments} onChange={handleNewToDoChange} />
              </div>
            </div>
            <div className="cancelAccept">
              <button type="button" className="cancelButton" onClick={() => closeModal('newToDoModal')}>
                Cancel
              </button>
              <button type="submit" className="acceptButton" id="submitToDoButton">
                Accept
              </button>
            </div>
          </form>
        </dialog>

        {/* Delete To-Do Modal */}
        <dialog id="DeleteTaskModal">
            <form className="userForm" id="DeleteNewTaskForm">
                <h2>Are you sure you want to delete the task: {toDoToDelete?.title} ?</h2>
                <div className="cancelAccept">
                    <button
                        type="button"
                        className="cancelButton"
                        onClick={() => { setToDoToDelete(null); closeModal('DeleteTaskModal'); }}
                    >
                        Cancel
                    </button>
                    <button type="button" className="acceptButton" id="ConfirmDeleteButton" onClick={handleConfirmDeleteToDo}>Delete</button>
                </div>
            </form>
        </dialog>
      </div>
    );
}