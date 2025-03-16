import { v4 as uuidv4 } from 'uuid';
import { showModalPopulated } from '..';

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
        this.setUI();
    }

    setUI() {
        if (!this.ui) { return; }
        this.ui.className = "userCard";
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

        // Update the description
        const descriptionElement = this.ui.querySelector(".todoItem > div > div > .description");
        if (descriptionElement) descriptionElement.textContent = this.description;

        // Update the status
        const statusElement = this.ui.querySelector(".todoItem > div > div > .status");
        if (statusElement) statusElement.textContent = this.status;

        // Update the priority
        const priorityElement = this.ui.querySelector(".todoItem > div > div > .priority");
        if (priorityElement) priorityElement.textContent = this.priority;

        // Update the assigned_to
        const assignedToElement = this.ui.querySelector(".todoItem > div > div > .assigned_to");
        if (assignedToElement) assignedToElement.textContent = this.assigned_to;

        // Update the created_by
        const createdByElement = this.ui.querySelector(".todoItem > div > div > .created_by");
        if (createdByElement) createdByElement.textContent = this.created_by;

        // Update the start_date
        const startDateElement = this.ui.querySelector(".todoItem > div > div > .start_date");
        if (startDateElement) startDateElement.textContent = this.start_date;

        // Update the updated_at
        const updatedAtElement = this.ui.querySelector(".todoItem > div > div > .updated_at");
        if (updatedAtElement) updatedAtElement.textContent = this.updated_at;

        // Update the estimated_hours
        const estimatedHoursElement = this.ui.querySelector(".todoItem > div > div > .estimated_hours");
        if (estimatedHoursElement) estimatedHoursElement.textContent = this.estimated_hours.toString();

        // Update the actual_hours
        const actualHoursElement = this.ui.querySelector(".todoItem > div > div > .actual_hours");
        if (actualHoursElement) actualHoursElement.textContent = this.actual_hours.toString();

        // Update the dependencies
        const dependenciesElement = this.ui.querySelector(".todoItem > div > div > .dependencies");
        if (dependenciesElement) dependenciesElement.textContent = this.dependencies.join(", ");

        // Update the progress_percentage
        const progressPercentageElement = this.ui.querySelector(".todoItem > div > div > .progress_percentage");
        if (progressPercentageElement) progressPercentageElement.textContent = this.progress_percentage;

        // Update the comments
        const commentsElement = this.ui.querySelector(".todoItem > div > div > .comments");
        if (commentsElement) commentsElement.textContent = this.comments.join(", ");
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