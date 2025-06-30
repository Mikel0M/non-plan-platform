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
    // Ensure dependencies is a string[] in newToDo
    newToDo(data: ItoDo, projectId: string): toDo {
        data.project_id = projectId;
        // Ensure dependencies is always a string[]
        if (!Array.isArray(data.dependencies)) {
            data.dependencies = [];
        }
        const newToDo = new toDo(data);
        toDos.push(newToDo);
        // UI handling removed - React components will handle UI updates
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
        // Ensure dependencies is always a string[]
        if (!Array.isArray(data.dependencies)) {
            data.dependencies = [];
        }
        const toDoInstance = this.findToDoById(data.id!);
        if (toDoInstance) {
            // Ensure dependencies is always an array
            if (!Array.isArray(data.dependencies)) data.dependencies = [];
            // Use the update method instead of direct property assignment
            toDoInstance.update(data);
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
            toDos.splice(toDoIndex, 1);
            console.log(`To-do with ID ${id} deleted`); // Debugging statement
            console.log("Current toDos list after deletion:", toDos); // Debugging statement
        } else {
            console.warn(`To-do with ID ${id} not found`); // Debugging statement
        }
    }

    // Method to gather and return all to-dos
    exportToDos(): ItoDo[] {
        return toDos.map(toDo => toDo.toJSON());
    }
}

// Create and export an instance of toDoManager
export const toDoManagerInstance = new toDoManager(document.getElementById('toDoListContainer')!);