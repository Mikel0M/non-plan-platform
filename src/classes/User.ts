import { v4 as uuidv4 } from 'uuid';
import { usersManagerInstance } from "./UsersManager";

export type usersRole = "Architect" | "Engineer" | "Developer";
export type access = "Administrator" | "Editor" | "Guest";

export interface IUser {
    id?: string;
    icon: string;
    color: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    role: usersRole;
    access: access;
    company: string;
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

export class User implements IUser {
    // To satisfy IUser
    name: string;
    surname: string;
    icon: string;
    color: string;
    email: string;
    phone: string;
    role: usersRole;
    access: access;
    company: string;
    id: string;

    constructor(data: IUser) {
        // Allow existing id, otherwise generate a new one
        this.id = data.id || uuidv4();

        // User data definition
        this.name = data.name;
        this.surname = data.surname;
        this.email = data.email;
        this.phone = data.phone;
        this.role = data.role;
        this.access = data.access;
        this.company = data.company;

        // Generate icon and random color
        this.icon = sliceTwoEachWord(this.name);
        this.color = getRandomColor();
    }

    
    // Pure data methods for updating user properties
    update(data: Partial<IUser>) {
        if (data.name !== undefined) this.name = data.name;
        if (data.surname !== undefined) this.surname = data.surname;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.role !== undefined) this.role = data.role;
        if (data.access !== undefined) this.access = data.access;
        if (data.company !== undefined) this.company = data.company;
        
        // Regenerate icon if name changed
        if (data.name !== undefined) {
            this.icon = sliceTwoEachWord(this.name);
        }
    }

    // Convert to JSON for serialization
    toJSON(): IUser {
        return {
            id: this.id,
            name: this.name,
            surname: this.surname,
            email: this.email,
            phone: this.phone,
            role: this.role,
            access: this.access,
            company: this.company,
            icon: this.icon,
            color: this.color
        };
    }

    // Get full name helper
    getFullName(): string {
        return `${this.name} ${this.surname}`;
    }
}

