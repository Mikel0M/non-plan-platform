import React from "react";
import { ItoDo } from "../classes/toDo";
import ToDoCard from "./ToDoCard";
import { SearchBox } from "./SearchBox";

interface ProjectTasksListProps {
  todos: ItoDo[];
  onEdit: (todo: ItoDo) => void;
  updateTodo: (id: string, data: Partial<ItoDo>) => Promise<ItoDo>; // <-- fix here
}

export const ProjectTasksList: React.FC<ProjectTasksListProps> = ({
  todos,
  onEdit,
  updateTodo,
}) => {
  const [search, setSearch] = React.useState("");

  const handleToggleComplete = async (todo: ItoDo) => {
    if (!todo.id) {
      console.error("Cannot update ToDo: missing Firestore document ID.");
      return;
    }
    const newComplete = !todo.isComplete;
    const newStatus: ItoDo["status"] = newComplete ? "Completed" : "Pending";
    try {
      await updateTodo(todo.id, {
        isComplete: newComplete,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  };

  const filtered = search.trim()
    ? todos.filter(
        todo =>
          todo.title.toLowerCase().includes(search.toLowerCase()) ||
          todo.description.toLowerCase().includes(search.toLowerCase())
      )
    : todos;

  return (
    <div>
      <SearchBox value={search} onValueChange={setSearch} placeholder="Search tasks..." />
      <div className="todo-cards-list">
        {filtered.map(todo => (
          <ToDoCard
            key={todo.id}
            toDo={todo}
            onToggleComplete={() => handleToggleComplete(todo)}
            onClick={() => onEdit(todo)}
          />
        ))}
      </div>
    </div>
  );
};