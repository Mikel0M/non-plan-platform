export type toDoStatus = "Pending" | "In Progress" | "Completed" | "On Hold"
export type toDoPriority = "Low" | "Medium" | "High" | "Critical"
export type toDoPercentage = "25%" | "50%" | "75%" | "100%"


export interface ItoDo {
    //Basic Fields
    id?: number
    title: string
    description: string
    status: toDoStatus
    priority: toDoPriority
    // Project&Assignment
    project_id: string
    assigned_to: string
    created_by: string
    created_at: string
    updated_at: string
    //Time Management
    due_date: string
    start_date: string
    completion_date: string
    estimated_hours: number
    actual_hours: number
    // Construction-Specific
    location: string
    category: string
    dependencies: string[]
    //Progress Tracking
    progress_percentage: toDoPercentage
    comments: string[]



}