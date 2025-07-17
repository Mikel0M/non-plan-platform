import { v4 as uuidv4 } from 'uuid';
import { ItoDo, toDo } from './toDo';
import { IUser, User } from './User';

export type userRole = "not defined" | "Architect" | "Engineer" | "Developer";
export type status = "Pending" | "Active" | "Finished";
export type phase = "Design" | "Construction project" | "Execution" | "Construction";  // Updated to match Firestore

export interface IProject {
    id?: string;
    icon: string;
    color: string;
    name: string;
    description: string;
    location: string;
    plotNumber?: string;  // Plot/parcel number for construction projects
    latitude?: number;  // Geographic coordinates for mapping
    longitude?: number;
    userRole: userRole;
    progress: number;
    cost: number;
    status: status;
    phase: phase;
    startDate: string;
    finishDate: string;
    companyId?: string;  // Reference to company
    createdBy?: string;  // User ID who created the project
    createdAt?: string | Date;  // Creation timestamp
    modifiedAt?: string | Date;  // Modified timestamp (Firebase structure)
    modifiedBy?: string;  // User ID who modified the project
    
    // ✅ KEEP: Embedded todos (as confirmed they're embedded in Firestore)
    toDos?: ItoDo[];
    
    // ✅ KEEP: User references only (not full user objects)
    assignedUsers?: Array<{ userId: string, role: string }>;
    
    // ❌ REMOVE: Don't embed full users since you have /users collection
    // PUsers?: IUser[];  // This conflicts with separate /users collection
}

