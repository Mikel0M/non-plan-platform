import { v4 as uuidv4 } from 'uuid';
import { showModal, showModalPopulated} from '..';

export type toDoStatus = "Pending" | "In Progress" | "Completed" | "On Hold";
export type toDoPriority = "Low" | "Medium" | "High" | "Critical";
export type toDoPercentage = "25%" | "50%" | "75%" | "100%";

export interface ItoDo {
    // Basic Fields
    id?: string;
    title: string;
    description: string;
    status: toDoStatus;
    priority: toDoPriority;
    // Project & Assignment
    project_id: string;
    assigned_to: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Time Management
    due_date: string;
    start_date: string;
    completion_date: string;
    estimated_hours: number;
    actual_hours: number;
    // Construction-Specific
    dependencies: string[];
    // Progress Tracking
    progress_percentage: toDoPercentage;
    comments: string[];
}

export class toDo {
    // To satisfy ItoDo
    id: string;
    title: string;
    description: string;
    status: toDoStatus;
    priority: toDoPriority;
    project_id: string;
    assigned_to: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    due_date: string;
    start_date: string;
    completion_date: string;
    estimated_hours: number;
    actual_hours: number;
    dependencies: string[];
    progress_percentage: toDoPercentage;
    comments: string[];

    // Class internals
    ui: HTMLDivElement;

    constructor(data: ItoDo) {
        // Allow existing id, otherwise generate a new one
        this.id = data.id || uuidv4();
        // Project data definition
        this.title = data.title;
        this.description = data.description;
        this.status = data.status;
        this.priority = data.priority;
        this.project_id = data.project_id;
        this.assigned_to = data.assigned_to;
        this.created_by = data.created_by;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.due_date = data.due_date;
        this.start_date = data.start_date;
        this.completion_date = data.completion_date;
        this.estimated_hours = data.estimated_hours;
        this.actual_hours = data.actual_hours;
        this.dependencies = data.dependencies;
        this.progress_percentage = data.progress_percentage;
        this.comments = data.comments;

        // Initialize the UI element
        this.ui = document.createElement("div");
        console.log("UI Element Created:", this.title);
        this.setUI();
    }

    setUI() {
        if (!this.ui) { return; }
        console.log("testing toDo");
        this.ui.className = "userCard";
        console.log("testing toDo2");
        this.ui.innerHTML = `
            <div style="display: flex;flex-direction: column; margin-top: 10px; margin-left: 20px; margin-right: 20px;">
                <div class="todoItem">
                    <div style="display: flex; justify-content: space-between;flex-direction: row;align-items: center;">
                        <div style="display:flex;column-gap: 15px;">
                            <span class="material-icons-round" style="background-color: #969696; padding: 8px; border-radius: 8px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">construction</span>
                            <p>${this.title}</p>
                        </div>
                        <p style="text-wrap: nowrap; margin-left: 10px;">${this.due_date}</p>
                    </div>
                </div>
            </div>
        `;

        // Add event listener to open the edit modal when the userCard is clicked
        this.ui.addEventListener("click", () => {
            showModalPopulated("editToDoModal", this);
        });
    }
    updateUI() {
        if (!this.ui) {
            console.warn(`UI not found for to-do: ${this.title}`);
            return;
        }

        // Update the title
        const titleElement = this.ui.querySelector(".todoItem > div > div > p");
        if (titleElement) titleElement.textContent = this.title;

        // Update the due date
        const dueDateElement = this.ui.querySelector(".todoItem > div > p");
        if (dueDateElement) dueDateElement.textContent = this.due_date;

        // Update other properties if needed
        // For example, if you have additional properties to display in the UI, update them here
        // const statusElement = this.ui.querySelector(".statusClass");
        // if (statusElement) statusElement.textContent = this.status;

        // const priorityElement = this.ui.querySelector(".priorityClass");
        // if (priorityElement) priorityElement.textContent = this.priority;
    }
}