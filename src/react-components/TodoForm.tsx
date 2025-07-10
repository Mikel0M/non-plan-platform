import * as React from 'react';
import { ItoDo, toDoStatus, toDoPriority, toDoPercentage } from '../classes/toDo';
import { IProject } from '../classes/Project';
import { usersManagerInstance } from '../classes/UsersManager';
import { User } from '../classes/User';
import { useTranslation } from './LanguageContext';

interface TodoFormProps {
  onSubmit: (data: Omit<ItoDo, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: Partial<ItoDo>;
  projects?: IProject[];
  selectedProjectId?: string;
  submitLabel?: string;
  availableTasks?: ItoDo[]; // For dependencies
  showTitle?: boolean; // Control whether to show the title
}

export const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  onCancel,
  onDelete,
  initialData,
  projects = [],
  selectedProjectId,
  submitLabel = 'Save Task',
  availableTasks = [],
  showTitle = true
}) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = React.useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: (initialData?.status || 'Pending') as toDoStatus,
    priority: (initialData?.priority || 'Medium') as toDoPriority,
    assigned_to: initialData?.assigned_to || '',
    created_by: initialData?.created_by || '',
    start_date: initialData?.start_date || '',
    due_date: initialData?.due_date || '',
    estimated_hours: initialData?.estimated_hours || 0,
    actual_hours: initialData?.actual_hours || 0,
    dependencies: Array.isArray(initialData?.dependencies) ? initialData.dependencies : [],
    comments: Array.isArray(initialData?.comments) ? initialData.comments.join('\n') : (initialData?.comments || ''),
    project_id: selectedProjectId || initialData?.project_id || '',
    completion_date: initialData?.completion_date || '',
    progress_percentage: (initialData?.progress_percentage || '25%') as toDoPercentage,
  });

  // Get project users for dropdowns
  const getProjectUsers = (): User[] => {
    try {
      if (!selectedProjectId) return usersManagerInstance.getUsers();
      
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project || !project.assignedUsers) return usersManagerInstance.getUsers();
      
      return project.assignedUsers
        .map(au => usersManagerInstance.getUsers().find(u => u.id === au.userId))
        .filter((user): user is User => Boolean(user));
    } catch (error) {
      console.error('Error getting project users:', error);
      return [];
    }
  };

  // Get other tasks for dependencies (excluding current task)
  const getOtherTasks = (): ItoDo[] => {
    return availableTasks.filter(task => task.id !== initialData?.id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimated_hours' || name === 'actual_hours' ? Number(value) : value
    }));
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to modal backdrop
    e.stopPropagation();
  };

  const handleDependencyChange = (taskId: string, checked: boolean) => {
    setFormData(prev => {
      let deps = Array.isArray(prev.dependencies) ? [...prev.dependencies] : [];
      if (checked) {
        if (!deps.includes(taskId)) deps.push(taskId);
      } else {
        deps = deps.filter(id => id !== taskId);
      }
      return { ...prev, dependencies: deps };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure proper data transformation
    const submitData = {
      ...formData,
      comments: formData.comments ? formData.comments.split('\n').filter(c => c.trim()) : [],
      dependencies: Array.isArray(formData.dependencies) ? formData.dependencies : [],
      project_id: selectedProjectId || formData.project_id,
      progress_percentage: formData.progress_percentage as toDoPercentage,
    };

    console.log('Submitting todo data:', submitData); // Debug log
    onSubmit(submitData);
  };

  const projectUsers = getProjectUsers();
  const otherTasks = getOtherTasks();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <form className="userForm form-wide" onSubmit={handleSubmit}>
        {showTitle && (
          <h2>{initialData?.id ? (t("projects_edit_task") || "Edit Task") : (t("projects_add_task") || "Add Task")}</h2>
        )}
      <div className="userCard">
        <div className="formFieldContainer">
          <label><span className="material-icons-round">apartment</span>{t("projects_title") || "Title"}</label>
          <input 
            name="title" 
            type="text" 
            value={formData.title} 
            onChange={handleChange}
            required
          />
          <label className="label-tip">{t("projects_tip_short_title") || "TIP give it a short title"}</label>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">subject</span>{t("projects_description") || "Description"}</label>
          <textarea 
            name="description" 
            cols={30} 
            rows={5} 
            placeholder={t("projects_description_placeholder") || "Description"} 
            value={formData.description} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">not_listed_location</span>{t("projects_status") || "Status"}</label>
          <select name="status" value={formData.status} onChange={handleChange} onClick={handleSelectClick}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">not_listed_location</span>{t("projects_priority") || "Priority"}</label>
          <select name="priority" value={formData.priority} onChange={handleChange} onClick={handleSelectClick}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
            <option>Critical</option>
          </select>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">paid</span>{t("projects_estimated_hours") || "Estimated hours"}</label>
          <input 
            name="estimated_hours" 
            type="number" 
            placeholder={t("projects_estimated_hours_placeholder") || "Estimated hours for the task"} 
            value={formData.estimated_hours} 
            onChange={handleChange} 
          />
          <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            {t("projects_estimated_hours_tip") || "Estimated hours for the task"}
          </label>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">paid</span>{t("projects_actual_hours") || "Actual hours"}</label>
          <input 
            name="actual_hours" 
            type="number" 
            placeholder={t("projects_actual_hours_placeholder") || "Hours used so far"} 
            value={formData.actual_hours} 
            onChange={handleChange} 
          />
          <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            {t("projects_actual_hours_tip") || "Hours used so far"}
          </label>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">percent</span>{t("projects_progress") || "Progress"}</label>
          <select name="progress_percentage" value={formData.progress_percentage} onChange={handleChange}>
            <option value="0%">0%</option>
            <option value="25%">25%</option>
            <option value="50%">50%</option>
            <option value="75%">75%</option>
            <option value="100%">100%</option>
          </select>
          <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            {t("projects_progress_tip") || "Current progress percentage"}
          </label>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">not_listed_location</span>{t("projects_responsible_person") || "Responsible Person"}</label>
          <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} onClick={handleSelectClick}>
            <option value="">{t("projects_select_responsible") || "Select responsible person"}</option>
            {projectUsers.length > 0 ? projectUsers.map(user => (
              <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
            )) : (
              <option value="" disabled>No users available</option>
            )}
          </select>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">not_listed_location</span>{t("projects_created_by") || "Created By"}</label>
          <select name="created_by" value={formData.created_by} onChange={handleChange} onClick={handleSelectClick}>
            <option value="">{t("projects_select_creator") || "Select creator"}</option>
            {projectUsers.length > 0 ? projectUsers.map(user => (
              <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
            )) : (
              <option value="" disabled>No users available</option>
            )}
          </select>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}</label>
          <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">calendar_month</span>{t("projects_due_date") || "Due Date"}</label>
          <input name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
        </div>
        
        {/* Dependencies as checkbox list */}
        <div className="formFieldContainer">
          <label>{t("projects_dependencies") || "Dependencies"}</label>
          <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 4, padding: 8 }}>
            {otherTasks.length > 0 ? (
              otherTasks.map((task) => (
                <label key={task.id} style={{ display: 'block', marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    value={task.id}
                    checked={Array.isArray(formData.dependencies) ? formData.dependencies.includes(task.id) : false}
                    onChange={e => handleDependencyChange(task.id, e.target.checked)}
                  />
                  {task.title}
                </label>
              ))
            ) : (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No other tasks available</span>
            )}
          </div>
          <label className="label-tip" style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            {t("projects_dependencies_tip") || "Select tasks that this task depends on"}
          </label>
        </div>
        
        <div className="formFieldContainer">
          <label><span className="material-icons-round">subject</span>{t("projects_comments") || "Comments"}</label>
          <textarea 
            name="comments" 
            cols={30} 
            rows={5} 
            placeholder={t("projects_comments_placeholder") || "Add any clarification comment"} 
            value={formData.comments} 
            onChange={handleChange} 
          />
        </div>
      </div>
      
      <div className="cancelAccept">
        {onDelete && initialData?.id && (
          <button type="button" className="deleteButton" onClick={onDelete}>
            {t("projects_delete") || "Delete"}
          </button>
        )}
        <button type="button" className="cancelButton" onClick={onCancel}>
          {t("projects_cancel") || "Cancel"}
        </button>
        <button type="submit" className="acceptButton">
          {t("projects_accept") || "Accept"}
        </button>
      </div>
    </form>
    </div>
  );
};
