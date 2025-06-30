import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import * as Router from 'react-router-dom';
import { toDoManager } from '../classes/toDoManager';
import { usersManagerInstance } from '../classes/UsersManager';
import { useTranslation } from "./LanguageContext";
import { SearchBox } from './SearchBox';
import { Calendar } from './Calendar';

interface Props {

    projectsManager: ProjectsManager
    toDoManager: toDoManager;
}

export function ToDoPage(props: Props) {
    const { t } = useTranslation();
    // Remove searchQuery state and all project filtering by name
    // const [searchQuery, setSearchQuery] = React.useState("");
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
      dependencies: [] as unknown as string[], // comma-separated string for input
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
        dependencies: Array.isArray(newToDo.dependencies) ? newToDo.dependencies : (typeof newToDo.dependencies === 'string' && (newToDo.dependencies as string) ? (newToDo.dependencies as string).split(',').map(s => s.trim()) : []),
        progress_percentage: '25%' as const,
        comments: newToDo.comments ? [newToDo.comments] : [],
      };
      project.addToDo(toDoObj);
      setToDos([...project.toDos]);
      setNewToDo({
        title: '', description: '', status: 'Pending', priority: 'Standard', assigned_to: '', created_by: '', due_date: '', start_date: '', estimated_hours: '', actual_hours: '', updated_at: '', dependencies: '' as unknown as string[], comments: ''
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
      dependencies: [] as unknown as string[],
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
              td.dependencies = editToDoFields.dependencies || [];
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
    const getAssignedUsers = (project: any) => {
      if (!project || !project.assignedUsers) return [];
      return project.assignedUsers
        .map((au: any) => usersManagerInstance.getUsers().find(u => u.id === au.userId))
        .filter(Boolean);
    };

    // State for selected project in dropdown
    const [selectedProjectId, setSelectedProjectId] = React.useState<string>("all");

    // Remove filteredProjects, just use all projects from manager
    const allProjects = props.projectsManager.list;
    // Determine which projects to show based on selector
    const projectsToShow = selectedProjectId === "all"
      ? allProjects
      : allProjects.filter(p => p.id === selectedProjectId);

    // State for per-project task search queries
    const [projectTaskSearch, setProjectTaskSearch] = React.useState<{ [projectId: string]: string }>({});

    // Add state for view mode (list or calendar)
    const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');

    // --- Helper to get all other tasks in the same project (for new/edit modals) ---
    function getOtherTasks(project: any, excludeId: string | null = null) {
      if (!project || !project.toDos) return [];
      return project.toDos.filter((td: any) => excludeId ? td.id !== excludeId : true);
    }

    return (
      <div className="page page-column" id="toDoPage">
        <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
          <button
            className={viewMode === 'list' ? 'tabCircle active' : 'tabCircle'}
            onClick={() => setViewMode('list')}
            type="button"
            title={t("tasks_list_view") || "List View"}
          >
            <span className="material-icons-round">list</span>
          </button>
          <button
            className={viewMode === 'calendar' ? 'tabCircle active' : 'tabCircle'}
            onClick={() => setViewMode('calendar')}
            type="button"
            title={t("tasks_calendar_view") || "Calendar View"}
          >
            <span className="material-icons-round">calendar_month</span>
          </button>
        </div>
        {viewMode === 'list' && (
          <div className="todo-cards-list" style={{ gap: '10px' }}>
            {/* Project selector dropdown */}
            <div style={{ margin: '16px 0' }}>
              <label htmlFor="projectSelector" style={{ marginRight: 8 }}>{t("projects_select_project") || "Select Project:"}</label>
              <select
                id="projectSelector"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 4 }}
              >
                <option value="all">{t("projects_all_projects") || "All Projects"}</option>
                {allProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            {projectsToShow.map(project => {
              // Get the search query for this project (for its tasks)
              const taskSearch = projectTaskSearch[project.id] || "";
              // Filter this project's toDos by title (case-insensitive)
              const filteredToDos = (project.toDos || []).filter(td =>
                td.title && td.title.toLowerCase().includes(taskSearch.toLowerCase())
              );
              return (
                <div key={project.id} className="todo-card">
                  <div className="todo-card-header">
                    <h3 className="todo-card-title">{project.name}</h3>
                    {/* Per-project task search */}
                    <SearchBox
                      value={taskSearch}
                      onValueChange={q => setProjectTaskSearch(prev => ({ ...prev, [project.id]: q }))}
                      placeholder={t("search_tasks") || "Search for tasks"}
                    />
                    <button
                      className="buttonTertiary todo-add-btn"
                      onClick={() => openNewToDoModal(project)}
                      title={t("projects_add_task") || "Add To-Do"}
                    >
                      <span className="material-icons-round">add</span>
                      <span className="material-icons-round">check_circle</span>
                    </button>
                  </div>
                  {/* Header row for task columns */}
                  <div className="todo-items-header">
                    <span></span>
                    <span className="todo-header-label">{t("projects_title")}</span>
                    <span className="todo-header-label">{t("projects_priority") || "Priority"}</span>
                    <span className="todo-header-label">{t("projects_responsible_person") || "Responsible Person"}</span>
                    <span className="todo-header-label">{t("projects_due_date") || "Due Date"}</span>
                    <span></span>
                  </div>
                  {filteredToDos.length === 0 ? (
                    <div className="todo-empty">
                      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 16, color: '#888' }}>
                        There are no tasks to display!
                      </p>
                    </div>
                  ) : (
                    <div className="todo-tasks-list">
                      {filteredToDos.map(todo => {
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
                            <span className="todo-task-value">{t(`projects_priority_${todo.priority?.toLowerCase()}`) || todo.priority}</span>
                            <span className="todo-task-value">{assignedUser ? `${assignedUser.name} ${assignedUser.surname}` : ''}</span>
                            <span className="todo-task-value">{todo.due_date}</span>
                            <span className="todo-task-delete">
                              <button
                                className="buttonTertiary"
                                style={{background: '#FC3140', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8, justifySelf: 'end'}}
                                title={t("projects_delete") || "Delete task"}
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
              );
            })}
          </div>
        )}
        {viewMode === 'calendar' && (
          <div className="dashboardCard calendar-fixed-size">
            {/* Project selector dropdown (same as in list view) */}
            <div className="calendar-project-selector">
              <label htmlFor="calendarProjectSelector" style={{ marginRight: 8 }}>{t("projects_select_project") || "Select Project:"}</label>
              <select
                id="calendarProjectSelector"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 4 }}
              >
                <option value="all">{t("projects_all_projects") || "All Projects"}</option>
                {allProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div className="calendar-header-spacer" />
            <div className="calendar-scroll-vertical">
              <Calendar
                tasks={(() => {
                  if (selectedProjectId === 'all') {
                    return allProjects.flatMap(p => (p.toDos || []).map(td => ({
                      id: td.id,
                      title: td.title,
                      startDate: td.start_date,
                      dueDate: td.due_date,
                      completed: td.status === "Completed",
                      projectId: p.id,
                      color: p.color,
                      assignedTo: td.assigned_to,
                      projectName: p.name,
                      rawToDo: td
                    })));
                  } else {
                    const project = allProjects.find(p => p.id === selectedProjectId);
                    return (project?.toDos || []).map(td => ({
                      id: td.id,
                      title: td.title,
                      startDate: td.start_date,
                      dueDate: td.due_date,
                      completed: td.status === "Completed",
                      projectId: project?.id,
                      color: project?.color,
                      assignedTo: td.assigned_to,
                      projectName: project?.name,
                      rawToDo: td
                    }));
                  }
                })()}
                start={(() => {
                  const tasks = selectedProjectId === 'all'
                    ? allProjects.flatMap(p => p.toDos || [])
                    : (allProjects.find(p => p.id === selectedProjectId)?.toDos || []);
                  const dates = tasks.flatMap(td => [td.start_date, td.due_date].filter(Boolean).map(d => new Date(d)));
                  if (!dates.length) return '2025-01-01';
                  return dates.reduce((min, d) => d < min ? d : min, dates[0]).toISOString().slice(0, 10);
                })()}
                end={(() => {
                  const tasks = selectedProjectId === 'all'
                    ? allProjects.flatMap(p => p.toDos || [])
                    : (allProjects.find(p => p.id === selectedProjectId)?.toDos || []);
                  const dates = tasks.flatMap(td => [td.start_date, td.due_date].filter(Boolean).map(d => new Date(d)));
                  if (!dates.length) return '2025-12-31';
                  return dates.reduce((max, d) => d > max ? d : max, dates[0]).toISOString().slice(0, 10);
                })()}
                onEditTask={task => openEditToDoModal(task.rawToDo)}
              />
            </div>
          </div>
        )}

        {/* Edit To-Do Modal */}
        <dialog id="editToDoModal">
          <form className="userForm form-wide" id="editToDoForm" onSubmit={handleEditToDoSubmit}>
            <input type="hidden" id="editToDoId" name="id" value={editToDoFields.id} />
            <h2>{t("projects_edit_task") || "Edit Task"}</h2>
            <div className="userCard">
              <div className="formFieldContainer">
                <label><span className="material-icons-round">apartment</span>{t("projects_title") || "Title"}</label>
                <input name="title" type="text" id="editToDoTitle" value={editToDoFields.title} onChange={handleEditToDoChange} />
                <label className="label-tip">{t("projects_tip_short_title") || "TIP give it a short title"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>{t("projects_description") || "Description"}</label>
                <textarea name="description" cols={30} rows={5} placeholder={t("projects_description_placeholder") || "Description"} id="editToDoDescription" value={editToDoFields.description} onChange={handleEditToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_status") || "Status"}</label>
                <select name="status" id="editToDoStatus" value={editToDoFields.status} onChange={handleEditToDoChange}>
                  <option>{t("projects_status_pending") || "Pending"}</option>
                  <option>{t("projects_status_active") || "In Progress"}</option>
                  <option>{t("projects_status_finished") || "Completed"}</option>
                  <option>{t("projects_status_onhold") || "On Hold"}</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_priority") || "Priority"}</label>
                <select name="priority" id="editToDoPriority" value={editToDoFields.priority} onChange={handleEditToDoChange}>
                  <option>{t("projects_priority_high") || "High"}</option>
                  <option>{t("projects_priority_standard") || "Standard"}</option>
                  <option>{t("projects_priority_low") || "Low"}</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>{t("projects_estimated_hours") || "Estimated hours"}</label>
                <input name="estimated_hours" type="number" placeholder={t("projects_estimated_hours_placeholder") || "Estimated hours for the task"} id="editToDoEstimatedHours" value={editToDoFields.estimated_hours} onChange={handleEditToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>{t("projects_estimated_hours_tip") || "Estimated hours for the task"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>{t("projects_actual_hours") || "Actual hours"}</label>
                <input name="actual_hours" type="number" placeholder={t("projects_actual_hours_placeholder") || "Hours used so far"} id="editToDoActualHours" value={editToDoFields.actual_hours} onChange={handleEditToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>{t("projects_actual_hours_tip") || "Hours used so far"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_responsible_person") || "Responsible Person"}</label>
                <select name="assigned_to" id="editToDoAssignedTo" value={editToDoFields.assigned_to} onChange={handleEditToDoChange}>
                  <option value="">{t("projects_select_responsible") || "Select responsible person"}</option>
                  {(editToDoProject ? getAssignedUsers(editToDoProject) : []).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_created_by") || "Created By"}</label>
                <select name="created_by" id="editToDoCreatedBy" value={editToDoFields.created_by} onChange={handleEditToDoChange}>
                  <option value="">{t("projects_select_creator") || "Select creator"}</option>
                  {(editToDoProject ? getAssignedUsers(editToDoProject) : []).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}</label>
                <input name="start_date" type="date" id="editToDoStartDate" value={editToDoFields.start_date} onChange={handleEditToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_month</span>{t("projects_due_date") || "Due Date"}</label>
                <input name="due_date" type="date" id="editToDoDueDate" value={editToDoFields.due_date} onChange={handleEditToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">link</span>{t("projects_dependencies") || "Dependencies"}</label>
                <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 4, padding: 8 }}>
                  {getOtherTasks(editToDoProject || projectState, editToDoFields.id || null).map(td => (
                    <label key={td.id} style={{ display: 'block', marginBottom: 4 }}>
                      <input
                        type="checkbox"
                        value={td.id}
                        checked={Array.isArray(editToDoFields.dependencies) ? editToDoFields.dependencies.includes(td.id) : false}
                        onChange={e => {
                          const checked = e.target.checked;
                          setEditToDoFields(prev => {
                            let deps = Array.isArray(prev.dependencies) ? [...prev.dependencies] : [];
                            if (checked) {
                              if (!deps.includes(td.id)) deps.push(td.id);
                            } else {
                              deps = deps.filter(id => id !== td.id);
                            }
                            return { ...prev, dependencies: deps };
                          });
                        }}
                      />
                      {td.title}
                    </label>
                  ))}
                </div>
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>{t("projects_dependencies_tip") || "Select related tasks"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>{t("projects_comments") || "Comments"}</label>
                <textarea name="comments" cols={30} rows={5} placeholder={t("projects_comments_placeholder") || "Add any clarification comment"} id="editToDoComments" value={editToDoFields.comments} onChange={handleEditToDoChange} />
              </div>
            </div>
            <div className="cancelAccept">
              <button type="button" className="cancelButton" onClick={() => closeModal('editToDoModal')}>
                {t("projects_cancel") || "Cancel"}
              </button>
              <button type="submit" className="acceptButton" id="submitEditToDoButton">
                {t("projects_accept") || "Accept"}
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
                {t("projects_delete") || "Delete"}
              </button>
            </div>
          </form>
        </dialog>

        {/* New To-Do Modal */}
        <dialog id="newToDoModal" ref={newToDoModalRef}>
          <form className="userForm form-wide" id="newToDoForm" onSubmit={handleNewToDoSubmit}>
            <h2>{t("projects_add_task") || "New Task"}</h2>
            <div className="userCard">
              <div className="formFieldContainer">
                <label><span className="material-icons-round">apartment</span>{t("projects_title") || "Title"}</label>
                <input name="title" type="text" id="newToDoTitle" value={newToDo.title} onChange={handleNewToDoChange} />
                <label className="label-tip">{t("projects_tip_short_title") || "TIP give it a short title"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>{t("projects_description") || "Description"}</label>
                <textarea name="description" cols={30} rows={5} placeholder={t("projects_description_placeholder") || "Description"} id="newToDoDescription" value={newToDo.description} onChange={handleNewToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_status") || "Status"}</label>
                <select name="status" id="newToDoStatus" value={newToDo.status} onChange={handleNewToDoChange}>
                  <option>{t("projects_status_pending") || "Pending"}</option>
                  <option>{t("projects_status_active") || "In Progress"}</option>
                  <option>{t("projects_status_finished") || "Completed"}</option>
                  <option>{t("projects_status_onhold") || "On Hold"}</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_priority") || "Priority"}</label>
                <select name="priority" id="newToDoPriority" value={newToDo.priority} onChange={handleNewToDoChange}>
                  <option>{t("projects_priority_high") || "High"}</option>
                  <option>{t("projects_priority_standard") || "Standard"}</option>
                  <option>{t("projects_priority_low") || "Low"}</option>
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>{t("projects_estimated_hours") || "Estimated hours"}</label>
                <input name="estimated_hours" type="number" placeholder={t("projects_estimated_hours_placeholder") || "Estimated hours for the task"} id="newToDoEstimatedHours" value={newToDo.estimated_hours} onChange={handleNewToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>{t("projects_estimated_hours_tip") || "Estimated hours for the task"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">paid</span>{t("projects_actual_hours") || "Actual hours"}</label>
                <input name="actual_hours" type="number" placeholder={t("projects_actual_hours_placeholder") || "Hours used so far"} id="newToDoActualHours" value={newToDo.actual_hours} onChange={handleNewToDoChange} />
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>{t("projects_actual_hours_tip") || "Hours used so far"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_responsible_person") || "Responsible Person"}</label>
                <select name="assigned_to" id="newToDoAssignedTo" value={newToDo.assigned_to} onChange={handleNewToDoChange}>
                  <option value="">{t("projects_select_responsible") || "Select responsible person"}</option>
                  {getAssignedUsers(newToDoProject || projectState).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">not_listed_location</span>{t("projects_created_by") || "Created By"}</label>
                <select name="created_by" id="newToDoCreatedBy" value={newToDo.created_by} onChange={handleNewToDoChange}>
                  <option value="">{t("projects_select_creator") || "Select creator"}</option>
                  {getAssignedUsers(newToDoProject || projectState).map(user => (
                    <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
                  ))}
                </select>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}</label>
                <input name="start_date" type="date" id="newToDoStartDate" value={newToDo.start_date} onChange={handleNewToDoChange} />
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">calendar_month</span>{t("projects_due_date") || "Due Date"}</label>
                <input name="due_date" type="date" id="newToDoDueDate" value={newToDo.due_date} onChange={handleNewToDoChange} />
              </div>
              {/* Dependencies as checkbox list in new to-do modal */}
              <div className="formFieldContainer">
                <label><span className="material-icons-round">link</span>{t("projects_dependencies") || "Dependencies"}</label>
                <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 4, padding: 8 }}>
                  {getOtherTasks(newToDoProject || projectState, null).map(td => (
                    <label key={td.id} style={{ display: 'block', marginBottom: 4 }}>
                      <input
                        type="checkbox"
                        value={td.id}
                        checked={Array.isArray(newToDo.dependencies) ? newToDo.dependencies.includes(td.id) : false}
                        onChange={e => {
                          const checked = e.target.checked;
                          setNewToDo(prev => {
                            let deps = Array.isArray(prev.dependencies) ? [...prev.dependencies] : [];
                            if (checked) {
                              if (!deps.includes(td.id)) deps.push(td.id);
                            } else {
                              deps = deps.filter(id => id !== td.id);
                            }
                            return { ...prev, dependencies: deps };
                          });
                        }}
                      />
                      {td.title}
                    </label>
                  ))}
                </div>
                <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>{t("projects_dependencies_tip") || "Select related tasks"}</label>
              </div>
              <div className="formFieldContainer">
                <label><span className="material-icons-round">subject</span>{t("projects_comments") || "Comments"}</label>
                <textarea name="comments" cols={30} rows={5} placeholder={t("projects_comments_placeholder") || "Add any clarification comment"} id="newToDoComments" value={newToDo.comments} onChange={handleNewToDoChange} />
              </div>
            </div>
            <div className="cancelAccept">
              <button type="button" className="cancelButton" onClick={() => closeModal('newToDoModal')}>
                {t("projects_cancel") || "Cancel"}
              </button>
              <button type="submit" className="acceptButton" id="submitToDoButton">
                {t("projects_accept") || "Accept"}
              </button>
            </div>
          </form>
        </dialog>

        {/* Delete To-Do Modal */}
        <dialog id="DeleteTaskModal">
            <form className="userForm" id="DeleteNewTaskForm">
                <h2>{t("projects_confirm_delete_task") || "Are you sure you want to delete the task:"} {toDoToDelete?.title ? `"${toDoToDelete.title}"?` : "?"}</h2>
                <div className="cancelAccept">
                    <button
                        type="button"
                        className="cancelButton"
                        onClick={() => { setToDoToDelete(null); closeModal('DeleteTaskModal'); }}
                    >
                        {t("projects_cancel") || "Cancel"}
                    </button>
                    <button type="button" className="acceptButton" id="ConfirmDeleteButton" onClick={handleConfirmDeleteToDo}>{t("projects_delete") || "Delete"}</button>
                </div>
            </form>
        </dialog>
      </div>
    );
}