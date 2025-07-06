import { IProject, Project, userRole, status, phase } from "./Project";
import { toDoManagerInstance, toDos } from "./toDoManager"; // Import toDos array
import { IUser, User } from "./User";
import { users } from "./UsersManager";
import { companiesManagerInstance } from "./CompaniesManager";

export let currentProject: Project | null = null; // Ensure it's globally accessible

export class ProjectsManager {
    list: Project[] = [];
    onProjectCreated = (_project: Project) => {}; // Callback for when a project is created
    onProjectDeleted = () => {}; 
    onProjectUpdated = (_project: Project) => {}; // Callback for when a project is updated
    onProjectError?: (errorMessage: string) => void; // Callback for error handling
    currentProject: Project | null = null;
    projectsListContainer: HTMLElement | null = null; // To hold the #projectsList container

    // Method to find a project by its ID
    findProjectById(id: string): Project | undefined {
        return this.list.find(project => project.id === id);
    }

    // Method to update an existing project with provided data
    updateProject(id: string, data: IProject): Project {
        const existingProjectIndex = this.list.findIndex(project => project.id === id);
        
        if (existingProjectIndex === -1) {
            throw new Error(`Project with ID ${id} not found`);
        }

        // Update the existing project with new data
        const updatedProject = new Project(data);
        this.list[existingProjectIndex] = updatedProject;

        // Trigger update callback
        this.onProjectUpdated(updatedProject);

        return updatedProject;
    }

    newProject(data: IProject, id?: string) {
        // Check for duplicate names first
        const projectNames = this.list.map((project) => project.name);
        const nameInUse = projectNames.includes(data.name);
        
        if (nameInUse) {
            const errorMessage = `A project with the name "${data.name}" already exists.`;
            if (this.onProjectError) {
                this.onProjectError(errorMessage);
            }
            throw new Error(errorMessage);
        }

        // Check for minimum name length
        if (data.name.length < 5) {
            const errorMessage = `A valid project name should have at least 5 characters.`;
            if (this.onProjectError) {
                this.onProjectError(errorMessage);
            }
            throw new Error(errorMessage);
        }

        // Create and add the project
        const project = new Project(data);
        this.list.push(project);
        this.onProjectCreated(project);

        // Handle modal setup only if DOM elements exist (legacy support)
        this.setupToDoModalIfExists(data);

        return project;
    }

    private setupToDoModalIfExists(data: IProject) {
        const newtoDoModalBtn = document.getElementById("newToDoBtn");
        const modaltoDo = document.getElementById("newToDoModal") as HTMLDialogElement;
        if (newtoDoModalBtn && modaltoDo) {
            const name = modaltoDo.querySelector("[data-project-info='toDoProjectName']");
            const projectID = modaltoDo.querySelector("[data-project-info='toDoProjectID']");
            if (name) { name.textContent = data.name }
            if (projectID) { projectID.textContent = data.id ? data.id : "" }
            newtoDoModalBtn.addEventListener("click", () => { modaltoDo.showModal() })
        }
    }

    refreshModalToDo(project: Project): void {
        const modaltoDo = document.getElementById("newToDoModal") as HTMLDialogElement;
        const name = modaltoDo.querySelector("[data-project-info='toDoProjectName']");
            if (name) { name.textContent = project.name}
    }

    updateProjectData(projectId: string) {
        const project = this.getProject(projectId);

        if (!project) {
            console.warn("No project found with the provided ID.");
            return;
        }

        const getInputValue = (id: string): string => {
            const input = document.getElementById(id) as HTMLInputElement;
            return input ? input.value : "";
        };

        // Update project properties
        project.name = getInputValue("projectNameInput");
        project.location = getInputValue("projectLocationInput");
        project.description = getInputValue("projectDescriptionInput");
        project.progress = parseFloat(getInputValue("projectProgressInput")) || 0;
        project.cost = parseFloat(getInputValue("projectCostInput")) || 0;

        // Validate and update status
        const statusValue = getInputValue("projectStatusInput") as status;
        if (["Pending", "Active", "Finished"].includes(statusValue)) {
            project.status = statusValue;
        } else {
            console.warn(`Invalid status: ${statusValue}`);
        }

        // Validate and update userRole
        const roleValue = getInputValue("projectRoleInput") as userRole;
        if (["not defined", "Architect", "Engineer", "Developer"].includes(roleValue)) {
            project.userRole = roleValue;
        } else {
            console.warn(`Invalid userRole: ${roleValue}`);
        }

        // Validate and update phase
        const phaseValue = getInputValue("projectPhaseInput") as phase;
        if (["Design", "Contruction Project", "Execution", "Construction"].includes(phaseValue)) {
            project.phase = phaseValue;
        } else {
            console.warn(`Invalid phase: ${phaseValue}`);
        }

        project.startDate = getInputValue("projectStartPDInput");
        project.finishDate = getInputValue("projectFinishPDInput");
    }

