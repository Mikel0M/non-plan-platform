import { v4 as uuidv4 } from 'uuid'

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
    cost: number;
    status: status;
    phase: phase;
    startDate: string;
    finishDate: string;
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
    icon: string;
    name: string;
    color: string;
    description: string;
    location: string;
    cost: number;
    userRole: userRole;
    status: status;
    phase: phase;
    startDate: string;
    finishDate: string;
    ui: HTMLDivElement;
    progress: number = 0;
    id: string;

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
            cost: 0,
            status: "Pending",
            phase: "Design",
            startDate: formatDate(new Date()), // default to today's date
            finishDate: formatDate(nextYear)  // default to next year
        };

        for (const key in defaults) {
            this[key] = data[key] || defaults[key];
        }

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
                <p>${this.progress * 100}%</p>    
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
        if (progressElement) progressElement.textContent = `${this.progress * 100}%`;
    }
}
