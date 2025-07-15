import { useState, useCallback, useEffect } from 'react';
import { ItoDo, toDoStatus, toDoPriority } from '../classes/toDo';
import { IProject } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';

// Hook for managing modal state
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return { isOpen, openModal, closeModal, toggleModal };
};

// Hook for managing todo operations
export const useTodos = (projectsManager: ProjectsManager, projectId?: string) => {
  const [todos, setTodos] = useState<ItoDo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load todos for the current project
  useEffect(() => {
    if (projectId && projectsManager) {
      try {
        const project = projectsManager.getProject(projectId);
        if (project && project.toDos) {
          // Convert toDo class instances to ItoDo interfaces
          const todoData = project.toDos.map(todo => ({
            id: todo.id,
            title: todo.title,
            description: todo.description,
            status: todo.status,
            priority: todo.priority,
            project_id: todo.project_id,
            assigned_to: todo.assigned_to,
            created_by: todo.created_by,
            created_at: todo.created_at,
            updated_at: todo.updated_at,
            updatedAt: todo.updatedAt,
            due_date: todo.due_date,
            start_date: todo.start_date,
            completion_date: todo.completion_date,
            estimated_hours: todo.estimated_hours,
            actual_hours: todo.actual_hours,
            dependencies: todo.dependencies,
            progress_percentage: todo.progress_percentage,
            comments: todo.comments,
            isComplete: todo.isComplete,
            subToDo: todo.subToDo,
            modifiedAt: todo.modifiedAt,
            modifiedBy: todo.modifiedBy,
            phase: todo.phase,
          } as ItoDo));
          setTodos(todoData);
        } else {
          setTodos([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load todos');
        setTodos([]);
      }
    } else {
      // Load all todos from all projects
      const allTodos = projectsManager.list.flatMap(project => 
        (project.toDos || []).map(todo => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          project_id: todo.project_id,
          assigned_to: todo.assigned_to,
          created_by: todo.created_by,
          created_at: todo.created_at,
          updated_at: todo.updated_at,
          updatedAt: todo.updatedAt,
          due_date: todo.due_date,
          start_date: todo.start_date,
          completion_date: todo.completion_date,
          estimated_hours: todo.estimated_hours,
          actual_hours: todo.actual_hours,
          dependencies: todo.dependencies,
          progress_percentage: todo.progress_percentage,
          comments: todo.comments,
          isComplete: todo.isComplete,
          subToDo: todo.subToDo,
          modifiedAt: todo.modifiedAt,
          modifiedBy: todo.modifiedBy,
          phase: todo.phase,
        } as ItoDo))
      );
      setTodos(allTodos);
    }
  }, [projectsManager, projectId]);

  const addTodo = useCallback(async (todoData: Omit<ItoDo, 'id' | 'created_at' | 'updated_at'>, targetProjectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const project = projectsManager.getProject(targetProjectId || projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const newTodo: ItoDo = {
        ...todoData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_id: project.id,
        completion_date: todoData.completion_date || '',
      };

      project.addToDo(newTodo);
      
      // Update local state
      if (projectId === project.id || !projectId) {
        setTodos(prev => [...prev, newTodo]);
      }
      
      return newTodo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectsManager, projectId]);

  const updateTodo = useCallback(async (todoId: string, updates: Partial<ItoDo>) => {
    try {
      setLoading(true);
      setError(null);

      // Find and update the todo in the appropriate project
      let foundProject: IProject | null = null;
      let todoToUpdate: ItoDo | null = null;

      for (const project of projectsManager.list) {
        if (project.toDos) {
          const todo = project.toDos.find(t => t.id === todoId);
          if (todo) {
            foundProject = project;
            todoToUpdate = todo;
            break;
          }
        }
      }

      if (!foundProject || !todoToUpdate) {
        throw new Error('Todo not found');
      }

      // Update in project
      const todoIndex = foundProject.toDos!.findIndex(t => t.id === todoId);
      if (todoIndex !== -1) {
        // Update the toDo class instance
        Object.assign(foundProject.toDos![todoIndex], {
          ...updates,
          updated_at: new Date().toISOString(),
        });
        
        // The toDo class no longer has updateUI method as it's now pure data
        // UI updates are handled by React state changes
      }

      // Update local state with interface data
      setTodos(prev => 
        prev.map(todo => 
          todo.id === todoId ? { ...todo, ...updates, updated_at: new Date().toISOString() } : todo
        )
      );

      return { ...todoToUpdate, ...updates, updated_at: new Date().toISOString() };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectsManager]);

  const deleteTodo = useCallback(async (todoId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Find and remove the todo from the appropriate project
      let foundProject: IProject | null = null;

      for (const project of projectsManager.list) {
        if (project.toDos) {
          const todoIndex = project.toDos.findIndex(t => t.id === todoId);
          if (todoIndex !== -1) {
            foundProject = project;
            project.toDos.splice(todoIndex, 1);
            break;
          }
        }
      }

      if (!foundProject) {
        throw new Error('Todo not found');
      }

      // Update local state
      setTodos(prev => prev.filter(todo => todo.id !== todoId));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectsManager]);

  const refreshTodos = useCallback(() => {
    if (projectId && projectsManager) {
      const project = projectsManager.getProject(projectId);
      if (project && project.toDos) {
        // Convert toDo class instances to ItoDo interfaces
        const todoData = project.toDos.map(todo => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          project_id: todo.project_id,
          assigned_to: todo.assigned_to,
          created_by: todo.created_by,
          created_at: todo.created_at,
          updated_at: todo.updated_at,
          due_date: todo.due_date,
          start_date: todo.start_date,
          completion_date: todo.completion_date,
          estimated_hours: todo.estimated_hours,
          actual_hours: todo.actual_hours,
          dependencies: todo.dependencies,
          progress_percentage: todo.progress_percentage,
          comments: todo.comments,
        } as ItoDo));
        setTodos(todoData);
      }
    } else {
      const allTodos = projectsManager.list.flatMap(project => 
        (project.toDos || []).map(todo => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          project_id: todo.project_id,
          assigned_to: todo.assigned_to,
          created_by: todo.created_by,
          created_at: todo.created_at,
          updated_at: todo.updated_at,
          due_date: todo.due_date,
          start_date: todo.start_date,
          completion_date: todo.completion_date,
          estimated_hours: todo.estimated_hours,
          actual_hours: todo.actual_hours,
          dependencies: todo.dependencies,
          progress_percentage: todo.progress_percentage,
          comments: todo.comments,
        } as ItoDo))
      );
      setTodos(allTodos);
    }
  }, [projectsManager, projectId]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    refreshTodos,
  };
};

