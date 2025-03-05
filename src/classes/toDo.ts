import { v4 as uuidv4 } from 'uuid'
import { currentProject } from './ProjectsManager'


export type toDoStatus = "Pending" | "In Progress" | "Completed" | "On Hold"
export type toDoPriority = "Low" | "Medium" | "High" | "Critical"
export type toDoPercentage = "25%" | "50%" | "75%" | "100%"


export interface ItoDo {
    //Basic Fields
    id?: string
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

export class toDo{
    //To satisfy IProject
    id: string
    title: string
    description: string
    status: "Pending" | "In Progress" | "Completed" | "On Hold"
    priority: "Low" | "Medium" | "High" | "Critical"
    project_id: string
    assigned_to: string
    created_by: string
    created_at: string
    updated_at: string
    due_date: string
    start_date: string
    completion_date: string
    estimated_hours: number
    actual_hours: number
    location: string
    category: string
    dependencies: string[]
    progress_percentage: "25%" | "50%" | "75%" | "100%"
    comments: string[]

    //Class internals
    ui: HTMLDivElement

    constructor (data: ItoDo) {
        //Allow existing id, otherwise generate a new one
        this.id = data.id || uuidv4();
        //Project data definition
        this.title = data.title
        this.description = data.description
        this.status = data.status
        this.priority = data.priority
        this.project_id = data.project_id
        this.assigned_to = data.assigned_to
        this.created_by = data.created_by
        this.created_at = data.created_at
        this.updated_at = data.updated_at
        this.due_date = data.due_date
        this.start_date = data.start_date
        this.completion_date = data.completion_date
        this.estimated_hours = data.estimated_hours
        this.actual_hours = data.actual_hours
        this.location = data.location
        this.category = data.category
        this.dependencies = data.dependencies
        this.progress_percentage = data.progress_percentage
        this.comments = data.comments

        this.setUI()
    }
    setUI() {
        if (this.ui) {return}
        this.ui = document.createElement("div")
        this.ui.className = "userCard"
        this.ui.innerHTML = `
         <!-- todoItem -->
            <div class="todoItem">
                <div style="display: flex; justify-content: space-between;flex-direction: row;align-items: center;">
                    <div style="display:flex;column-gap: 15px;">
                        <span class="material-icons-round" style="background-color: #969696; padding: 8px; border-radius: 8px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">construction</span>
                        <p>Absolutely nonsense text for testing, so I don't know what I'm writing about</p>
                    </div>
                    <p style="text-wrap: nowrap; margin-left: 10px;">Fri, 20 sep</p>
                </div>
            </div>
        `}

}