import { v4 as uuidv4 } from 'uuid'

export type userRole = "not defined" | "Architect" | "Engineer" | "Developer"
export type status = "Pending" | "Active" | "Finished"
export type phase = "Design" | "Contruction Project" | "Execution" | "Construction"

export interface IProject {
    icon: string
    color: string
    name: string
    description: string
    location: string
    userRole: userRole
    cost: number
    status: status
    phase: phase
    startDate: Date
    finishDate: Date
}

function getRandomColor() {
    // Generate a random integer between 0 and 255 for each color component
    const r = Math.floor(Math.random() * 256); // Red
    const g = Math.floor(Math.random() * 256); // Green
    const b = Math.floor(Math.random() * 256); // Blue

    // Convert each component to a 2-digit hex value and concatenate them
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function sliceTwoEachWord(input) {
    // Split the string into words and filter out empty entries
    const words = input.trim().split(" ").filter(word => word !== "");

    if (words.length === 0) {
        return ""; // Return an empty string if no valid words exist
    } else if (words.length === 1) {
        // If there's only one word, return its first two letters in uppercase
        return words[0].slice(0, 2).toUpperCase();
    }

    // If there are two or more words, process only the first two
    const firstTwoWords = words.slice(0, 2); // Get the first two words
    const result = firstTwoWords.map(word => word.slice(0, 1).toUpperCase());

    // Join and return the resulting letters
    return result.join("");
}

export class Project implements IProject{
    //To satisfy IProject
    icon: string
    name: string
    color: string
    description: string
    location: string
    cost: number
    userRole: "not defined" |"Architect" | "Engineer" | "Developer"
    status: "Pending" | "Active" | "Finished"
    phase: "Design" | "Contruction Project" | "Execution" | "Construction"
    startDate: Date
    finishDate: Date

    //Class internals
    ui: HTMLDivElement
    //cost: number = 0
    progress: number = 0
    id: string

    constructor(data: IProject) {
        // Project data definition default values
        const defaults = {
            name: "Default Project Name",
            description: "Default Project Description",
            userRole: "not defined",
            location: "not defined",
            cost: 0,
            status: "Pending",
            phase: "Design",
            startDate: new Date(),
            finishDate: new Date(),
        };
        //Project data definition
        for (const key in defaults) {
            this[key] = data[key] || defaults[key];
        }
<<<<<<< HEAD
        this.icon = sliceTwoEachWord(this.name)
        this.id = uuidv4()
        this.setUI()
=======
    
        this.icon = sliceTwoEachWord(this.name);
        this.color = getRandomColor();
        this.id = uuidv4();
        this.setUI();

>>>>>>> projectDetails
    }

    setUI() {
        if (this.ui) {return}
        this.ui = document.createElement("div")
        this.ui.className = "projectCard"
        this.ui.innerHTML = `
        <div class = "cardHeader" style="height: 35px;">
            <p style="font-size: 20px;display:flex; align-items: center; background-color:${this.color}; padding: 10xp;width: 40px;height: 40px ;justify-content: center;border-radius: 8px; aspect-ratio: 1;">${this.icon}</p>
            <div>
                <h5>${this.name}</h5>
                <p>${this.description}</p>
            </div>
        </div>
        <div class = "cardContent">
            <div class = "cardProperty">
                <p style = "color: #969696;">Status</p>
                <p>${this.status}</p>
            </div>
            <div class = "cardProperty">
                <p style = "color: #969696;">User Role</p>
                <p>${this.userRole}</p>
            </div>
            <div class = "cardProperty">
                <p style = "color: #969696;">Cost</p>
                <p>${this.cost}$</p>    
            </div>
            <div class = "cardProperty">
                <p style = "color: #969696;">Progress</p>
                <p>${this.progress * 100}%</p>    
            </div>      
        </div>`}
}