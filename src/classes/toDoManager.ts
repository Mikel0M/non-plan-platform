import { ItoDo, toDo } from './toDo';

export let toDos: toDo[] = []; // Make toDos public

export class toDoManager {
    public toDoListUI: HTMLElement;
    public toDoListContainer: HTMLElement | null = null; // To hold the #toDoList container

    constructor(toDoListUI: HTMLElement) {
        this.toDoListUI = toDoListUI;
        console.log("toDoListUI initialized:", this.toDoListUI); // Debugging statement
    }

    // Getter method to expose the toDoListUI element
    getToDoListUI(): HTMLElement {
        return this.toDoListUI;
    }

    // Getter method to return the current state of the toDos array
    getToDos(): toDo[] {
        return toDos;
    }

    // Method to add a new to-do
    // Defensive: always ensure dependencies is a string[] in newToDo and updateToDo
    newToDo(data: ItoDo, projectId: string): toDo {
        data.project_id = projectId;
        data.dependencies = Array.isArray(data.dependencies) ? data.dependencies : (typeof data.dependencies === 'string' && !!data.dependencies && data.dependencies.split ? data.dependencies.split(',').map(s => s.trim()) : []);
        const newToDo = new toDo(data);
        toDos.push(newToDo);
        this.toDoListUI.appendChild(newToDo.ui);
        console.log(`New to-do added with project ID: ${projectId}`, newToDo); // Debugging statement
        console.log("Current toDos list after addition:", toDos); // Debugging statement
        return newToDo;
    }

    // Method to find a to-do by its ID
    findToDoById(id: string): toDo | undefined {
        return toDos.find(toDo => toDo.id === id);
    }

    // Method to update an existing to-do
    updateToDo(data: ItoDo): toDo | undefined {
        data.dependencies = Array.isArray(data.dependencies) ? data.dependencies : (typeof data.dependencies === 'string' && !!data.dependencies && data.dependencies.split ? data.dependencies.split(',').map(s => s.trim()) : []);
        const toDoInstance = this.findToDoById(data.id!);
        if (toDoInstance) {
            // Ensure dependencies is always an array
            if (!Array.isArray(data.dependencies)) data.dependencies = [];
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

            toDoInstance.updateUI();
            console.log(`To-do with ID ${data.id} updated`, toDoInstance); // Debugging statement
            console.log("Current toDos list after update:", toDos); // Debugging statement
            return toDoInstance;
        } else {
            throw new Error("To-Do item not found(manager)");
        }
    }

    // Method to delete a to-do by its ID
    deleteToDoById(id: string): void {
        const toDoIndex = toDos.findIndex(toDo => toDo.id === id);
        if (toDoIndex !== -1) {
            const toDoInstance = toDos[toDoIndex];
            toDoInstance.deleteUI();
            toDos.splice(toDoIndex, 1);
            console.log(`To-do with ID ${id} deleted`); // Debugging statement
            console.log("Current toDos list after deletion:", toDos); // Debugging statement
        } else {
            console.warn(`To-do with ID ${id} not found`); // Debugging statement
        }
    }

    // Method to gather and return all to-dos
    exportToDos(): ItoDo[] {
        return toDos.map(toDo => ({
            id: toDo.id,
            title: toDo.title,
            description: toDo.description,
            status: toDo.status,
            priority: toDo.priority,
            project_id: toDo.project_id,
            assigned_to: toDo.assigned_to,
            created_by: toDo.created_by,
            created_at: toDo.created_at,
            updated_at: toDo.updated_at,
            due_date: toDo.due_date,
            start_date: toDo.start_date,
            completion_date: toDo.completion_date,
            estimated_hours: toDo.estimated_hours,
            actual_hours: toDo.actual_hours,
            dependencies: toDo.dependencies,
            progress_percentage: toDo.progress_percentage,
            comments: toDo.comments
        }));
    }
}

// Create and export an instance of toDoManager
export const toDoManagerInstance = new toDoManager(document.getElementById('toDoListContainer')!);