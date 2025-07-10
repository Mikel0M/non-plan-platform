import { v4 as uuidv4 } from 'uuid';
import { usersManagerInstance } from "./UsersManager";

export type usersRole = "architect" | "engineer" | "developer";  // Changed to lowercase to match database
export type access = "Administrator" | "Editor" | "Guest";

export interface IUser {
    id?: string;
    color: string;
    companyId: string;
    companyRole: string;
    createdAt?: string | Date;
    displayName?: string; 
    email: string;
    icon: string;
    invitedAt?: string | Date;
    invitedBy: string;
    isActive?: boolean;
    joinedAt?: string | Date;
    lastLogin?: string | Date;
    name: string;
    notifications?: boolean;
    permissions: string;
    phone: string;
    preferences?: {
        language: string;
        timezone: string;
    };
    role: string;  // Changed from usersRole to string to match "architect"
    surname: string;
    
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
    // To satisfy IUser interface
    id?: string;
    color: string;
    companyId: string;
    companyRole: string;
    createdAt?: string | Date;
    displayName?: string;
    email: string;
    icon: string;
    invitedAt?: string | Date;
    invitedBy: string;
    isActive?: boolean;
    joinedAt?: string | Date;
    lastLogin?: string | Date;
    name: string;
    notifications?: boolean;
    permissions: string;
    phone: string;
    preferences?: {
        language: string;
        timezone: string;
    };
    role: string;  // Changed from usersRole to string to match "architect"
    surname: string;

    constructor(data: IUser) {
        // Allow existing id, otherwise generate a new one
        this.id = data.id || uuidv4();

        // User data definition
        this.name = data.name;
        this.surname = data.surname;
        this.email = data.email;
        this.phone = data.phone;
        this.role = data.role;
        this.permissions = data.permissions;
        this.companyId = data.companyId;
        this.companyRole = data.companyRole;
        this.invitedBy = data.invitedBy;
        this.createdAt = data.createdAt;
        this.displayName = data.displayName;
        this.invitedAt = data.invitedAt;
        this.isActive = data.isActive;
        this.joinedAt = data.joinedAt;
        this.lastLogin = data.lastLogin;
        this.notifications = data.notifications;
        this.preferences = data.preferences;

        // Generate icon and random color (respecting existing values)
        this.icon = data.icon || sliceTwoEachWord(this.name);
        this.color = data.color || getRandomColor();
    }

    
    // Pure data methods for updating user properties
    update(data: Partial<IUser>) {
        if (data.name !== undefined) this.name = data.name;
        if (data.surname !== undefined) this.surname = data.surname;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.role !== undefined) this.role = data.role;
        if (data.permissions !== undefined) this.permissions = data.permissions;
        if (data.companyId !== undefined) this.companyId = data.companyId;
        if (data.companyRole !== undefined) this.companyRole = data.companyRole;
        if (data.invitedBy !== undefined) this.invitedBy = data.invitedBy;
        if (data.createdAt !== undefined) this.createdAt = data.createdAt;
        if (data.displayName !== undefined) this.displayName = data.displayName;
        if (data.invitedAt !== undefined) this.invitedAt = data.invitedAt;
        if (data.isActive !== undefined) this.isActive = data.isActive;
        if (data.joinedAt !== undefined) this.joinedAt = data.joinedAt;
        if (data.lastLogin !== undefined) this.lastLogin = data.lastLogin;
        if (data.notifications !== undefined) this.notifications = data.notifications;
        if (data.preferences !== undefined) this.preferences = data.preferences;
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.color !== undefined) this.color = data.color;
        
        // Regenerate icon if name changed and no icon provided
        if (data.name !== undefined && !data.icon) {
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
            permissions: this.permissions,
            companyId: this.companyId,
            companyRole: this.companyRole,
            invitedBy: this.invitedBy,
            icon: this.icon,
            color: this.color,
            createdAt: this.createdAt,
            displayName: this.displayName,
            invitedAt: this.invitedAt,
            isActive: this.isActive,
            joinedAt: this.joinedAt,
            lastLogin: this.lastLogin,
            notifications: this.notifications,
            preferences: this.preferences
        };
    }

    // Get full name helper
    getFullName(): string {
        return `${this.name} ${this.surname}`;
    }
}

