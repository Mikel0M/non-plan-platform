import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import * as Router from 'react-router-dom';
import { toDoManager } from '../classes/toDoManager';

interface Props {
    projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
    // Helper to close modals by id
    const closeModal = (id: string) => {
        const modal = document.getElementById(id) as HTMLDialogElement | null;
        if (modal) modal.close();
    };
    const routeParams = Router.useParams<{ id: string }>();
    console.log("ProjectDetailsPage routeParams:", routeParams.id);
    const { id } = useParams();
    // Ensure id is a string before using it
    const [projectState, setProjectState] = React.useState(id ? props.projectsManager.getProject(id) : undefined);
    React.useEffect(() => {
      props.projectsManager.setChangeButton();
      setProjectState(id ? props.projectsManager.getProject(id) : undefined);
    }, [props.projectsManager, id]);
    if (!projectState) {
      return <div>Project not found.</div>;
    }

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

    // When opening the modal, set edit states
    const openEditModal = () => {
      setEditName(projectState.name || "");
      setEditDescription(projectState.description || "");
      setEditLocation(projectState.location || "");
      setEditProgress(projectState.progress?.toString() || "");
      setEditCost(projectState.cost?.toString() || "");
      setEditUserRole(projectState.userRole || "");
      setEditStatus(projectState.status || "");
      setEditPhase(projectState.phase || "");
      setEditStartDate(projectState.startDate || "");
      setEditFinishDate(projectState.finishDate || "");
      const modal = document.getElementById('editProjectModal') as HTMLDialogElement | null;
      if (modal) modal.showModal();
    };

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
        dependencies: [],
        progress_percentage: '25%' as const,
        comments: [],
      };
      projectState.addToDo(toDoObj);
      setToDos([...projectState.toDos]);
      setNewToDo({
        title: '', description: '', status: 'Pending', priority: 'Standard', assigned_to: '', created_by: '', due_date: '', start_date: '', estimated_hours: '', actual_hours: ''
      });
      closeModal('newToDoModal');
    };

    // Handler for editing a to-do
    const handleEditToDoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const id = (form.elements.namedItem('editToDoId') as HTMLInputElement).value;
      // Find the to-do instance
      let updatedToDos = toDos.map(td => {
        if (td.id === id) {
          td.title = (form.elements.namedItem('toDoTitle') as HTMLInputElement).value;
          td.description = (form.elements.namedItem('toDoDescription') as HTMLTextAreaElement).value;
          td.status = (form.elements.namedItem('toDoStatus') as HTMLSelectElement).value as any; // toDoStatus
          td.priority = (form.elements.namedItem('toDoPriority') as HTMLSelectElement).value as any; // toDoPriority
          td.assigned_to = (form.elements.namedItem('edittoDoAssignedTo') as HTMLSelectElement).value;
          td.created_by = (form.elements.namedItem('edittoDoCreatedBy') as HTMLSelectElement).value;
          td.start_date = (form.elements.namedItem('editToDoStartDate') as HTMLInputElement).value;
          td.updated_at = (form.elements.namedItem('editToDoUpdatedAt') as HTMLInputElement).value;
          td.estimated_hours = parseFloat((form.elements.namedItem('editToDoEstimatedHours') as HTMLInputElement).value) || 0;
          td.actual_hours = parseFloat((form.elements.namedItem('editToDoActualHours') as HTMLInputElement).value) || 0;
          td.due_date = (form.elements.namedItem('editToDoDueDate') as HTMLInputElement).value;
          // For dependencies and comments, if your model expects arrays, split by comma, else keep as string
          const depVal = (form.elements.namedItem('editToDoDependencies') as HTMLSelectElement).value;
          td.dependencies = depVal ? depVal.split(',').map(s => s.trim()) : [];
          const commentsVal = (form.elements.namedItem('editToDoComments') as HTMLTextAreaElement).value;
          td.comments = commentsVal ? [commentsVal] : [];
        }
        return td;
      });
      setToDos(updatedToDos);
      // Also update in projectState.toDos if needed
      if (projectState && projectState.toDos) {
        projectState.toDos.forEach(td => {
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
      closeModal('editToDoModal');
    };

    return (
    <div className="page" id="projectDetails" style={{ display: "flex" }}>
        <dialog id="DeleteProjectModal">
            <form className="userForm" id="DeleteNewUserForm">
                <h2>Are you sure you want to delete the project?</h2>
                <div className="cancelAccept">
                    <button
                        type="button"
                        className="cancelButton"
                        onClick={() => closeModal('DeleteProjectModal')}>Cancel
                    </button>
                    <button type="button" className="acceptButton" id="ConfirmDeleteButton">Delete</button>
                </div>
            </form>
        </dialog>
        <dialog id="editProjectModal">
            <form className="userForm" id="editProjectForm" onSubmit={e => {
                e.preventDefault();
                if (projectState) {
                  projectState.name = editName;
                  projectState.description = editDescription;
                  projectState.location = editLocation;
                  projectState.progress = parseFloat(editProgress) || 0;
                  projectState.cost = parseFloat(editCost) || 0;
                  projectState.userRole = editUserRole as any;
                  projectState.status = editStatus as any;
                  projectState.phase = editPhase as any;
                  projectState.startDate = editStartDate;
                  projectState.finishDate = editFinishDate;
                  setProjectState(projectState); // trigger re-render
                  // Create a new instance to trigger React re-render
                  const updated = Object.assign(Object.create(Object.getPrototypeOf(projectState)), projectState);
                  setProjectState(updated);
                  if (props.projectsManager.updateProjectCards) {
                    props.projectsManager.updateProjectCards(projectState);
                  }
                }
                closeModal('editProjectModal');
            }}>
                <h2>Edit Project</h2>
                <div className="userCard">
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">apartment</span>Name
          </label>
          <input name="name" type="text" id="projectNameInput" value={editName} onChange={e => setEditName(e.target.value)} />
          <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            TIP give it a short name
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
            id="projectDescriptionInput"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
          />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">pin_drop</span>Location
          </label>
          <input
            name="location"
            type="text"
            placeholder="Where is your project located?"
            id="projectLocationInput"
            value={editLocation}
            onChange={e => setEditLocation(e.target.value)}
          />
          <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }} />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">percent</span>Estimated
            progress
          </label>
          <input
            name="progress"
            type="number"
            placeholder="What's the estimated progress of the project?"
            id="projectProgressInput"
            value={editProgress}
            onChange={e => setEditProgress(e.target.value)}
          />
          <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            Estimated cost of the project
          </label>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">paid</span>Estimated cost
          </label>
          <input
            name="cost"
            type="number"
            placeholder="What's the estimated cost of the project?"
            id="projectCostInput"
            value={editCost}
            onChange={e => setEditCost(e.target.value)}
          />
          <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            Estimated cost of the project
          </label>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">account_circle</span>Role
          </label>
          <select name="userRole" id="projectRoleInput" value={editUserRole} onChange={e => setEditUserRole(e.target.value)}>
            <option>not defined</option>
            <option>Architect</option>
            <option>Engineer</option>
            <option>Developer</option>
          </select>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">not_listed_location</span>
            Status
          </label>
          <select name="status" id="projectStatusInput" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
            <option>Pending</option>
            <option>Active</option>
            <option>Finished</option>
          </select>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">calendar_view_week</span>
            Design Phase
          </label>
          <select name="phase" id="projectPhaseInput" value={editPhase} onChange={e => setEditPhase(e.target.value)}>
            <option>Design</option>
            <option>Construction project</option>
            <option>Execution</option>
            <option>Construction</option>
          </select>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">calendar_today</span>Start
            Date
          </label>
          <input name="startDate" type="date" id="projectStartPDInput" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">calendar_month</span>Finish
            Date
          </label>
          <input name="finishDate" type="date" id="projectFinishPDInput" value={editFinishDate} onChange={e => setEditFinishDate(e.target.value)} />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => closeModal('editProjectModal')}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="acceptButton"
          id="changeProjectButton"
        >
          Change
        </button>
      </div>
    </form>
  </dialog>
  <dialog id="newToDoModal">
    <form className="toDoForm" id="newToDoForm" onSubmit={handleNewToDoSubmit}>
      <input type="hidden" name="toDoProject" id="toDoProject" />
      <div className="userCard">
        <div className="formGrid">
          <div className="formColumn">
            <h2 style={{ margin: 0 }}>Add a Task</h2>
            <div className="formFieldContainerToDo">
              <label>
                <span className="material-icons-round">apartment</span>Title
              </label>
              <input name="title" type="text" id="toDoTitle" value={newToDo.title} onChange={handleNewToDoChange} />
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
                id="toDoDescription"
                value={newToDo.description}
                onChange={handleNewToDoChange}
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">not_listed_location</span>
                Status
              </label>
              <select name="status" id="toDoStatus" value={newToDo.status} onChange={handleNewToDoChange}>
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
              <select name="priority" id="toDoPriority" value={newToDo.priority} onChange={handleNewToDoChange}>
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
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Responsible Person
              </label>
              <select name="toDoAssignedTo" id="toDoAssignedTo">
                {/* Options will be dynamically populated */}
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Created By
              </label>
              <select name="toDoCreatedBy" id="toDoCreatedBy">
                {/* Options will be dynamically populated */}
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_today</span>
                To-Do start date
              </label>
              <span id="currentDate" className="formatted-date" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                To-Do last update date
              </label>
              <span id="updateDate" className="formatted-date" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Estimated
                hours
              </label>
              <input
                name="toDoEstimatedHours"
                type="number"
                placeholder="What's the estimated cost of the project?"
                id="projectCostInput"
              />
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                Estimated hours for the project
              </label>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Actual hours
              </label>
              <input
                name="toDoActualHours"
                type="number"
                placeholder="What's the estimated cost of the project?"
                id="projectCostInput"
              />
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                hours used so far
              </label>
            </div>
          </div>
        </div>
        <div className="separator-horizontal" />
        <div className="formGrid">
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>Due
                Date
              </label>
              <input name="toDoDueDate" type="date" id="projectFinishPDInput" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                Start Date
              </label>
              <input
                name="toDoStartDate"
                type="date"
                id="projectFinishPDInput"
              />
            </div>
          </div>
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Dependancies
              </label>
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                select the tasks this project is dependant of
              </label>
              <select name="status" id="toDoPriority">
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
            name="toDoComments"
            cols={30}
            rows={5}
            placeholder="Add any clarification comment"
            id="projectDescriptionInput"
            defaultValue={""}
          />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => closeModal('newToDoModal')}
        >
          Cancel
        </button>
        <button type="submit" className="acceptButton" id="submitToDoButton">
          Accept
        </button>
      </div>
    </form>
  </dialog>
  <dialog id="editToDoModal">
    <form className="toDoForm" id="editToDoForm" onSubmit={handleEditToDoSubmit}>
      <input type="hidden" id="editToDoId" name="editToDoId" />
      {/* Other form fields... */}
      <div className="userCard">
        <div className="formGrid">
          <div className="formColumn">
            <h2 style={{ margin: 0 }}>Edit Task</h2>
            <div className="formFieldContainerToDo">
              <label>
                <span className="material-icons-round">apartment</span>Title
              </label>
              <input name="toDoTitle" type="text" id="editToDoTitle" />
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
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
                <span className="material-icons-round">
                  not_listed_location
                </span>
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
                <span className="material-icons-round">
                  not_listed_location
                </span>
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
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Responsible Person
              </label>
              <select name="edittoDoAssignedTo" id="editToDoAssignedTo">
                {/* Options will be dynamically populated */}
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
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
              <input
                name="editToDoStartDate"
                type="date"
                id="editToDoStartDate"
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                To-Do last update date
              </label>
              <input
                name="editToDoUpdatedAt"
                type="date"
                id="editToDoUpdatedAt"
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Estimated
                hours
              </label>
              <input
                name="editToDoEstimatedHours"
                type="number"
                placeholder="Estimated hours for the project"
                id="editToDoEstimatedHours"
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Actual hours
              </label>
              <input
                name="editToDoActualHours"
                type="number"
                placeholder="Hours used so far"
                id="editToDoActualHours"
              />
            </div>
          </div>
        </div>
        <div className="separator-horizontal" />
        <div className="formGrid">
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>Due
                Date
              </label>
              <input name="editToDoDueDate" type="date" id="editToDoDueDate" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                Start Date
              </label>
              <input
                name="editToDoStartDate"
                type="date"
                id="editToDoStartDate"
              />
            </div>
          </div>
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Dependencies
              </label>
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
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
        <button
          type="button"
          className="deleteButton"
          onClick={() => closeModal('editToDoModal')}
        >
          Delete
        </button>
        <button
          type="button"
          className="cancelButton"
          onClick={() => closeModal('editToDoModal')}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="acceptButton"
          id="submitEditToDoButton"
        >
          Accept
        </button>
      </div>
    </form>
  </dialog>
  <div className="mainPageContent">
    <div style={{ display: "flex", flexDirection: "column", rowGap: 10 }}>
      <div className="dashboardCard">
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
          <div style={{ display: "flex", flexDirection: "row", gap: 20 }}>
            <button
              id="editProject"
              className="buttonSecondary"
              onClick={openEditModal}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 100,
                height: 40,
                fontSize: "var(--fontSizeStandard)"
              }}
            >
              Edit
            </button>
            <button
              id="deleteProjectBtn"
              className="buttonSecondary"
              onClick={() => {
                const modal = document.getElementById('DeleteProjectModal') as HTMLDialogElement | null;
                if (modal) modal.showModal();
              }
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 100,
                height: 40,
                fontSize: "var(--fontSizeStandard)"
              }}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="middleDashboard">
          <h5 data-project-info="nameBigPD">{projectState.name}</h5>
          <p data-project-info="descriptionPD">
            {projectState.description || "No description provided."}
          </p>
        </div>
        <div className="bottomDashboard">
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Status
            </p>
            <p data-project-info="statusPD">{projectState.status || "No status provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Cost
            </p>
            <p data-project-info="costPD">{projectState.cost || "No cost provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Role
            </p>
            <p data-project-info="rolePD">{projectState.userRole || "No role provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Start Date
            </p>
            <p data-project-info="startPD">{projectState.startDate || "No start date provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Finish Date
            </p>
            <p data-project-info="finishPD">{projectState.finishDate || "No finish date provided."}</p>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#404040",
            width: "calc(100% - 40px)",
            height: 25,
            borderRadius: 50,
            overflow: "hidden",
            margin: "20px auto 30px auto",
            position: "relative"
          }}
        >
          <div
            id="percentageDiv"
            style={{
              width: `${projectState.progress ?? 0}%`,
              height: "100%",
              backgroundColor: (projectState.progress ?? 0) >= 50 ? "green" : "orange",
              borderRadius: "10px 0 0 10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              color: "white",
              fontWeight: "bold",
              transition: "width 0.5s"
            }}
          >
            <span
              id="progressText"
              style={{
                position: "absolute",
                width: "100%",
                textAlign: "center",
                left: 0
              }}
            >
              {projectState.progress ?? 0}%
            </span>
          </div>
        </div>
      </div>
      <div className="dashboardCard" style={{ flexGrow: 1 }}>
        <div
          id="toDoList"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            padding: 20
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <h4>To-Do</h4>
            <div
              style={{ display: "flex", alignItems: "center", paddingLeft: 80 }}
            >
              <span
                className="material-icons-round"
                style={{ paddingRight: 10 }}
              >
                search
              </span>
              <input
                type="text"
                style={{ fontSize: "var(--fontSizeSmall)" }}
                placeholder="Search To-Do's by name"
              />
            </div>
            <button id="newToDoBtn" className="buttonTertiary" onClick={() => {
  const modal = document.getElementById('newToDoModal') as HTMLDialogElement | null;
  if (modal) modal.showModal();
}}>
              <span className="material-icons-round">add</span>
            </button>
          </div>
          {/* To-Do List Container */}
          <div
            id="toDoListContainer"
            ref={toDoListContainerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: 10,
              marginTop: 20
            }}
          >
            {/* Render To-Do list items reactively */}
            {toDos.length === 0 && <div style={{color: '#aaa'}}>No to-dos for this project.</div>}
            {toDos.map((todo, idx) => {
  let bgColor = '#222';
  switch (todo.status) {
    case 'Pending': bgColor = '#969697'; break;
    case 'In Progress': bgColor = '#FFA500'; break;
    case 'Completed': bgColor = '#4CAF50'; break;
    case 'On Hold': bgColor = '#E57373'; break;
    default: bgColor = '#222';
  }
  const handleEditToDo = () => {
    // Fill the edit modal fields with the selected to-do's data
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
    // Open the modal
    const modal = document.getElementById('editToDoModal') as HTMLDialogElement | null;
    if (modal) modal.showModal();
  };
  return (
    <div key={todo.id || idx} className="todoItem" style={{background: bgColor, color: '#fff', padding: 10, borderRadius: 8, marginBottom: 5, cursor: 'pointer'}} onClick={handleEditToDo}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', columnGap: 15, alignItems: 'center'}}>
          <span className="material-icons-round" style={{backgroundColor: '#969696', padding: 8, borderRadius: 8, aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>construction</span>
          <p style={{margin: 0}}>{todo.title}</p>
        </div>
        <p style={{whiteSpace: 'nowrap', marginLeft: 10}}>{todo.due_date}</p>
      </div>
      <div style={{fontSize: 12, color: '#bbb', marginTop: 4}}>{todo.description}</div>
    </div>
  );
})}
          </div>
        </div>
      </div>
    </div>
    <div
      id="viewerContainer"
      className="dashboardCard"
      style={{ minWidth: 0, minHeight: 700, maxHeight: 700 }}
    />
  </div>
</div>
)
}