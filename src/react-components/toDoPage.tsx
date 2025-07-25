import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import { useTranslation } from "./LanguageContext";
import { Calendar } from './Calendar';
import { Modal, ConfirmModal } from './Modal';
import { ToDoForm } from './ToDoForm';
import { useTodos, useModal } from '../hooks/useTodos';
import { ItoDo } from '../classes/toDo';
import { ProjectTasksList } from "./ProjectTaskList";

interface Props {
  projectsManager: ProjectsManager;
}

export function ToDoPage(props: Props) {
  const { t } = useTranslation();
  const { id } = useParams();
  
  // Get current project
  const [currentProject, setCurrentProject] = React.useState(
    id ? props.projectsManager.getProject(id) : undefined
  );

  // Update project when route changes
  React.useEffect(() => {
    setCurrentProject(id ? props.projectsManager.getProject(id) : undefined);
  }, [props.projectsManager, id]);

  // Use custom hooks for state management
  const { todos, addTodo, updateTodo, deleteTodo, loading, error } = useTodos(
    props.projectsManager, 
    currentProject?.id
  );

  // Modal state management
  const newTodoModal = useModal();
  const editTodoModal = useModal();
  const deleteTodoModal = useModal();
  const [selectedTodo, setSelectedTodo] = React.useState<ItoDo | null>(null);

  // Form state
  const [todoToDelete, setTodoToDelete] = React.useState<ItoDo | null>(null);

  // Project selection for new todos (when not in specific project page)
  const [selectedProjectForNewTodo, setSelectedProjectForNewTodo] = React.useState<string>(
    currentProject?.id || ''
  );

  // View mode toggle state
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');

  // Handle new todo creation
  const handleCreateTodo = async (todoData: Omit<ItoDo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addTodo(todoData, selectedProjectForNewTodo || currentProject?.id);
      newTodoModal.closeModal();
    } catch (err) {
      console.error('Failed to create todo:', err);
    }
  };

  // Handle todo editing
  const handleEditTodo = async (todoData: Omit<ItoDo, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedTodo) return;
    
    try {
      await updateTodo(selectedTodo.id, todoData);
      editTodoModal.closeModal();
      setSelectedTodo(null);
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  // Handle todo completion toggle
  const handleToggleComplete = async (todo: ItoDo) => {
    try {
      await updateTodo(todo.id, { ...todo, isComplete: !todo.isComplete });
    } catch (err) {
      console.error('Failed to toggle todo completion:', err);
    }
  };

  // Handle todo deletion
  const handleDeleteTodo = async () => {
    if (!todoToDelete) return;
    
    try {
      await deleteTodo(todoToDelete.id);
      setTodoToDelete(null);
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  // Open edit modal
  const openEditModal = (todo: ItoDo) => {
    setSelectedTodo(todo);
    editTodoModal.openModal();
  };

  // Open delete confirmation
  const openDeleteModal = (todo: ItoDo) => {
    setTodoToDelete(todo);
    deleteTodoModal.openModal();
  };

  // Get status class for styling
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'inprogress': return 'status-inprogress';
      case 'completed': return 'status-completed';
      case 'onhold': return 'status-onhold';
      default: return 'status-pending';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Prepare calendar tasks including project duration bars
  const calendarTasks = React.useMemo(() => {
    const tasks: any[] = [];
    const visibleProjects = currentProject ? [currentProject] : props.projectsManager.list;

    for (const project of visibleProjects) {
      // Add project duration bar
      tasks.push({
        id: `project-duration-${project.id}`,
        title: project.name || 'New Project',
        startDate: project.startDate,
        dueDate: project.finishDate,
        completed: false,
        color: project.color || 'var(--primary)',
        projectId: project.id,
        isProjectDuration: true
      });
      // Add all tasks for this project
      tasks.push(...todos
        .filter(todo => todo.project_id === project.id)
        .map(todo => ({
          ...todo,
          color: project.color || 'var(--primary)',
          projectName: project.name,
          rawToDo: todo, // Keep the original todo for editing
        }))
      );
    }

    return tasks;
  }, [todos, currentProject, props.projectsManager.list]);

  return (
    <div className="page" id="toDoPage">
      <div className="projects-content">
        {/* Header */}
        <div className="projects-content-header">
          <header>
            <div className="buttonsGroup">
              <h1>{currentProject ? `${currentProject.name} - Tasks` : 'All Tasks'}</h1>
              <button 
                className="buttonSecondary" 
                onClick={newTodoModal.openModal}
              >
                <span className="material-icons-round">add</span>
                Add Task
              </button>
            </div>
          </header>
        </div>

          {/* View Toggle Buttons */}
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

          {/* Error display */}
          {error && (
            <div className="error-message" style={{ color: 'red', padding: '10px' }}>
              Error: {error}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="loading-message" style={{ padding: '10px' }}>
              Loading...
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="dashboardCard calendar-fixed-size">
              <div className="cardHeader">
                <h3>Gantt Calendar</h3>
                {/* Project selector for filtering and creating tasks */}
                {!currentProject && (
                  <div className="project-selector" style={{ marginBottom: 16 }}>
                    <label htmlFor="project-select">Project:</label>
                    <select
                      id="project-select"
                      value={selectedProjectForNewTodo}
                      onChange={e => setSelectedProjectForNewTodo(e.target.value)}
                    >
                      <option value="">All Projects</option>
                      {props.projectsManager.list.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="calendar-scroll-vertical">
                <Calendar 
                  tasks={calendarTasks
                    .filter(todo => {
                      // If no project selected, show all
                      if (!selectedProjectForNewTodo) return true;
                      // Show project bar (projectId) or tasks (project_id)
                      return (
                        todo.projectId === selectedProjectForNewTodo ||
                        todo.project_id === selectedProjectForNewTodo
                      );
                    })
                    .map(todo => {
                      if (todo.isProjectDuration) return todo;
                      const project = props.projectsManager.getProject(todo.projectId || todo.project_id);
                      return {
                        ...todo,
                        title: todo.title,
                        startDate: todo.startDate || todo.start_date,
                        dueDate: todo.dueDate || todo.due_date,
                        color: project?.color || 'var(--primary)',
                        projectName: project?.name,
                      };
                    })}
                  start={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  end={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onEditTask={(task) => {
                    if (task.rawToDo) {
                      openEditModal(task.rawToDo);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Tasks List */}
          {viewMode === 'list' && (
            <>
              <div className="project-selector" style={{ marginBottom: 16 }}>
                <label htmlFor="project-select">Project:</label>
                <select
                  id="project-select"
                  value={selectedProjectForNewTodo}
                  onChange={e => setSelectedProjectForNewTodo(e.target.value)}
                >
                  <option value="">All Projects</option>
                  {props.projectsManager.list.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="todo-cards-list">
                <ProjectTasksList
                  todos={todos.filter(todo => !selectedProjectForNewTodo || todo.project_id === selectedProjectForNewTodo)}
                  onEdit={openEditModal}
                  updateTodo={updateTodo}
                />
              </div>
            </>
          )}
        </div>

      {/* New Todo Modal */}
      <ToDoForm
        open={newTodoModal.isOpen}
        onClose={newTodoModal.closeModal}
        onSubmit={handleCreateTodo}
        projects={props.projectsManager.list}
        selectedProjectId={selectedProjectForNewTodo || currentProject?.id}
        submitLabel="Create Task"
        availableTasks={todos}
        showTitle={false}
      />

      {/* Edit Todo Modal */}
      <ToDoForm
        open={editTodoModal.isOpen}
        onClose={() => {
          editTodoModal.closeModal();
          setSelectedTodo(null);
        }}
        onSubmit={handleEditTodo}
        onDelete={() => {
          editTodoModal.closeModal();
          setSelectedTodo(null);
          openDeleteModal(selectedTodo);
        }}
        initialData={selectedTodo || undefined}
        projects={props.projectsManager.list}
        selectedProjectId={selectedTodo?.project_id}
        submitLabel="Update Task"
        availableTasks={todos}
        showTitle={false}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTodoModal.isOpen}
        onClose={() => {
          deleteTodoModal.closeModal();
          setTodoToDelete(null);
        }}
        onConfirm={handleDeleteTodo}
        title="Delete Task"
        message={`Are you sure you want to delete "${todoToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
