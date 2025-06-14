import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import * as Router from 'react-router-dom';
import { toDoManager } from '../classes/toDoManager';

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
      setNewToDo({ ...newToDo, [e.target.name]: e.target.value });
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

    // Function to open the edit modal for a to-do
    const openEditToDoModal = (todo: any) => {
      setEditToDo(todo);
      setTimeout(() => {
        (document.getElementById('editToDoId') as HTMLInputElement).value = todo.id || '';
        (document.getElementById('editToDoTitle') as HTMLInputElement).value = todo.title || '';
        (document.getElementById('editToDoDescription') as HTMLTextAreaElement).value = todo.description || '';
        (document.getElementById('editToDoStatus') as HTMLSelectElement).value = todo.status || 'Pending';
        (document.getElementById('editToDoPriority') as HTMLSelectElement).value = todo.priority || 'Standard';
        (document.getElementById('editToDoAssignedTo') as HTMLSelectElement).value = todo.assigned_to || '';
        (document.getElementById('editToDoCreatedBy') as HTMLSelectElement).value = todo.created_by || '';
        (document.getElementById('editToDoStartDate') as HTMLInputElement).value = todo.start_date || '';
        (document.getElementById('editToDoUpdatedAt') as HTMLInputElement).value = todo.updated_at || '';
        (document.getElementById('editToDoEstimatedHours') as HTMLInputElement).value = todo.estimated_hours || '';
        (document.getElementById('editToDoActualHours') as HTMLInputElement).value = todo.actual_hours || '';
        (document.getElementById('editToDoDueDate') as HTMLInputElement).value = todo.due_date || '';
        (document.getElementById('editToDoDependencies') as HTMLSelectElement).value = todo.dependencies || '';
        (document.getElementById('editToDoComments') as HTMLTextAreaElement).value = todo.comments || '';
        const modal = document.getElementById('editToDoModal') as HTMLDialogElement | null;
        if (modal) modal.showModal();
      }, 0);
    };

    // Handler for editing a to-do
    const handleEditToDoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const id = (form.elements.namedItem('editToDoId') as HTMLInputElement).value;
      // Update the to-do in all projects
      props.projectsManager.list.forEach(project => {
        if (project.toDos) {
          project.toDos.forEach(td => {
            if (td.id === id) {
              td.title = (form.elements.namedItem('toDoTitle') as HTMLInputElement).value;
              td.description = (form.elements.namedItem('toDoDescription') as HTMLTextAreaElement).value;
              td.status = (form.elements.namedItem('toDoStatus') as HTMLSelectElement).value as any;
              td.priority = (form.elements.namedItem('toDoPriority') as HTMLSelectElement).value as any;
              td.assigned_to = (form.elements.namedItem('edittoDoAssignedTo') as HTMLSelectElement).value;
              td.created_by = (form.elements.namedItem('edittoDoCreatedBy') as HTMLSelectElement).value;
              td.start_date = (form.elements.namedItem('editToDoStartDate') as HTMLInputElement).value;
              td.updated_at = (form.elements.namedItem('editToDoUpdatedAt') as HTMLInputElement).value;
              td.estimated_hours = parseFloat((form.elements.namedItem('editToDoEstimatedHours') as HTMLInputElement).value) || 0;
              td.actual_hours = parseFloat((form.elements.namedItem('editToDoActualHours') as HTMLInputElement).value) || 0;
              td.due_date = (form.elements.namedItem('editToDoDueDate') as HTMLInputElement).value;
              const depVal = (form.elements.namedItem('editToDoDependencies') as HTMLSelectElement).value;
              td.dependencies = depVal ? depVal.split(',').map(s => s.trim()) : [];
              const commentsVal = (form.elements.namedItem('editToDoComments') as HTMLTextAreaElement).value;
              td.comments = commentsVal ? [commentsVal] : [];
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

    // Function to open the new to-do modal for a specific project
    const openNewToDoModal = (project: any) => {
      setNewToDoProject(project);
      setTimeout(() => {
        (document.getElementById('toDoProject') as HTMLInputElement).value = project.id || '';
        const modal = document.getElementById('newToDoModal') as HTMLDialogElement | null;
        if (modal) modal.showModal();
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

    return (
      <div className="page" id="toDoPage" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <h2 style={{margin: "20px 0"}}>All To-Dos by Project</h2>
        {props.projectsManager.list.map(project => (
          <div key={project.id} style={{marginBottom: 32, background: "#222", borderRadius: 8, padding: 16}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 12}}>
              <h3 style={{color: "#fff", margin: 0, marginRight: 16}}>{project.name}</h3>
              <button
                className="buttonTertiary"
                style={{marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 6, background: '#444', color: '#fff', border: 'none', cursor: 'pointer'}}
                onClick={() => openNewToDoModal(project)}
              >
                + Add To-Do
              </button>
            </div>
            {(!project.toDos || project.toDos.length === 0) ? (
              <div style={{color: "#aaa"}}>No to-dos for this project.</div>
            ) : (
              project.toDos.map(todo => {
                let bgColor = '#222';
                switch (todo.status) {
                  case 'Pending': bgColor = '#969697'; break;
                  case 'In Progress': bgColor = '#FFA500'; break;
                  case 'Completed': bgColor = '#4CAF50'; break;
                  case 'On Hold': bgColor = '#E57373'; break;
                  default: bgColor = '#222';
                }
                return (
                  <div
                    key={todo.id}
                    className="todoItem"
                    style={{
                      background: bgColor,
                      color: '#fff',
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 8,
                      cursor: 'pointer'
                    }}
                    onClick={() => openEditToDoModal(todo)}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{display: 'flex', columnGap: 15, alignItems: 'center'}}>
                        <span className="material-icons-round" style={{
                          backgroundColor: '#969696',
                          padding: 8,
                          borderRadius: 8,
                          aspectRatio: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>construction</span>
                        <p style={{margin: 0}}>{todo.title}</p>
                      </div>
                      <p style={{whiteSpace: 'nowrap', marginLeft: 10}}>{todo.due_date}</p>
                    </div>
                    <div style={{fontSize: 12, color: '#bbb', marginTop: 4}}>{todo.description}</div>
                  </div>
                );
              })
            )}
          </div>
        ))}
        {/* Edit To-Do Modal */}
        <dialog id="editToDoModal">
          <form className="toDoForm" id="editToDoForm" onSubmit={handleEditToDoSubmit}>
            <input type="hidden" id="editToDoId" name="editToDoId" />
            <div className="userCard">
              <div className="formGrid">
                <div className="formColumn">
                  <h2 style={{ margin: 0 }}>
                    Edit Task
                    {editToDo && props.projectsManager.findProjectById(editToDo.project_id) && (
                      <span style={{ display: 'block', fontSize: 16, color: '#888', marginTop: 4 }}>
                        for <b>{props.projectsManager.findProjectById(editToDo.project_id)?.name}</b>
                      </span>
                    )}
                  </h2>
                  <div className="formFieldContainerToDo">
                    <label>
                      <span className="material-icons-round">apartment</span>Title
                    </label>
                    <input name="toDoTitle" type="text" id="editToDoTitle" />
                    <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
                      TIP give it a short title
                    </label>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">subject</span>Description
                    </label>
                    <textarea
                      name="toDoDescription"
                      cols={30}
                      rows={5}
                      placeholder="Give your project a nice description!"
                      id="editToDoDescription"
                      defaultValue={""}
                    />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Status
                    </label>
                    <select name="toDoStatus" id="editToDoStatus">
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>On Hold</option>
                    </select>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Priority
                    </label>
                    <select name="toDoPriority" id="editToDoPriority">
                      <option>High</option>
                      <option>Standard</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                <div className="formColumn">
                  <div className="formFieldContainerToDo">
                    <h2 data-project-info="toDoProjectName" style={{ margin: 0 }}>
                      Project Name
                    </h2>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Responsible Person
                    </label>
                    <select name="edittoDoAssignedTo" id="editToDoAssignedTo">
                      {/* Options will be dynamically populated */}
                    </select>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Created By
                    </label>
                    <select name="edittoDoCreatedBy" id="editToDoCreatedBy">
                      {/* Options will be dynamically populated */}
                    </select>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_today</span>
                      To-Do start date
                    </label>
                    <input name="editToDoStartDate" type="date" id="editToDoStartDate" />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_month</span>
                      To-Do last update date
                    </label>
                    <input name="editToDoUpdatedAt" type="date" id="editToDoUpdatedAt" />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">paid</span>Estimated hours
                    </label>
                    <input name="editToDoEstimatedHours" type="number" placeholder="Estimated hours for the project" id="editToDoEstimatedHours" />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">paid</span>Actual hours
                    </label>
                    <input name="editToDoActualHours" type="number" placeholder="Hours used so far" id="editToDoActualHours" />
                  </div>
                </div>
              </div>
              <div className="separator-horizontal" />
              <div className="formGrid">
                <div className="formColumn">
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_month</span>Due Date
                    </label>
                    <input name="editToDoDueDate" type="date" id="editToDoDueDate" />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_month</span>Start Date
                    </label>
                    <input name="editToDoStartDate" type="date" id="editToDoStartDate" />
                  </div>
                </div>
                <div className="formColumn">
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Dependencies
                    </label>
                    <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
                      Select the tasks this project is dependent on
                    </label>
                    <select name="editToDoDependencies" id="editToDoDependencies">
                      <option>You</option>
                      <option>Standard</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="separator-horizontal" />
              <div className="formFieldContainer">
                <label>
                  <span className="material-icons-round">subject</span>Comments
                </label>
                <textarea
                  name="editToDoComments"
                  cols={30}
                  rows={5}
                  placeholder="Add any clarification comment"
                  id="editToDoComments"
                  defaultValue={""}
                />
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
        <dialog id="newToDoModal">
          <form className="toDoForm" id="newToDoForm" onSubmit={handleNewToDoSubmit}>
            <input type="hidden" id="toDoProject" name="toDoProject" />
            <div className="userCard">
              <div className="formGrid">
                <div className="formColumn">
                  <h2 style={{ margin: 0 }}>New Task</h2>
                  <div className="formFieldContainerToDo">
                    <label>
                      <span className="material-icons-round">apartment</span>Title
                    </label>
                    <input name="title" type="text" id="newToDoTitle" value={newToDo.title} onChange={handleNewToDoChange} />
                    <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
                      TIP give it a short title
                    </label>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">subject</span>Description
                    </label>
                    <textarea
                      name="description"
                      cols={30}
                      rows={5}
                      placeholder="Give your project a nice description!"
                      id="newToDoDescription"
                      value={newToDo.description}
                      onChange={handleNewToDoChange}
                    />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Status
                    </label>
                    <select name="status" id="newToDoStatus" value={newToDo.status} onChange={handleNewToDoChange}>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>On Hold</option>
                    </select>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Priority
                    </label>
                    <select name="priority" id="newToDoPriority" value={newToDo.priority} onChange={handleNewToDoChange}>
                      <option>High</option>
                      <option>Standard</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                <div className="formColumn">
                  <div className="formFieldContainerToDo">
                    <h2 data-project-info="toDoProjectName" style={{ margin: 0 }}>
                      Project Name
                    </h2>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Responsible Person
                    </label>
                    <select name="assigned_to" id="newToDoAssignedTo" value={newToDo.assigned_to} onChange={handleNewToDoChange}>
                      {/* Options will be dynamically populated */}
                    </select>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Created By
                    </label>
                    <select name="created_by" id="newToDoCreatedBy" value={newToDo.created_by} onChange={handleNewToDoChange}>
                      {/* Options will be dynamically populated */}
                    </select>
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_today</span>
                      To-Do start date
                    </label>
                    <input name="start_date" type="date" id="newToDoStartDate" value={newToDo.start_date} onChange={handleNewToDoChange} />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_month</span>
                      To-Do last update date
                    </label>
                    <input name="updated_at" type="date" id="newToDoUpdatedAt" value={newToDo.updated_at} onChange={handleNewToDoChange} />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">paid</span>Estimated hours
                    </label>
                    <input name="estimated_hours" type="number" placeholder="Estimated hours for the project" id="newToDoEstimatedHours" value={newToDo.estimated_hours} onChange={handleNewToDoChange} />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">paid</span>Actual hours
                    </label>
                    <input name="actual_hours" type="number" placeholder="Hours used so far" id="newToDoActualHours" value={newToDo.actual_hours} onChange={handleNewToDoChange} />
                  </div>
                </div>
              </div>
              <div className="separator-horizontal" />
              <div className="formGrid">
                <div className="formColumn">
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_month</span>Due Date
                    </label>
                    <input name="due_date" type="date" id="newToDoDueDate" value={newToDo.due_date} onChange={handleNewToDoChange} />
                  </div>
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">calendar_month</span>Start Date
                    </label>
                    <input name="start_date" type="date" id="newToDoStartDate" value={newToDo.start_date} onChange={handleNewToDoChange} />
                  </div>
                </div>
                <div className="formColumn">
                  <div className="formFieldContainer">
                    <label>
                      <span className="material-icons-round">not_listed_location</span>
                      Dependencies
                    </label>
                    <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
                      Select the tasks this project is dependent on
                    </label>
                    <select name="dependencies" id="newToDoDependencies" value={newToDo.dependencies} onChange={handleNewToDoChange}>
                      <option>You</option>
                      <option>Standard</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="separator-horizontal" />
              <div className="formFieldContainer">
                <label>
                  <span className="material-icons-round">subject</span>Comments
                </label>
                <textarea
                  name="comments"
                  cols={30}
                  rows={5}
                  placeholder="Add any clarification comment"
                  id="newToDoComments"
                  value={newToDo.comments}
                  onChange={handleNewToDoChange}
                />
              </div>
            </div>
            <div className="cancelAccept">
              <button type="button" className="cancelButton" onClick={() => closeModal('newToDoModal')}>
                Cancel
              </button>
              <button type="submit" className="acceptButton" id="submitNewToDoButton">
                Create Task
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