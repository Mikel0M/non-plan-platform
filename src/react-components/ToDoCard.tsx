import React from "react";
import { ItoDo } from "../classes/toDo";
import { usersManagerInstance } from "../classes/UsersManager";

export interface ToDoCardProps {
  toDo: ItoDo;
  onToggleComplete?: () => void;
  onClick?: () => void;
}

const ToDoCard: React.FC<ToDoCardProps> = ({ toDo, onToggleComplete, onClick }) => {
  const responsibleUser = usersManagerInstance.getUsers().find(u => u.id === toDo.assigned_to);

  return (
    <div
      className={`todoItem todo-card-row status-${toDo.status.replace(/\s+/g, '').toLowerCase()} priority-${toDo.priority.toLowerCase()}`}
      onClick={onClick}
    >
      <span className="todo-title">{toDo.title}</span>
      <span className="todo-user">{responsibleUser ? `${responsibleUser.name} ${responsibleUser.surname}` : ''}</span>
      <span className="todo-date">{toDo.due_date}</span>
      <span className="todo-priority">{toDo.priority}</span>
      <span className="todo-status">{toDo.status}</span>
      <span className="todo-checkbox-container">
        <input
          type="checkbox"
          checked={!!toDo.isComplete}
          onClick={e => e.stopPropagation()} // Prevent card click/edit
          onChange={() => {
            onToggleComplete && onToggleComplete();
          }}
          className="todo-checkbox"
        />
      </span>
      <span className="todo-task-delete" />
    </div>
  );
};

export default ToDoCard;
