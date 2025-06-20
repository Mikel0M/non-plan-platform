import React from "react";

export interface ToDoCardProps {
  toDo: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    // Add other fields as needed
  };
  onToggleComplete?: (id: string) => void;
}

const ToDoCard: React.FC<ToDoCardProps> = ({ toDo, onToggleComplete }) => {
  return (
    <div className={`todo-card${toDo.completed ? " completed" : ""}`}> 
      <div className="todo-card-header">
        <input
          type="checkbox"
          checked={toDo.completed}
          onChange={() => onToggleComplete && onToggleComplete(toDo.id)}
        />
        <span className="todo-title">{toDo.title}</span>
      </div>
      {toDo.description && <div className="todo-desc">{toDo.description}</div>}
      {toDo.dueDate && <div className="todo-due">Due: {toDo.dueDate}</div>}
    </div>
  );
};

export default ToDoCard;