    // Legacy methods for backward compatibility - use callbacks instead
    showErrorModalShortName() {
        const errorMessage = `A valid project name should have at least 5 characters.`;
        
        // Try to use callback first
        if (this.onProjectError) {
            this.onProjectError(errorMessage);
            return;
        }

        // Fallback to DOM manipulation if callback not set
        const modal = document.getElementById("newProjectErrorModal") as HTMLDialogElement;
        if (!modal) {
            console.warn("Error modal not found");
            return;
        }

        const errorMessageElement = modal.querySelector("#errorMessage");
        if (errorMessageElement) {
            errorMessageElement.textContent = errorMessage;
        }
        modal.showModal();
    }

    showErrorModalDupName(repeatedName: string) {
        const errorMessage = `A project with the name "${repeatedName}" already exists.`;
        
        // Try to use callback first
        if (this.onProjectError) {
            this.onProjectError(errorMessage);
            return;
        }

        // Fallback to DOM manipulation if callback not set
        const modal = document.getElementById("newProjectErrorModal") as HTMLDialogElement;
        if (!modal) {
            console.warn("Error modal not found");
            return;
        }

        const errorMessageElement = modal.querySelector("#errorMessage");
        if (errorMessageElement) {
            errorMessageElement.textContent = errorMessage;
        }
        modal.showModal();
    }

    getProject(id: string) {
        const project = this.list.find((project) => project.id === id);
        return project;
    }

    deleteProject(id: string) {
        const project = this.getProject(id);
        if (!project) { return }
        const remaining = this.list.filter((project) => {
            return project.id !== id;
        })
        this.list = remaining
        this.onProjectDeleted();
    }

    getProjectbyName(name: string) {
        const project = this.list.find((project) => {
            return project.name === name;
        });
        return project;
    }

    getTotalCostAllProjects() {
        let totalCost: number = 0;
        this.list.forEach((project) => {
            totalCost += project.cost;
        });
        return totalCost;
    }

    updateProgressBar(progress: number) {
        const progressBar = document.querySelector('.progress-bar') as HTMLElement;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    exportToJSON() {
        const json = JSON.stringify(this.list, null, 2);
        const dataURL = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`;
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'projects.json';
        link.click();
    }

    importFromJSON(onComplete?: () => void) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.list = data.map((projectData: IProject) => new Project(projectData));
                        if (onComplete) onComplete();
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // Method to filter to-dos by project ID (data only, UI handled by React)
    filterToDosByProjectId(projectId: string): any[] {
        return toDos.filter((toDo: any) => toDo.projectId === projectId);
    }

    // Method to gather and return all users
    exportUsers(): IUser[] {
        return users;
    }

    // Method to import users from JSON data
    importUsers(usersData: IUser[]): void {
        console.log("Importing users from JSON..."); // Debugging statement

        usersData.forEach(userData => {
            try {
                const user = new User(userData); // Create a User instance
                users.push(user); // Add the user to the global users array
                console.log("User imported successfully:", user); // Debugging statement
            } catch (error) {
                console.error("Failed to import user:", userData, error);
            }
        });

        console.log("All users imported successfully. Total users:", users.length); // Debugging statement
    }

    /**
     * Returns a filtered list of projects whose name includes the given query (case-insensitive).
     */
    filterByName(query: string): Project[] {
        if (!query.trim()) {
            return this.list;
        }
        
        return this.list.filter(project => 
            project.name.toLowerCase().includes(query.toLowerCase())
        );
    }
}
