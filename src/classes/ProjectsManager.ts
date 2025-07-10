import { IProject, Project, userRole, status, phase } from "./Project";
import { toDoManagerInstance, toDos } from "./toDoManager"; // Import toDos array
import { IUser, User } from "./User";
import { users } from "./UsersManager";
import { companiesManagerInstance } from "./CompaniesManager";
import { ItoDo } from "./toDo"; // Import ItoDo type


export let currentProject: Project | null = null; // Ensure it's globally accessible

export class ProjectsManager {
    list: Project[] = [];
    onProjectCreated = (_project: Project) => {}; // Callback for when a project is created
    onProjectDeleted = (id: string) => {}; 
    onProjectUpdated = (_project: Project) => {}; // Callback for when a project is updated
    onProjectsImported?: () => void; // Callback for when projects are imported
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

    // Method to update project with Firebase synchronization
    async updateProjectInFirebase(id: string, updates: Partial<IProject>): Promise<Project> {
        try {
            const existingProject = this.getProject(id);
            if (!existingProject) {
                const errorMessage = `Project with ID ${id} not found`;
                if (this.onProjectError) {
                    this.onProjectError(errorMessage);
                }
                throw new Error(errorMessage);
            }

            // First, update in Firebase
            const { updateDocument } = await import("../firebase");
            await updateDocument<Partial<IProject>>("/projects", id, updates);

            // Then update local state with merged data
            const updatedData = { ...existingProject, ...updates };
            const updatedProject = new Project(updatedData);
            
            const existingProjectIndex = this.list.findIndex(project => project.id === id);
            this.list[existingProjectIndex] = updatedProject;

            // Trigger update callback
            this.onProjectUpdated(updatedProject);

            return updatedProject;
        } catch (error) {
            const errorMessage = `Failed to update project: ${error instanceof Error ? error.message : String(error)}`;
            if (this.onProjectError) {
                this.onProjectError(errorMessage);
            }
            throw error;
        }
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

    async deleteProject(id: string): Promise<void> {
        try {
            const project = this.getProject(id);
            if (!project) {
                const errorMessage = `Project with ID ${id} not found`;
                if (this.onProjectError) {
                    this.onProjectError(errorMessage);
                }
                throw new Error(errorMessage);
            }

            // First, remove from Firebase
            const { deleteDocument } = await import("../firebase");
            await deleteDocument("projects", id);

            // Then remove from local state
            this.list = this.list.filter((project) => project.id !== id);
            
            // Trigger callback
            this.onProjectDeleted(id);
        } catch (error) {
            const errorMessage = `Failed to delete project: ${error instanceof Error ? error.message : String(error)}`;
            if (this.onProjectError) {
                this.onProjectError(errorMessage);
            }
            throw error;
        }
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

    exportToJSON(): void {
        if (this.list.length === 0) {
            console.warn("No projects to export");
            if (this.onProjectError) {
                this.onProjectError("No projects to export");
            }
            return;
        }

        try {
            // Create a clean export format with all necessary data
            const projectsToExport = this.list.map(project => ({
                id: project.id,
                name: project.name,
                description: project.description,
                userRole: project.userRole,
                location: project.location,
                progress: project.progress,
                cost: project.cost,
                status: project.status,
                phase: project.phase,
                startDate: project.startDate,
                finishDate: project.finishDate,
                color: project.color,
                icon: project.icon,
                PUsers: project.PUsers || [],
                assignedUsers: project.assignedUsers || [],
                toDos: project.toDos || []
            }));

            // Export in the original format with projects, users, and companies
            const exportData = {
                projects: projectsToExport,
                usersJSON: this.exportUsers(),
                companies: companiesManagerInstance.exportCompanies()
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `projects_export_${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            console.log(`Exported ${projectsToExport.length} projects, ${this.exportUsers().length} users, and companies to ${exportFileDefaultName}`);
        } catch (error) {
            console.error('Failed to export projects:', error);
            if (this.onProjectError) {
                this.onProjectError('Failed to export projects: ' + (error as Error).message);
            }
        }
    }

    importFromJSON(onComplete?: () => void): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const importedData = JSON.parse(content);
                    
                    // Handle both old format (with projects/usersJSON/companies) and new format (direct array)
                    let importedProjects: any[] = [];
                    let importedUsers: any[] = [];
                    let importedCompanies: any[] = [];

                    if (importedData.projects && Array.isArray(importedData.projects)) {
                        // Old format: { projects: [...], usersJSON: [...], companies: [...] }
                        importedProjects = importedData.projects;
                        importedUsers = importedData.usersJSON || [];
                        importedCompanies = importedData.companies || [];
                    } else if (Array.isArray(importedData)) {
                        // New format: direct array of projects
                        importedProjects = importedData;
                    } else {
                        throw new Error('Invalid JSON format - expected projects array or wrapped format');
                    }

                    // Process each imported project
                    let importedCount = 0;
                    let updatedCount = 0;
                    let skippedCount = 0;

                    importedProjects.forEach((projectData: any) => {
                        try {
                            // Validate required fields
                            if (!projectData.name || typeof projectData.name !== 'string') {
                                throw new Error('Project name is required');
                            }

                            // Check if project already exists by ID
                            const existingProject = projectData.id ? this.findProjectById(projectData.id) : null;
                            
                            if (existingProject) {
                                // Update existing project
                                this.updateProject(projectData.id, projectData);
                                console.log(`Updated existing project: ${projectData.name}`);
                                updatedCount++;
                            } else {
                                // For new projects, skip the duplicate name check during import
                                // Users can import projects with duplicate names from backups
                                try {
                                    const newProject = this.newProject(projectData);
                                    console.log(`Imported new project: ${projectData.name}`);
                                    importedCount++;
                                } catch (error) {
                                    // If newProject fails (e.g., due to duplicate name), try with a modified name
                                    const modifiedName = `${projectData.name} (imported)`;
                                    const modifiedProjectData = { ...projectData, name: modifiedName };
                                    try {
                                        const newProject = this.newProject(modifiedProjectData);
                                        console.log(`Imported project with modified name: ${modifiedName}`);
                                        importedCount++;
                                    } catch (secondError) {
                                        console.warn(`Failed to import project even with modified name: ${projectData.name}`);
                                        skippedCount++;
                                    }
                                }
                            }
                        } catch (error) {
                            console.warn(`Skipping project ${projectData.name || 'Unknown'}:`, error);
                            skippedCount++;
                        }
                    });

                    // Import users if they exist
                    if (importedUsers.length > 0) {
                        try {
                            this.importUsers(importedUsers);
                            console.log(`Imported ${importedUsers.length} users`);
                        } catch (error) {
                            console.warn('Failed to import users:', error);
                        }
                    }

                    // Import companies if they exist
                    if (importedCompanies.length > 0) {
                        try {
                            companiesManagerInstance.importCompanies(importedCompanies);
                            console.log(`Imported ${importedCompanies.length} companies`);
                        } catch (error) {
                            console.warn('Failed to import companies:', error);
                        }
                    }

                    // Notify about the import results
                    const totalProcessed = importedCount + updatedCount;
                    const message = `Import completed: ${importedCount} new projects, ${updatedCount} updated, ${skippedCount} skipped, ${importedUsers.length} users, ${importedCompanies.length} companies`;
                    console.log(message);
                    
                    if (totalProcessed === 0) {
                        if (this.onProjectError) {
                            this.onProjectError('No projects were imported. Check console for details.');
                        }
                    }
                    
                    // Trigger callbacks to update UI
                    if (onComplete) onComplete();
                    if (this.onProjectsImported) this.onProjectsImported();
                    
                } catch (error) {
                    console.error('Failed to import projects:', error);
                    if (this.onProjectError) {
                        this.onProjectError('Failed to import projects: ' + (error as Error).message);
                    }
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Method to filter to-dos by project ID (data only, UI handled by React)
    filterToDosByProjectId(projectId: string): any[] {
        return toDos.filter((toDo: any) => toDo.projectId === projectId);
    }

    // Method to gather and return all users
    exportUsers(): IUser[] {
        return users.map(user => user.toJSON());
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

    // Helper methods for updating specific project properties
    async updateProjectName(id: string, name: string): Promise<Project> {
        return this.updateProjectInFirebase(id, { name });
    }

    async updateProjectDescription(id: string, description: string): Promise<Project> {
        return this.updateProjectInFirebase(id, { description });
    }

    async updateProjectStatus(id: string, status: status): Promise<Project> {
        return this.updateProjectInFirebase(id, { status });
    }

    async updateProjectProgress(id: string, progress: number): Promise<Project> {
        return this.updateProjectInFirebase(id, { progress });
    }

    async updateProjectCost(id: string, cost: number): Promise<Project> {
        return this.updateProjectInFirebase(id, { cost });
    }

    async updateProjectLocation(id: string, location: string): Promise<Project> {
        return this.updateProjectInFirebase(id, { location });
    }

    async updateProjectUserRole(id: string, userRole: userRole): Promise<Project> {
        return this.updateProjectInFirebase(id, { userRole });
    }

    async updateProjectPhase(id: string, phase: phase): Promise<Project> {
        return this.updateProjectInFirebase(id, { phase });
    }

    async updateProjectDates(id: string, startDate?: string, finishDate?: string): Promise<Project> {
        const updates: Partial<IProject> = {};
        if (startDate !== undefined) updates.startDate = startDate;
        if (finishDate !== undefined) updates.finishDate = finishDate;
        return this.updateProjectInFirebase(id, updates);
    }

    async updateProjectToDos(id: string, toDos: ItoDo[]): Promise<Project> {
        return this.updateProjectInFirebase(id, { toDos });
    }

    async updateProjectAssignedUsers(id: string, assignedUsers: Array<{ userId: string, role: string }>): Promise<Project> {
        return this.updateProjectInFirebase(id, { assignedUsers });
    }

    async updateProjectPUsers(id: string, PUsers: IUser[]): Promise<Project> {
        return this.updateProjectInFirebase(id, { PUsers });
    }

    // Method to update multiple project properties at once
    async updateProjectMultiple(id: string, updates: Partial<IProject>): Promise<Project> {
        return this.updateProjectInFirebase(id, updates);
    }
}

// Export singleton instance
export const projectsManagerInstance = new ProjectsManager();
