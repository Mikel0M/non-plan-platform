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
    assignedUsers?: Array<{ userId: string, role: string }>; // userId and custom role per project
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
        return words[0]?.slice(0, 2).toUpperCase() || "";
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
    icon!: string;
    name!: string;
    color!: string;
    description!: string;
    location!: string;
    progress!: number;
    cost!: number;
    userRole!: userRole;
    status!: status;
    phase!: phase;
    startDate!: string;
    finishDate!: string;
    toDos: toDo[]; // Add toDos property
    PUsers: User[]; // Add users property
    assignedUsers: Array<{ userId: string, role: string }> = [];

    constructor(data: IProject) {
        // Allow existing id, otherwise generate a new one
        this.id = data.id || uuidv4();

        const currentDate = new Date();
        const nextYear = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));

        const defaults = {
            name: "Default Project Name",
            description: "Default Project Description",
            userRole: "not defined" as userRole,
            location: "not defined",
            progress: 0,
            cost: 0,
            status: "Pending" as status,
            phase: "Design" as phase,
            startDate: formatDate(new Date()), // default to today's date
            finishDate: formatDate(nextYear)  // default to next year
        };

        // Explicitly assign each property
        this.name = data.name || defaults.name;
        this.description = data.description || defaults.description;
        this.userRole = data.userRole || defaults.userRole;
        this.location = data.location || defaults.location;
        this.progress = data.progress ?? defaults.progress;
        this.cost = data.cost ?? defaults.cost;
        this.status = data.status || defaults.status;
        this.phase = data.phase || defaults.phase;
        this.startDate = data.startDate || defaults.startDate;
        this.finishDate = data.finishDate || defaults.finishDate;

        // Initialize toDos and users
        this.toDos = data.toDos?.map(toDoData => new toDo(toDoData)) || [];
        this.PUsers = data.PUsers?.map(userData => new User(userData)) || [];
        this.assignedUsers = data.assignedUsers || [];

        // Generate icon and random color
        this.icon = sliceTwoEachWord(this.name);
        this.color = getRandomColor();
        
    }

    // Pure data method for updating project properties
    update(data: Partial<IProject>) {
        if (data.name !== undefined) this.name = data.name;
        if (data.description !== undefined) this.description = data.description;
        if (data.userRole !== undefined) this.userRole = data.userRole;
        if (data.location !== undefined) this.location = data.location;
        if (data.progress !== undefined) this.progress = data.progress;
        if (data.cost !== undefined) this.cost = data.cost;
        if (data.status !== undefined) this.status = data.status;
        if (data.phase !== undefined) this.phase = data.phase;
        if (data.startDate !== undefined) this.startDate = data.startDate;
        if (data.finishDate !== undefined) this.finishDate = data.finishDate;
        
        // Regenerate icon if name changed
        if (data.name !== undefined) {
            this.icon = sliceTwoEachWord(this.name);
        }
    }

    // Convert to JSON for serialization
    toJSON(): IProject {
        return {
            id: this.id,
            icon: this.icon,
            color: this.color,
            name: this.name,
            description: this.description,
            location: this.location,
            userRole: this.userRole,
            progress: this.progress,
            cost: this.cost,
            status: this.status,
            phase: this.phase,
            startDate: this.startDate,
            finishDate: this.finishDate,
            toDos: this.toDos.map(todo => todo.toJSON()),
            PUsers: this.PUsers.map(user => user.toJSON()),
            assignedUsers: this.assignedUsers
        };
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
            toDoInstance.update(data);
            return toDoInstance;
        } else {
            throw new Error("To-Do item not found(project)");
        }
    }

    // Method to delete a to-do by its ID
    deleteToDoById(id: string): void {
        const toDoIndex = this.toDos.findIndex(toDo => toDo.id === id);
        if (toDoIndex !== -1) {
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
            userInstance.update(data);
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