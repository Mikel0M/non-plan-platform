import { v4 as uuidv4 } from 'uuid';
import { showModalPopulated } from '../utils/modalUtils';

export type toDoStatus = "Pending" | "In Progress" | "Completed" | "On Hold";
export type toDoPriority = "Low" | "Medium" | "High" | "Critical";
export type toDoPercentage = "25%" | "50%" | "75%" | "100%";

export interface ItoDo {
    id?: string;
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
}

export class toDo {
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
    ui: HTMLDivElement;

    constructor(data: ItoDo) {
        this.id = data.id || uuidv4();
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

        this.ui = document.createElement("div");
        this.setUI();
    }

    setUI() {
        this.updateColor();
        this.ui.className = "todoItem"; // Use a consistent class for To-Do items
        this.ui.style.backgroundColor = this.getColor(); // Set the background color dynamically

        this.ui.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
                <div style="display: flex; column-gap: 15px; align-items: center;">
                    <span class="material-icons-round" style="background-color: #969696; padding: 8px; border-radius: 8px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">construction</span>
                    <p>${this.title}</p>
                </div>
                <p style="white-space: nowrap; margin-left: 10px;">${this.due_date}</p>
            </div>
        `;

        // Add click event to open the edit modal
        this.ui.addEventListener("click", () => {
            showModalPopulated("editToDoModal", this);
        });

        // Append the To-Do item to the correct container
        const toDoContainer = document.getElementById("toDoContainer");
        if (toDoContainer) {
            toDoContainer.appendChild(this.ui);
        } else {
            console.warn("To-Do container not found");
        }
    }

    updateUI() {
        if (!this.ui) {
            console.warn(`UI not found for to-do: ${this.title}`);
            return;
        }

        // Update the color based on the status
        this.updateColor();

        const titleElement = this.ui.querySelector(".todoItem > div > div > p");
        if (titleElement) titleElement.textContent = this.title;

        const dueDateElement = this.ui.querySelector(".todoItem > div > p");
        if (dueDateElement) dueDateElement.textContent = this.due_date;

        const descriptionElement = this.ui.querySelector(".todoItem > div > div > .description");
        if (descriptionElement) descriptionElement.textContent = this.description;

        const statusElement = this.ui.querySelector(".todoItem > div > div > .status");
        if (statusElement) statusElement.textContent = this.status;

        const priorityElement = this.ui.querySelector(".todoItem > div > div > .priority");
        if (priorityElement) priorityElement.textContent = this.priority;

        const assignedToElement = this.ui.querySelector(".todoItem > div > div > .assigned_to");
        if (assignedToElement) assignedToElement.textContent = this.assigned_to;

        const createdByElement = this.ui.querySelector(".todoItem > div > div > .created_by");
        if (createdByElement) createdByElement.textContent = this.created_by;

        const startDateElement = this.ui.querySelector(".todoItem > div > div > .start_date");
        if (startDateElement) startDateElement.textContent = this.start_date;

        const updatedAtElement = this.ui.querySelector(".todoItem > div > div > .updated_at");
        if (updatedAtElement) updatedAtElement.textContent = this.updated_at;

        const estimatedHoursElement = this.ui.querySelector(".todoItem > div > div > .estimated_hours");
        if (estimatedHoursElement) estimatedHoursElement.textContent = this.estimated_hours.toString();

        const actualHoursElement = this.ui.querySelector(".todoItem > div > div > .actual_hours");
        if (actualHoursElement) actualHoursElement.textContent = this.actual_hours.toString();

        const dependenciesElement = this.ui.querySelector(".todoItem > div > div > .dependencies");
        if (dependenciesElement) dependenciesElement.textContent = this.dependencies.join(", ");

        const progressPercentageElement = this.ui.querySelector(".todoItem > div > div > .progress_percentage");
        if (progressPercentageElement) progressPercentageElement.textContent = this.progress_percentage;

        const commentsElement = this.ui.querySelector(".todoItem > div > div > .comments");
        if (commentsElement) commentsElement.textContent = this.comments.join(", ");

        console.log(`UI updated for to-do: ${this.title}`);
    }

    updateColor() {
        const color = this.getColor();
        if (this.ui) {
            this.ui.style.backgroundColor = color; // Apply the color to the main To-Do item container
            console.log(`Color updated for to-do "${this.title}" to: ${color}`);
        } else {
            console.warn(`UI not found for to-do: ${this.title}`);
        }
    }

    getColor(): string {
        switch (this.status) {
            case "In Progress":
                return "#FFA500"; // Orange
            case "Completed":
                return "var(--primary)"; // Primary color
            case "Pending":
                return "#969697"; // Gray
            case "On Hold":
                return "var(--red)"; // Red
            default:
                return "#969697"; // Default gray
        }
    }

    deleteUI() {
        if (this.ui && this.ui.parentElement) {
            this.ui.parentElement.removeChild(this.ui);
            console.log(`UI for to-do "${this.title}" has been deleted.`);
        } else {
            console.warn(`UI not found for to-do: ${this.title}`);
        }
    }
}