// Function to generate random color
export function getRandomColor(): string {
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

// Function to clean undefined values for Firebase - More aggressive version
function cleanForFirebase(obj: any): any {
    if (obj === null || obj === undefined) {
        return null;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => cleanForFirebase(item)).filter(item => item !== null && item !== undefined);
    }
    
    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
            const value = obj[key];
            if (value !== undefined && value !== null) {
                const cleanedValue = cleanForFirebase(value);
                if (cleanedValue !== null && cleanedValue !== undefined) {
                    cleaned[key] = cleanedValue;
                }
            }
        }
        return cleaned;
    }
    
    return obj;
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
    plotNumber?: string;  // Add new field
    latitude?: number;    // Add new field
    longitude?: number;   // Add new field
    progress!: number;
    cost!: number;
    userRole!: userRole;
    status!: status;
    phase!: phase;
    startDate!: string;
    finishDate!: string;
    companyId?: string;
    createdBy?: string;
    createdAt?: string | Date;
    modifiedAt?: string | Date;
    modifiedBy?: string;
    toDos: toDo[]; // Embedded toDos
    assignedUsers: Array<{ userId: string, role: string }> = []; // User references only

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
            phase: "Design" as phase,  // Updated to match Firestore
            startDate: formatDate(new Date()), // default to today's date
            finishDate: formatDate(nextYear)  // default to next year
        };

        // Explicitly assign each property
        this.name = data.name || defaults.name;
        this.description = data.description || defaults.description;
        this.userRole = data.userRole || defaults.userRole;
        this.location = data.location || defaults.location;
        this.plotNumber = data.plotNumber;  // Keep as optional
        this.latitude = data.latitude;      // Keep as optional
        this.longitude = data.longitude;    // Keep as optional
        this.progress = data.progress ?? defaults.progress;
        this.cost = data.cost ?? defaults.cost;
        this.status = data.status || defaults.status;
        this.phase = data.phase || defaults.phase;
        this.startDate = data.startDate || defaults.startDate;
        this.finishDate = data.finishDate || defaults.finishDate;
        
        // Initialize new fields with proper defaults
        this.companyId = data.companyId || undefined;
        this.createdBy = data.createdBy || undefined;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.modifiedAt = data.modifiedAt || new Date().toISOString();
        this.modifiedBy = data.modifiedBy || undefined;

        // Initialize toDos and assignedUsers
        this.toDos = data.toDos?.map(toDoData => new toDo(toDoData)) || [];
        this.assignedUsers = data.assignedUsers || [];

        // Generate icon and use provided color or generate random color
        this.icon = data.icon || sliceTwoEachWord(this.name) || "DP"; // Default to "DP" if sliceTwoEachWord returns empty
        this.color = data.color || getRandomColor();
        
    }

    // Pure data method for updating project properties
    update(data: Partial<IProject>) {
        if (data.name !== undefined) this.name = data.name;
        if (data.description !== undefined) this.description = data.description;
        if (data.userRole !== undefined) this.userRole = data.userRole;
        if (data.location !== undefined) this.location = data.location;
        if (data.plotNumber !== undefined) this.plotNumber = data.plotNumber;
        if (data.latitude !== undefined) this.latitude = data.latitude;
        if (data.longitude !== undefined) this.longitude = data.longitude;
        if (data.progress !== undefined) this.progress = data.progress;
        if (data.cost !== undefined) this.cost = data.cost;
        if (data.status !== undefined) this.status = data.status;
        if (data.phase !== undefined) this.phase = data.phase;
        if (data.startDate !== undefined) this.startDate = data.startDate;
        if (data.finishDate !== undefined) this.finishDate = data.finishDate;
        if (data.companyId !== undefined) this.companyId = data.companyId;
        if (data.createdBy !== undefined) this.createdBy = data.createdBy;
        if (data.createdAt !== undefined) this.createdAt = data.createdAt;
        if (data.modifiedBy !== undefined) this.modifiedBy = data.modifiedBy;
        
        // Update timestamps
        this.modifiedAt = new Date().toISOString();
        
        // Regenerate icon if name changed
        if (data.name !== undefined) {
            this.icon = sliceTwoEachWord(this.name);
        }
    }

    // Convert to JSON for serialization (clean undefined values for Firebase)
    toJSON(): IProject {
        // Create a safe object with explicit null checks
        const data: any = {};
        
        // Required fields with fallbacks
        data.id = this.id || uuidv4();
        data.icon = this.icon || "DP";
        data.color = this.color || "#FFFFFF";
        data.name = this.name || "Untitled Project";
        data.description = this.description || "";
        data.location = this.location || "";
        data.userRole = this.userRole || "not defined";
        data.progress = this.progress || 0;
        data.cost = this.cost || 0;
        data.status = this.status || "Pending";
        data.phase = this.phase || "Design";
        data.startDate = this.startDate || new Date().toISOString().split('T')[0];
        data.finishDate = this.finishDate || new Date().toISOString().split('T')[0];
        data.createdAt = this.createdAt || new Date().toISOString();
        data.modifiedAt = this.modifiedAt || new Date().toISOString();
        data.toDos = this.toDos?.map(todo => todo.toJSON()) || [];
        data.assignedUsers = this.assignedUsers || [];
        
        // Optional fields - only include if they have values
        if (this.companyId) data.companyId = this.companyId;
        if (this.createdBy) data.createdBy = this.createdBy;
        if (this.modifiedBy) data.modifiedBy = this.modifiedBy;
        
        // Include new location fields if they exist
        if (this.plotNumber) data.plotNumber = this.plotNumber;
        if (this.latitude !== undefined) data.latitude = this.latitude;
        if (this.longitude !== undefined) data.longitude = this.longitude;
        
        return data;
    }

    // Method to add a new to-do
    addToDo(data: ItoDo): toDo {
        const newToDo = new toDo(data);
        this.toDos.push(newToDo);
        
        // Update modification timestamps
        this.modifiedAt = new Date().toISOString();
        
        // Sync with Firebase if possible
        this.syncToFirebase();
        
        return newToDo;
    }

    // Method to update an existing to-do
    updateToDo(data: ItoDo): toDo | undefined {
        const toDoInstance = this.toDos.find(toDo => toDo.id === data.id);
        if (toDoInstance) {
            toDoInstance.update(data);
            
            // Update modification timestamps
            this.modifiedAt = new Date().toISOString();
            this.modifiedAt = new Date().toISOString();
            
            // Sync with Firebase if possible
            this.syncToFirebase();
            
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
            
            // Update modification timestamps
            this.modifiedAt = new Date().toISOString();
            this.modifiedAt = new Date().toISOString();
            
            // Sync with Firebase if possible
            this.syncToFirebase();
        } else {
            console.warn(`To-do with ID ${id} not found(project)`); // Debugging statement
        }
    }

    // ✅ NEW: User reference management methods (replaces embedded user methods)
    
    // Method to add a user to the project (by reference)
    addUserToProject(userId: string, role: string): void {
        // Check if user is already assigned
        const existingAssignment = this.assignedUsers.find(assignment => assignment.userId === userId);
        if (!existingAssignment) {
            this.assignedUsers.push({ userId, role });
            
            // Update modification timestamps
            this.modifiedAt = new Date().toISOString();
            this.modifiedAt = new Date().toISOString();
            
            this.syncToFirebase();
        }
    }

    // Method to update a user's role in the project
    updateUserRole(userId: string, newRole: string): void {
        const assignment = this.assignedUsers.find(assignment => assignment.userId === userId);
        if (assignment) {
            assignment.role = newRole;
            
            // Update modification timestamps
            this.modifiedAt = new Date().toISOString();
            this.modifiedAt = new Date().toISOString();
            
            this.syncToFirebase();
        } else {
            throw new Error("User not assigned to this project");
        }
    }

    // Method to remove a user from the project
    removeUserFromProject(userId: string): void {
        const index = this.assignedUsers.findIndex(assignment => assignment.userId === userId);
        if (index !== -1) {
            this.assignedUsers.splice(index, 1);
            console.log(`User with ID ${userId} removed from project`);
            
            // Update modification timestamps
            this.modifiedAt = new Date().toISOString();
            this.modifiedAt = new Date().toISOString();
            
            this.syncToFirebase();
        } else {
            console.warn(`User with ID ${userId} not found in project`);
        }
    }

    // Method to get user IDs assigned to this project
    getAssignedUserIds(): string[] {
        return this.assignedUsers.map(assignment => assignment.userId);
    }

    // Method to sync current project state with Firebase
    private async syncToFirebase(): Promise<void> {
        if (!this.id) return;
        
        try {
            // Dynamic import to avoid circular dependency
            const { updateDocument, getCollection } = await import('../firebase');
            const { doc, getDoc } = await import('firebase/firestore');
            
            // Check if the project exists in Firebase first
            const projectRef = doc(getCollection<IProject>("/projects"), this.id);
            const projectSnapshot = await getDoc(projectRef);
            
            if (projectSnapshot.exists()) {
                // Project exists, so we can update it
                await updateDocument<Partial<IProject>>("/projects", this.id, cleanForFirebase(this.toJSON()));
            } else {
                // Project doesn't exist in Firebase yet, skip the sync
                // This can happen during project creation process
                console.debug(`Project ${this.id} doesn't exist in Firebase yet, skipping sync`);
            }
        } catch (error) {
            console.warn('Failed to sync project with Firebase:', error);
        }
    }
}
