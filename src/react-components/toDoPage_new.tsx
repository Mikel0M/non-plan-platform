import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import { useTranslation } from "./LanguageContext";
import { Calendar } from './Calendar';
import { Modal, ConfirmModal } from '../components/Modal';
import { TodoForm } from '../components/TodoForm';
import { useTodos, useModal } from '../hooks/useTodos';
import { ItoDo } from '../classes/toDo';

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
    props.projectsManager.setChangeButton();
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

  // Form state
  const [selectedTodo, setSelectedTodo] = React.useState<ItoDo | null>(null);
  const [todoToDelete, setTodoToDelete] = React.useState<ItoDo | null>(null);

  // Project selection for new todos (when not in specific project page)
  const [selectedProjectForNewTodo, setSelectedProjectForNewTodo] = React.useState<string>(
    currentProject?.id || ''
  );

  // Handle new todo creation
  const handleCreateTodo = async (todoData: Omit<ItoDo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addTodo(todoData, selectedProjectForNewTodo || currentProject?.id);
      newTodoModal.closeModal();
      setSelectedProjectForNewTodo(currentProject?.id || '');
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

  return (
    <div className="page" id="toDoPage">
      <div id="main-content">
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
          <div className="dashboardCard calendar-fixed-size">
            <div className="cardHeader">
              <h3>Gantt Calendar</h3>
              {!currentProject && (
                <div className="calendar-project-selector">
                  <label htmlFor="project-select">Project:</label>
                  <select 
                    id="project-select"
                    value={selectedProjectForNewTodo}
                    onChange={(e) => setSelectedProjectForNewTodo(e.target.value)}
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
                tasks={todos.map(todo => ({
                  id: todo.id,
                  title: todo.title,
                  startDate: todo.start_date,
                  dueDate: todo.due_date,
                  completed: todo.status === 'Completed',
                  projectId: todo.project_id,
                  assignedTo: todo.assigned_to,
                  rawToDo: todo
                }))}
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

          {/* Tasks List */}
          <div className="todo-cards-list">
            <div className="dashboardCard todo-card">
              <div className="todo-card-header">
                <h3 className="todo-card-title">Tasks</h3>
                <span className="user-count-row">
                  <span className="material-icons-round">task</span>
                  {todos.length} tasks
                </span>
              </div>

              {todos.length === 0 ? (
                <div className="todo-empty">
                  No tasks found. Create your first task to get started.
                </div>
              ) : (
                <>
                  {/* Tasks Header */}
                  <div className="todo-items-header">
                    <div className="todo-task-icon"></div>
                    <div className="todo-header-label">Title</div>
                    <div className="todo-header-label">Status</div>
                    <div className="todo-header-label">Priority</div>
                    <div className="todo-header-label">Due Date</div>
                    <div className="todo-task-delete"></div>
                  </div>

                  {/* Tasks List */}
                  {todos.map((todo) => (
                    <div 
                      key={todo.id}
                      className={`todoItem user-card-hover ${getStatusClass(todo.status)}`}
                      onClick={() => openEditModal(todo)}
                    >
                      <div className="todo-task-icon">
                        <span className="material-icons-round">task</span>
                      </div>
                      <div className="todo-task-value">
                        <div className="todo-item-title-row">
                          <h5 className="todo-item-title">{todo.title}</h5>
                        </div>
                        {todo.description && (
                          <div className="todo-item-desc">{todo.description}</div>
                        )}
                      </div>
                      <div className="todo-task-value">{todo.status}</div>
                      <div className="todo-task-value">{todo.priority}</div>
                      <div className="todo-task-value">{formatDate(todo.due_date)}</div>
                      <div className="todo-task-delete">
                        <button
                          type="button"
                          className="buttonTertiary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(todo);
                          }}
                          title="Delete task"
                        >
                          <span className="material-icons-round">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Todo Modal */}
      <Modal 
        isOpen={newTodoModal.isOpen} 
        onClose={newTodoModal.closeModal}
        title="Create New Task"
        size="large"
      >
        <TodoForm
          onSubmit={handleCreateTodo}
          onCancel={newTodoModal.closeModal}
          projects={props.projectsManager.list}
          selectedProjectId={selectedProjectForNewTodo || currentProject?.id}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Edit Todo Modal */}
      <Modal 
        isOpen={editTodoModal.isOpen} 
        onClose={() => {
          editTodoModal.closeModal();
          setSelectedTodo(null);
        }}
        title="Edit Task"
        size="large"
      >
        {selectedTodo && (
          <TodoForm
            onSubmit={handleEditTodo}
            onCancel={() => {
              editTodoModal.closeModal();
              setSelectedTodo(null);
            }}
            initialData={selectedTodo}
            projects={props.projectsManager.list}
            selectedProjectId={selectedTodo.project_id}
            submitLabel="Update Task"
          />
        )}
      </Modal>

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
