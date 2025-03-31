import { v4 as uuidv4 } from 'uuid';
import { ItoDo, toDo } from './toDo';
import { IUser, User } from './User';

export type userRole = "not defined" | "Architect" | "Engineer" | "Developer";
export type status = "Pending" | "Active" | "Finished";
export type phase = "Design" | "Construction Project" | "Execution" | "Construction";

export interface IProject {
    id?: string;
    icon: string;
    color: string;
    name: string;
    description: string;
    location: string;
    userRole: userRole;
    progress: number;
    cost: number;
    status: status;
    phase: phase;
    startDate: string;
    finishDate: string;
    toDos?: ItoDo[];
    PUsers?: IUser[];
}

// Function to generate random color
function getRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Function to slice the first two characters of each word
function sliceTwoEachWord(input: string): string {
    const words = input.trim().split(" ").filter(word => word !== "");
    
    if (words.length === 0) {
        return ""; 
    } else if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }
    
    const firstTwoWords = words.slice(0, 2); 
    const result = firstTwoWords.map(word => word.slice(0, 1).toUpperCase());
    
    return result.join("");
}

// Function to format a date to YYYY-MM-DD
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export class Project implements IProject {
    id: string;
    icon: string;
    name: string;
    color: string;
    description: string;
    location: string;
    progress: number;
    cost: number;
    userRole: userRole;
    status: status;
    phase: phase;
    startDate: string;
    finishDate: string;
    toDos: toDo[]; // Add toDos property
    PUsers: User[]; // Add users property
    ui: HTMLDivElement;

    constructor(data: IProject) {
        // Allow existing id, otherwise generate a new one
        this.id = data.id || uuidv4();

        const currentDate = new Date();
        const nextYear = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));

        const defaults = {
            name: "Default Project Name",
            description: "Default Project Description",
            userRole: "not defined",
            location: "not defined",
            progress: 0,
            cost: 0,
            status: "Pending",
            phase: "Design",
            startDate: formatDate(new Date()), // default to today's date
            finishDate: formatDate(nextYear)  // default to next year
        };

        for (const key in defaults) {
            this[key] = data[key] || defaults[key];
        }

        // Initialize toDos and users
        this.toDos = data.toDos?.map(toDoData => new toDo(toDoData)) || [];
        this.PUsers = data.PUsers?.map(userData => new User(userData)) || [];

        // Generate icon and random color
        this.icon = sliceTwoEachWord(this.name);
        this.color = getRandomColor();
        
        this.setUI();
    }

    setUI() {
        if (this.ui) { return; }
        this.ui = document.createElement("div");
        this.ui.className = "projectCard";
        this.ui.innerHTML = `
        <div class="cardHeader" style="height: 35px;">
            <p style="font-size: 20px; display: flex; align-items: center; background-color: ${this.color}; padding: 10px; width: 40px; height: 40px; justify-content: center; border-radius: 8px; aspect-ratio: 1;">
                ${this.icon}
            </p>
            <div>
                <h5>${this.name}</h5>
                <p>${this.description}</p>
            </div>
        </div>
        <div class="cardContent">
            <div class="cardProperty">
                <p style="color: #969696;">Status</p>
                <p>${this.status}</p>
            </div>
            <div class="cardProperty">
                <p style="color: #969696;">User Role</p>
                <p>${this.userRole}</p>
            </div>
            <div class="cardProperty">
                <p style="color: #969696;">Cost</p>
                <p>${this.cost}$</p>    
            </div>
            <div class="cardProperty">
                <p style="color: #969696;">Progress</p>
                <p>${this.progress}%</p>    
            </div>     
        </div>`;
    }

    updateUI() {
        if (!this.ui) {
            console.warn(`UI not found for project: ${this.name}`);
            return;
        }
    
        const header = this.ui.querySelector(".cardHeader");
        if (header) {
            const icon = header.querySelector("p");
            if (icon) icon.style.backgroundColor = this.color;
    
            const headerText = header.querySelector("h5");
            if (headerText) headerText.textContent = this.name;
    
            const description = header.querySelector("p + div p");
            if (description) description.textContent = this.description;
        }
    
        // Correct selectors for each property
        const statusElement = this.ui.querySelector(".cardProperty:nth-child(1) p:nth-child(2)");
        if (statusElement) statusElement.textContent = this.status;
    
        const userRoleElement = this.ui.querySelector(".cardProperty:nth-child(2) p:nth-child(2)");
        if (userRoleElement) userRoleElement.textContent = this.userRole;
    
        const costElement = this.ui.querySelector(".cardProperty:nth-child(3) p:nth-child(2)");
        if (costElement) costElement.textContent = `${this.cost}$`;

    
        const progressElement = this.ui.querySelector(".cardProperty:nth-child(4) p:nth-child(2)");
        if (progressElement) progressElement.textContent = `${this.progress}%`;
    }

    // Method to add a new to-do
    addToDo(data: ItoDo): toDo {
        const newToDo = new toDo(data);
        this.toDos.push(newToDo);
        return newToDo;
    }

    // Method to update an existing to-do
    updateToDo(data: ItoDo): toDo | undefined {
        const toDoInstance = this.toDos.find(toDo => toDo.id === data.id);
        if (toDoInstance) {
            toDoInstance.title = data.title ?? toDoInstance.title;
            toDoInstance.description = data.description ?? toDoInstance.description;
            toDoInstance.status = data.status ?? toDoInstance.status;
            toDoInstance.priority = data.priority ?? toDoInstance.priority;
            toDoInstance.assigned_to = data.assigned_to ?? toDoInstance.assigned_to;
            toDoInstance.project_id = data.project_id ?? toDoInstance.project_id;
            toDoInstance.created_by = data.created_by ?? toDoInstance.created_by;
            toDoInstance.created_at = data.created_at ?? toDoInstance.created_at;
            toDoInstance.updated_at = data.updated_at ?? toDoInstance.updated_at;
            toDoInstance.due_date = data.due_date ?? toDoInstance.due_date;
            toDoInstance.start_date = data.start_date ?? toDoInstance.start_date;
            toDoInstance.completion_date = data.completion_date ?? toDoInstance.completion_date;
            toDoInstance.estimated_hours = data.estimated_hours ?? toDoInstance.estimated_hours;
            toDoInstance.actual_hours = data.actual_hours ?? toDoInstance.actual_hours;
            toDoInstance.dependencies = data.dependencies ?? toDoInstance.dependencies;
            toDoInstance.progress_percentage = data.progress_percentage ?? toDoInstance.progress_percentage;
            toDoInstance.comments = data.comments ?? toDoInstance.comments;

            toDoInstance.updateUI();
            return toDoInstance;
        } else {
            throw new Error("To-Do item not found(project)");
        }
    }

    // Method to delete a to-do by its ID
    deleteToDoById(id: string): void {
        const toDoIndex = this.toDos.findIndex(toDo => toDo.id === id);
        if (toDoIndex !== -1) {
            const toDoInstance = this.toDos[toDoIndex];
            toDoInstance.deleteUI();
            this.toDos.splice(toDoIndex, 1);
            console.log(`To-do with ID ${id} deleted`); // Debugging statement
        } else {
            console.warn(`To-do with ID ${id} not found(project)`); // Debugging statement
        }
    }

    // Method to add a new user
    addUser(data: IUser): User {
        const newUser = new User(data);
        this.PUsers.push(newUser);
        return newUser;
    }

    // Method to update an existing user
    updateUser(data: IUser): User | undefined {
        const userInstance = this.PUsers.find(user => user.id === data.id);
        if (userInstance) {
            userInstance.name = data.name ?? userInstance.name;
            userInstance.surname = data.surname ?? userInstance.surname;
            userInstance.email = data.email ?? userInstance.email;
            userInstance.phone = data.phone ?? userInstance.phone;
            userInstance.role = data.role ?? userInstance.role;
            userInstance.access = data.access ?? userInstance.access;
            userInstance.company = data.company ?? userInstance.company;

            userInstance.setUI();
            return userInstance;
        } else {
            throw new Error("User not found(project)");
        }
    }

    // Method to delete a user by their ID
    deleteUserById(id: string): void {
        const userIndex = this.PUsers.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.PUsers.splice(userIndex, 1);
            console.log(`User with ID ${id} deleted`); // Debugging statement
        } else {
            console.warn(`User with ID ${id} not found(project)`); // Debugging statement
        }
    }
}