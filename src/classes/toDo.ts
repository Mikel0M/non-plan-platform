import { v4 as uuidv4 } from 'uuid';

// Function to clean undefined values for Firebase
function cleanForFirebase(obj: any): any {
    if (obj === null || obj === undefined) {
        return null;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => cleanForFirebase(item));
    }
    
    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                cleaned[key] = cleanForFirebase(obj[key]);
            }
        }
        return cleaned;
    }
    
    return obj;
}

export type toDoStatus = "Pending" | "In Progress" | "Completed" | "On Hold";
export type toDoPriority = "Low" | "Medium" | "High" | "Critical";
export type toDoPercentage = "0%" | "25%" | "50%" | "75%" | "100%";

// SubToDo interface matching Firestore structure (single object, not array)
export interface ISubToDo {
    assignedTo: string;
    description: string;
    endDate: string | Date;      // Firestore shows timestamp
    isComplete: boolean;
    name: string;                // Firestore uses 'name', not 'title'
    startDate: string | Date;    // Firestore shows timestamp
}

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
    
    // New fields matching Firestore structure
    isComplete?: boolean;
    subToDo?: ISubToDo;          // Single object, not array
    modifiedAt?: string;
    modifiedBy?: string;
    phase?: string;              // Added phase field from Firestore
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
    
    // New fields matching Firestore structure
    isComplete: boolean;
    subToDo?: ISubToDo;          // Single object, not array
    modifiedAt?: string;
    modifiedBy?: string;
    phase?: string;              // Added phase field from Firestore

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
        // Ensure dependencies is always a string[]
        this.dependencies = data.dependencies || [];
        this.progress_percentage = data.progress_percentage;
        this.comments = data.comments || [];
        
        // Initialize new fields
        this.isComplete = data.isComplete || false;
        this.subToDo = data.subToDo || undefined;  // Single object or undefined
        this.modifiedAt = data.modifiedAt;
        this.modifiedBy = data.modifiedBy;
        this.phase = data.phase;
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

    // Update method to modify toDo data
    update(data: Partial<ItoDo>): void {
        if (data.title !== undefined) this.title = data.title;
        if (data.description !== undefined) this.description = data.description;
        if (data.status !== undefined) this.status = data.status;
        if (data.priority !== undefined) this.priority = data.priority;
        if (data.assigned_to !== undefined) this.assigned_to = data.assigned_to;
        if (data.created_by !== undefined) this.created_by = data.created_by;
        if (data.due_date !== undefined) this.due_date = data.due_date;
        if (data.start_date !== undefined) this.start_date = data.start_date;
        if (data.completion_date !== undefined) this.completion_date = data.completion_date;
        if (data.estimated_hours !== undefined) this.estimated_hours = data.estimated_hours;
        if (data.actual_hours !== undefined) this.actual_hours = data.actual_hours;
        if (data.dependencies !== undefined) this.dependencies = data.dependencies;
        if (data.progress_percentage !== undefined) this.progress_percentage = data.progress_percentage;
        if (data.comments !== undefined) this.comments = data.comments;
        if (data.isComplete !== undefined) this.isComplete = data.isComplete;
        if (data.subToDo !== undefined) this.subToDo = data.subToDo;
        if (data.modifiedBy !== undefined) this.modifiedBy = data.modifiedBy;
        if (data.phase !== undefined) this.phase = data.phase;
        
        this.updated_at = new Date().toISOString();
        this.modifiedAt = new Date().toISOString();
    }

    // Convert to plain object for JSON serialization (clean undefined values for Firebase)
    toJSON(): ItoDo {
        const data = {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            project_id: this.project_id,
            assigned_to: this.assigned_to,
            created_by: this.created_by,
            created_at: this.created_at,
            updated_at: this.updated_at,

            due_date: this.due_date,
            start_date: this.start_date,
            completion_date: this.completion_date,
            estimated_hours: this.estimated_hours,
            actual_hours: this.actual_hours,
            dependencies: this.dependencies,
            progress_percentage: this.progress_percentage,
            comments: this.comments,
            isComplete: this.isComplete,
            subToDo: this.subToDo,
            modifiedAt: this.modifiedAt,
            modifiedBy: this.modifiedBy,
            phase: this.phase,
        };
        
        return cleanForFirebase(data);
    }

    // Method to set subToDo (single object)
    setSubToDo(subToDo: ISubToDo): void {
        this.subToDo = subToDo;
        this.update({});  // Triggers updated_at and modifiedAt update
    }

    // Method to update subToDo
    updateSubToDo(subToDo: Partial<ISubToDo>): void {
        if (this.subToDo) {
            this.subToDo = { ...this.subToDo, ...subToDo };
            this.update({});  // Triggers updated_at and modifiedAt update
        }
    }

    // Method to remove subToDo
    removeSubToDo(): void {
        this.subToDo = undefined;
        this.update({});  // Triggers updated_at and modifiedAt update
    }

    // Method to toggle isComplete status
    toggleComplete(): void {
        this.isComplete = !this.isComplete;
        this.update({});  // Triggers updated_at and modifiedAt update
    }
}
