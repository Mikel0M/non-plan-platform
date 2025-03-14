import { ItoDo, toDo } from './toDo';

export class toDoManager {
    private toDos: toDo[] = [];
    private toDoListUI: HTMLElement;

    constructor(toDoListUI: HTMLElement) {
        this.toDoListUI = toDoListUI;
    }

    // Method to add a new to-do
    newToDo(data: ItoDo): toDo {
        const newToDo = new toDo(data);
        this.toDos.push(newToDo);
        this.toDoListUI.appendChild(newToDo.ui);
        return newToDo;
    }

    // Method to find a to-do by its ID
    findToDoById(id: string): toDo | undefined {
        return this.toDos.find(toDo => toDo.id === id);
    }

    // Method to update an existing to-do
    updateToDo(data: ItoDo): toDo | undefined {
        const toDoInstance = this.findToDoById(data.id!);
        if (toDoInstance) {
            toDoInstance.id = data.id ?? toDoInstance.id;
            toDoInstance.title = data.title ?? '';
            toDoInstance.description = data.description ?? '';
            toDoInstance.status = data.status ?? 'Pending';
            toDoInstance.priority = data.priority ?? 'Low';
            toDoInstance.assigned_to = data.assigned_to ?? '';
            toDoInstance.project_id = data.project_id ?? '';
            toDoInstance.created_by = data.created_by ?? '';
            toDoInstance.created_at = data.created_at ?? '';
            toDoInstance.updated_at = data.updated_at ?? '';
            toDoInstance.due_date = data.due_date ?? '';
            toDoInstance.start_date = data.start_date ?? '';
            toDoInstance.completion_date = data.completion_date ?? '';
            toDoInstance.estimated_hours = data.estimated_hours ?? 0;
            toDoInstance.actual_hours = data.actual_hours ?? 0;
            toDoInstance.dependencies = data.dependencies ?? [];
            toDoInstance.progress_percentage = data.progress_percentage ?? '0%';
            toDoInstance.comments = data.comments ?? [];

            // Update the UI
            toDoInstance.setUI();
            return toDoInstance;
        } else {
            throw new Error("To-Do item not found(manager)");
        }
    }
}