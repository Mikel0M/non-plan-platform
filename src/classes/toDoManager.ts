import { ItoDo, toDo } from "./toDo";

export class toDoManager {
    list: toDo[] = [];
    ui: HTMLElement;

    constructor(container: HTMLElement) {
        this.ui = container;
    }

    newToDo(data: ItoDo) {
        const ToDo = new toDo(data);
        this.ui.append(ToDo.ui);
        this.list.push(ToDo);
        return ToDo;
    }

    updateToDo(data: ItoDo) {
        const toDoIndex = this.list.findIndex((item) => item.id === data.id);
        if (toDoIndex !== -1) {
            const existingToDo = this.list[toDoIndex];
            existingToDo.title = data.title;
            existingToDo.description = data.description;
            existingToDo.status = data.status;
            existingToDo.priority = data.priority;
            existingToDo.project_id = data.project_id;
            existingToDo.assigned_to = data.assigned_to;
            existingToDo.created_by = data.created_by;
            existingToDo.created_at = data.created_at;
            existingToDo.updated_at = data.updated_at;
            existingToDo.due_date = data.due_date;
            existingToDo.start_date = data.start_date;
            existingToDo.completion_date = data.completion_date;
            existingToDo.estimated_hours = data.estimated_hours;
            existingToDo.actual_hours = data.actual_hours;
            existingToDo.dependencies = data.dependencies;
            existingToDo.progress_percentage = data.progress_percentage;
            existingToDo.comments = data.comments;

            // Update the UI
            existingToDo.setUI();
            return existingToDo;
        } else {
            throw new Error("To-Do item not found");
        }
    }
}