import { IProject, Project, userRole, status, phase } from "./Project";
import { toDoManagerInstance, toDos } from "./toDoManager"; // Import toDos array
import { IUser, User } from "./User";
import { users } from "./UsersManager";
import { companiesManagerInstance } from "./CompaniesManager";
import { ItoDo } from "./toDo"; // Import ItoDo type


export let currentProject: Project | null = null; // Ensure it's globally accessible

export class ProjectsManager {
    list: Project[] = [];
    private hasLoadedFromFirebase = false; // Track if projects have been loaded
    private isLoading = false; // Prevent multiple simultaneous loads
    
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

    async newProject(data: IProject, id?: string): Promise<Project> {
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

        // Create the project
        const project = new Project(data);
        
        try {
            // Save to Firestore first
            const { addDocument } = await import("../firebase");
            await addDocument<IProject>("/projects", project.toJSON(), project.id);
            
            // Then add to local list
            this.list.push(project);
            this.onProjectCreated(project);

            // Handle modal setup only if DOM elements exist (legacy support)
            this.setupToDoModalIfExists(data);

            return project;
        } catch (error) {
            const errorMessage = `Failed to create project: ${error instanceof Error ? error.message : String(error)}`;
            if (this.onProjectError) {
                this.onProjectError(errorMessage);
            }
            throw error;
        }
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
                companyId: project.companyId,
                createdBy: project.createdBy,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
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

    // ✅ SIMPLE: One method to update projects (immediate Firebase save)
    async updateProject(id: string, updates: Partial<IProject>): Promise<Project> {
        try {
            const existingProject = this.getProject(id);
            if (!existingProject) {
                const errorMessage = `Project with ID ${id} not found`;
                if (this.onProjectError) {
                    this.onProjectError(errorMessage);
                }
                throw new Error(errorMessage);
            }

            // Validate and clean the updates
            const validatedUpdates = this.validateUpdates(updates);
            
            // Single Firebase call
            const { updateDocument } = await import("../firebase");
            await updateDocument<Partial<IProject>>("/projects", id, validatedUpdates);

            // Update local state
            const updatedData = { ...existingProject, ...validatedUpdates };
            const updatedProject = new Project(updatedData);
            
            const existingProjectIndex = this.list.findIndex(project => project.id === id);
            this.list[existingProjectIndex] = updatedProject;

            // Trigger callback
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

    // Helper method to validate updates before sending to Firebase
    private validateUpdates(updates: Partial<IProject>): Partial<IProject> {
        const validated: Partial<IProject> = {};
        
        // Only include valid fields that exist in IProject interface
        if (updates.name !== undefined) validated.name = updates.name;
        if (updates.description !== undefined) validated.description = updates.description;
        if (updates.status !== undefined) validated.status = updates.status;
        if (updates.progress !== undefined) validated.progress = updates.progress;
        if (updates.cost !== undefined) validated.cost = updates.cost;
        if (updates.location !== undefined) validated.location = updates.location;
        if (updates.userRole !== undefined) validated.userRole = updates.userRole;
        if (updates.phase !== undefined) validated.phase = updates.phase;
        if (updates.startDate !== undefined) validated.startDate = updates.startDate;
        if (updates.finishDate !== undefined) validated.finishDate = updates.finishDate;
        if (updates.toDos !== undefined) validated.toDos = updates.toDos;
        if (updates.assignedUsers !== undefined) validated.assignedUsers = updates.assignedUsers;
        if (updates.icon !== undefined) validated.icon = updates.icon;
        if (updates.color !== undefined) validated.color = updates.color;
        if (updates.companyId !== undefined) validated.companyId = updates.companyId;
        if (updates.createdBy !== undefined) validated.createdBy = updates.createdBy;
        if (updates.createdAt !== undefined) validated.createdAt = updates.createdAt;
        if (updates.updatedAt !== undefined) validated.updatedAt = updates.updatedAt;
        if (updates.modifiedAt !== undefined) validated.modifiedAt = updates.modifiedAt;
        if (updates.modifiedBy !== undefined) validated.modifiedBy = updates.modifiedBy;
        
        // Always update the timestamp when making changes
        if (Object.keys(validated).length > 0) {
            validated.updatedAt = new Date().toISOString();
            validated.modifiedAt = new Date().toISOString();
        }
        
        return validated;
    }

    // Add method to ensure projects are loaded once at app startup
    async ensureProjectsLoaded(): Promise<void> {
        if (this.hasLoadedFromFirebase || this.isLoading) {
            return;
        }
        
        try {
            this.isLoading = true;
            console.log('[ProjectsManager] Loading projects from Firebase at app startup...');
            
            const { getCollection } = await import("../firebase/index");
            const projectsCollection = getCollection<IProject>("/projects");
            const { getDocs } = await import("firebase/firestore");
            
            const firebaseProjects = await getDocs(projectsCollection);
            console.log(`[ProjectsManager] Found ${firebaseProjects.docs.length} projects in Firebase`);
            
            // Clear existing projects
            this.list = [];
            
            for (const doc of firebaseProjects.docs) {
                const data = doc.data();
                
                // Helper function to convert Firestore Timestamp to date string
                const convertTimestampToDateString = (timestamp: any): string => {
                    if (timestamp && timestamp.toDate) {
                        return timestamp.toDate().toISOString().split('T')[0]; // Returns YYYY-MM-DD format
                    }
                    return timestamp || ""; // Fallback if it's already a string or null
                };
                
                // Convert ALL the data properly, ensuring IProject interface compliance
                const projectData: IProject = {
                    id: doc.id,
                    icon: data.icon || "DP",
                    color: data.color || "#FFFFFF",
                    name: data.name || "Untitled Project",
                    description: data.description || "",
                    userRole: data.userRole || "not defined",
                    location: data.location || "",
                    progress: data.progress || 0,
                    cost: data.cost || 0,
                    status: data.status || "Pending",
                    phase: data.phase || "Design",
                    startDate: convertTimestampToDateString(data.startDate),
                    finishDate: convertTimestampToDateString(data.finishDate),
                    assignedUsers: data.assignedUsers && Array.isArray(data.assignedUsers) ? 
                        data.assignedUsers.filter((assignment: any) => {
                            return assignment && assignment.userId && assignment.userId.trim() !== "";
                        }) : [],
                    toDos: data.toDos && Array.isArray(data.toDos) ? 
                        data.toDos.map((todo: any) => ({
                            ...todo,
                            // Convert timestamps in toDos as well
                            due_date: convertTimestampToDateString(todo.due_date),
                            start_date: convertTimestampToDateString(todo.start_date),
                            created_at: convertTimestampToDateString(todo.created_at),
                            updated_at: convertTimestampToDateString(todo.updated_at)
                        })) : []
                };
                
                const project = new Project(projectData);
                this.list.push(project);
            }
            
            this.hasLoadedFromFirebase = true;
            console.log(`[ProjectsManager] Projects loaded successfully at app startup. Total: ${this.list.length}`);
            
        } catch (error) {
            console.error("[ProjectsManager] Failed to load projects at app startup:", error);
        } finally {
            this.isLoading = false;
        }
    }

    // Manual refresh method - force reload projects from Firebase
    async refreshProjectsFromFirebase(): Promise<void> {
        try {
            this.isLoading = true;
            this.hasLoadedFromFirebase = false; // Reset flag to force reload
            console.log('[ProjectsManager] Manually refreshing projects from Firebase...');
            
            const { getCollection } = await import("../firebase/index");
            const projectsCollection = getCollection<IProject>("/projects");
            const { getDocs } = await import("firebase/firestore");
            
            const firebaseProjects = await getDocs(projectsCollection);
            console.log(`[ProjectsManager] Found ${firebaseProjects.docs.length} projects in Firebase (refresh)`);
            
            // Clear existing projects
            this.list = [];
            
            for (const doc of firebaseProjects.docs) {
                const data = doc.data();
                
                // Helper function to convert Firestore Timestamp to date string
                const convertTimestampToDateString = (timestamp: any): string => {
                    if (timestamp && timestamp.toDate) {
                        return timestamp.toDate().toISOString().split('T')[0]; // Returns YYYY-MM-DD format
                    }
                    return timestamp || ""; // Fallback if it's already a string or null
                };
                
                // Convert ALL the data properly, ensuring IProject interface compliance
                const projectData: IProject = {
                    id: doc.id,
                    icon: data.icon || "DP",
                    color: data.color || "#FFFFFF",
                    name: data.name || "Untitled Project",
                    description: data.description || "",
                    userRole: data.userRole || "not defined",
                    location: data.location || "",
                    progress: data.progress || 0,
                    cost: data.cost || 0,
                    status: data.status || "Pending",
                    phase: data.phase || "Design",
                    startDate: convertTimestampToDateString(data.startDate),
                    finishDate: convertTimestampToDateString(data.finishDate),
                    assignedUsers: data.assignedUsers && Array.isArray(data.assignedUsers) ? 
                        data.assignedUsers.filter((assignment: any) => {
                            return assignment && assignment.userId && assignment.userId.trim() !== "";
                        }) : [],
                    toDos: data.toDos && Array.isArray(data.toDos) ? 
                        data.toDos.map((todo: any) => ({
                            ...todo,
                            // Convert timestamps in toDos as well
                            due_date: convertTimestampToDateString(todo.due_date),
                            start_date: convertTimestampToDateString(todo.start_date),
                            created_at: convertTimestampToDateString(todo.created_at),
                            updated_at: convertTimestampToDateString(todo.updated_at)
                        })) : []
                };
                
                const project = new Project(projectData);
                this.list.push(project);
            }
            
            this.hasLoadedFromFirebase = true;
            console.log(`[ProjectsManager] Projects refreshed successfully. Total: ${this.list.length}`);
            
        } catch (error) {
            console.error("[ProjectsManager] Failed to refresh projects from Firebase:", error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    // Check if projects have been loaded
    isProjectsLoaded(): boolean {
        return this.hasLoadedFromFirebase;
    }

    // Get projects (now uses cached data)
    getProjects(): Project[] {
        return this.list;
    }
}

// Export singleton instance
export const projectsManagerInstance = new ProjectsManager();