// Hook for form management
export const useTodoForm = (initialData?: Partial<ItoDo>) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'Pending' as toDoStatus,
    priority: initialData?.priority || 'Standard' as toDoPriority,
    assigned_to: initialData?.assigned_to || '',
    created_by: initialData?.created_by || '',
    due_date: initialData?.due_date || '',
    start_date: initialData?.start_date || '',
    estimated_hours: initialData?.estimated_hours || 0,
    actual_hours: initialData?.actual_hours || 0,
    dependencies: initialData?.dependencies || [],
    comments: initialData?.comments || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Estimated hours cannot be negative';
    }

    if (formData.actual_hours < 0) {
      newErrors.actual_hours = 'Actual hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      status: 'Pending' as toDoStatus,
      priority: 'Standard' as toDoPriority,
      assigned_to: '',
      created_by: '',
      due_date: '',
      start_date: '',
      estimated_hours: 0,
      actual_hours: 0,
      dependencies: [],
      comments: [],
    });
    setErrors({});
  }, []);

  const setFormValues = useCallback((data: Partial<ItoDo>) => {
    setFormData(prev => ({
      ...prev,
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'Pending' as toDoStatus,
      priority: data.priority || 'Standard' as toDoPriority,
      assigned_to: data.assigned_to || '',
      created_by: data.created_by || '',
      due_date: data.due_date || '',
      start_date: data.start_date || '',
      estimated_hours: data.estimated_hours || 0,
      actual_hours: data.actual_hours || 0,
      dependencies: data.dependencies || [],
      comments: data.comments || [],
    }));
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFormValues,
  };
};
