import { IProject, Project, userRole, status, phase } from "./Project";
import { toDoManagerInstance } from "./toDoManager"; // Import the toDoManager instance
import { IUser, User } from "./User";
import { users } from "./UsersManager";
import { companiesManagerInstance } from "./CompaniesManager";

export let currentProject: Project | null = null; // Ensure it's globally accessible

export class ProjectsManager {
    list: Project[] = [];
    onProjectCreated = (_project: Project) => {}; // Callback for when a project is created
    onProjectDeleted = () => {}; 
    onProjectError?: (errorMessage: string) => void; // Callback for error handling
    currentProject: Project | null = null;
    projectsListContainer: HTMLElement | null = null; // To hold the #projectsList container


    // Method to find a project by its ID
    findProjectById(id: string): Project | undefined {
        return this.list.find(project => project.id === id);
    }

    newProject(data: IProject) {
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

    setToDoModal(project: Project) {
        const toDoModal = document.getElementById("editProjectModal");
        if (!toDoModal || !this.currentProject) {
            console.warn("No project selected for editing!");
            return;  // Exit early if there's no project to edit
        }

        // Populate project details
        const setText = (selector: string, value: string | number) => {
            const element = toDoModal.querySelector(`[data-project-info='${selector}']`);
            if (element) {
                element.textContent = value.toString();
            } else {
                console.warn(`Element not found for ${selector}`);
            }
        };
        
        console.log("ready to test")
        console.log("project.name")
        setText("iconPD", project.icon);
        setText("namePD", project.name);
        setText("nameBigPD", project.name);
        setText("locationPD", project.location);
        setText("descriptionPD", project.description);
        setText("progressPD", project.progress);
        setText("costPD", project.cost);
        setText("statusPD", project.status);
        setText("rolePD", project.userRole);
        setText("startPD", project.startDate);
        setText("finishPD", project.finishDate);

        // Populate form fields for editing
        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = value.toString();
        };

        setInputValue("projectNameInput", project.name);
        setInputValue("projectLocationInput", project.location);
        setInputValue("projectDescriptionInput", project.description);
        setInputValue("projectCostInput", project.cost);
        setInputValue("projectProgressInput", project.progress);
        setInputValue("projectStatusInput", project.status);
        setInputValue("projectRoleInput", project.userRole);
        setInputValue("projectStartPDInput", project.startDate);
        setInputValue("projectFinishPDInput", project.finishDate);

        // Set icon background color
        const iconElement = document.getElementById("iconPD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = project.color;
        }

        // Capture the project details into a constant
        const projectDetails = {
            name: project.name, // Project name
            location: project.location, // Project location
            description: project.description, // Project description
            cost: project.cost, // Project costs
            progress: project.progress, // Project progress
            status: project.status, // Project status
            role: project.userRole, // Project role
            startDate: project.startDate, // Project start date
            endDate: project.finishDate, // Project end date
            // You can add more project properties here
        };
        console.log("testing")
        console.log(projectDetails)
    }

    

    setDetailsPage(project: Project) {
        const detailsPage = document.getElementById("projectDetails");
        if (!detailsPage || !this.currentProject) {
            console.warn("No project selected for editing!");
            return;  // Exit early if there's no project to edit
        }

        // Populate project details
        const setText = (selector: string, value: string | number) => {
            const element = detailsPage.querySelector(`[data-project-info='${selector}']`);
            if (element) {
                element.textContent = value.toString();
            } else {
                console.warn(`Element not found for ${selector}`);
            }
        
    
    }

        this.updateProgressBar(project.progress)

        setText("iconPD", project.icon);
        setText("namePD", project.name);
        setText("nameBigPD", project.name);
        setText("locationPD", project.location);
        setText("descriptionPD", project.description);
        setText("progressPD", project.progress);
        setText("costPD", project.cost);
        setText("statusPD", project.status);
        setText("rolePD", project.userRole);
        setText("startPD", project.startDate);
        setText("finishPD", project.finishDate);

        // Populate form fields for editing
        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = value.toString();
        };

        setInputValue("projectNameInput", project.name);
        setInputValue("projectLocationInput", project.location);
        setInputValue("projectDescriptionInput", project.description);
        setInputValue("projectCostInput", project.cost);
        setInputValue("projectProgressInput", project.progress);
        setInputValue("projectStatusInput", project.status);
        setInputValue("projectRoleInput", project.userRole);
        setInputValue("projectStartPDInput", project.startDate);
        setInputValue("projectFinishPDInput", project.finishDate);

        // Set icon background color
        const iconElement = document.getElementById("iconPD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = project.color;
        }

        // Capture the project details into a constant
        // const projectDetails = {
        //     name: project.name, // Project name
        //     location: project.location, // Project location
        //     description: project.description, // Project description
        //     progress: project.progress, // Project progress
        //     cost: project.cost, // Project costs
        //     status: project.status, // Project status
        //     role: project.userRole, // Project role
        //     startDate: project.startDate, // Project start date
        //     endDate: project.finishDate, // Project end date
        //     // You can add more project properties here
        // };
        
    }


    setProjectsPage(project: Project) {
        const projectsPage = document.getElementById("projectsPage");
        if (!projectsPage || !this.currentProject) {
            console.warn("No project selected for editing!");
            return;  // Exit early if there's no project to edit
        }

        // Populate project page
        const setText = (selector: string, value: string | number) => {
            const element = projectsPage.querySelector(`[data-project-info='${selector}']`);
            if (element) element.textContent = value.toString();
        };

        setText("iconPD", project.icon);
        setText("namePD", project.name);
        setText("nameBigPD", project.name);
        setText("locationPD", project.location);
        setText("descriptionPD", project.description);
        setText("progressPD", project.progress);
        setText("costPD", project.cost);
        setText("statusPD", project.status);
        setText("rolePD", project.userRole);
        setText("startPD", project.startDate);
        setText("finishPD", project.finishDate);

        // Populate form fields for editing
        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = value.toString();
        };

        setInputValue("projectNameInput", project.name);
        setInputValue("projectLocationInput", project.location);
        setInputValue("projectDescriptionInput", project.description);
        setInputValue("projectProgressInput", project.progress);
        setInputValue("projectCostInput", project.cost);
        setInputValue("projectStatusInput", project.status);
        setInputValue("projectRoleInput", project.userRole);
        setInputValue("projectStartPDInput", project.startDate);
        setInputValue("projectFinishPDInput", project.finishDate);

        const iconElement = document.getElementById("iconPD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = project.color;
        }
    }

    setDeleteProjectButton(){
        const deleteButton = document.getElementById("ConfirmDeleteButton") as HTMLButtonElement;
        if (deleteButton) {
            deleteButton.addEventListener("click", () => {
                console.log("Delete button clicked");
                if (this.currentProject) {
                    this.deleteProject(this.currentProject.id);
                    const projectsPage = document.getElementById("projectsPage") as HTMLDivElement;
                    const usersPage = document.getElementById("usersPage") as HTMLDivElement;
                    const detailsPage = document.getElementById("projectDetails") as HTMLDivElement;
                    const introPage = document.getElementById("intro") as HTMLDivElement;
                    const sidebar = document.getElementById("sidebar") as HTMLDivElement;
                    if (projectsPage && detailsPage) {
                        // Hide other pages and show the Projects page
                        usersPage.style.display = "none";
                        detailsPage.style.display = "none";
                        introPage.style.display = "none";
                        projectsPage.style.display = "flex"; // Show Projects page
                        sidebar.style.display = "flex";
                    }
                } else {
                    console.warn("No project selected for deletion.");
                }
                const modal = document.getElementById("DeleteProjectModal") as HTMLDialogElement;
                    if (modal) {
                        modal.close();
                    }
                
            });
        }

    }

    setChangeButton() {
        const saveButton = document.getElementById("changeProjectButton") as HTMLButtonElement;
        if (saveButton) {
            saveButton.addEventListener("click", () => {
                if (this.currentProject) {
                    this.updateProjectData(this.currentProject.id);
                    this.updateProjectCards(this.currentProject);
                    this.updateProgressBar(this.currentProject.progress)

                    const modal = document.getElementById("editProjectModal") as HTMLDialogElement;
                    if (modal) {
                        modal.close();
                    }
                    this.refreshModalToDo(this.currentProject)
                    } else {
                    console.warn("No project selected for editing.");
                }
            });
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

        //this.updateProjectUI(project);
        this.updateProjectCards(project);

    }

    updateProjectCards(project: Project){
        const projectsPage = document.getElementById("projectsPage");
        if (!projectsPage) return;

        const setText = (selector: string, value: string | number) => {
            const element = projectsPage.querySelector(`[data-project-info='${selector}']`);
            if (element) element.textContent = value.toString();
        };

        setText("iconPD", project.icon);
        setText("namePD", project.name);
        setText("nameBigPD", project.name);
        setText("locationPD", project.location);
        setText("descriptionPD", project.description);
        setText("progressPD", project.progress);
        setText("costPD", project.cost);
        setText("statusPD", project.status);
        setText("rolePD", project.userRole);
        setText("startPD", project.startDate);
        setText("finishPD", project.finishDate);

        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = value.toString();
        };

        setInputValue("projectNameInput", project.name);
        setInputValue("projectLocationInput", project.location);
        setInputValue("projectDescriptionInput", project.description);
        setInputValue("projectProgressInput", project.progress);
        setInputValue("projectCostInput", project.cost);
        setInputValue("projectStatusInput", project.status);
        setInputValue("projectRoleInput", project.userRole);
        setInputValue("projectStartPDInput", project.startDate);
        setInputValue("projectFinishPDInput", project.finishDate);

        const iconElement = document.getElementById("iconPD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = project.color;
        }

    }

    
    updateProjectUI(project: Project) {
        const detailsPage = document.getElementById("projectDetails");
        if (!detailsPage) return;

        const setText = (selector: string, value: string | number) => {
            const element = detailsPage.querySelector(`[data-project-info='${selector}']`);
            if (element) element.textContent = value.toString();
        };

        setText("iconPD", project.icon);
        setText("namePD", project.name);
        setText("nameBigPD", project.name);
        setText("locationPD", project.location);
        setText("descriptionPD", project.description);
        setText("progressPD", project.progress);
        setText("costPD", project.cost);
        setText("statusPD", project.status);
        setText("rolePD", project.userRole);
        setText("startPD", project.startDate);
        setText("finishPD", project.finishDate);

        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = value.toString();
        };

        setInputValue("projectNameInput", project.name);
        setInputValue("projectLocationInput", project.location);
        setInputValue("projectDescriptionInput", project.description);
        setInputValue("projectProgressInput", project.progress);
        setInputValue("projectCostInput", project.cost);
        setInputValue("projectStatusInput", project.status);
        setInputValue("projectRoleInput", project.userRole);
        setInputValue("projectStartPDInput", project.startDate);
        setInputValue("projectFinishPDInput", project.finishDate);

        const iconElement = document.getElementById("iconPD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = project.color;
        }
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
            console.warn("Error modal not found, using console error instead:", errorMessage);
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
            console.warn("Error modal not found, using console error instead:", errorMessage);
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
        return this.list.find((project) => project.name === name);
    }

    getTotalCostAllProjects() {
        return this.list.reduce((total, project) => total + project.cost, 0);
    }

    updateProgressBar(progress: number) {
        // Get the progress bar element
        const progressBar = document.querySelector("#percentageDiv") as HTMLElement;
    
        if (progressBar) {
            // Ensure the progress is between 0 and 100
            const clampedProgress = Math.max(0, Math.min(100, progress));
    
            // Set the width dynamically
            progressBar.style.width = `${clampedProgress}%`;
    
            // Update the text inside the div
            progressBar.textContent = `${clampedProgress}%`;
        }
    }

    exportToJSON() {
        const projects = this.list.map(project => {
            return project.toJSON(); // Use the new toJSON method
        });

        const usersExports = this.exportUsers();
        const usersJSON = usersExports.map(user => ({
            id: user.id,
            icon: user.icon,
            color: user.color,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone,
            role: user.role,
            access: user.access,
            company: user.company
        }));

        // --- Add companies to export ---
        const companies = companiesManagerInstance.exportCompanies();
        const exportableData = { projects, usersJSON, companies };

        console.log("Exporting projects, users, and companies to JSON:", exportableData);

        const json = JSON.stringify(exportableData, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.json';
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL object
    }

    importFromJSON(onComplete?: () => void) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (!file) {
                console.error("No file selected");
                if (onComplete) onComplete();
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const json = reader.result as string;
                    const parsedData: any = JSON.parse(json);

                    if (!parsedData.projects) {
                        throw new Error("Invalid JSON format. Expected an object with 'projects' property");
                    }

                    const projects: any[] = parsedData.projects;
                    const importedUsers: IUser[] = parsedData.usersJSON || [];
                    // --- Import companies if present ---
                    if (parsedData.companies) {
                        companiesManagerInstance.importCompanies(parsedData.companies);
                    }

                    for (const projectData of projects) {
                        try {
                            if (!projectData.name) {
                                console.error("Project data is missing the 'name' property:", projectData);
                                continue;
                            }
                            const { toDos = [], ...rest } = projectData;
                            let existingProject = this.list.find(p => p.id === rest.id || p.name === rest.name);
                            if (existingProject) {
                                Object.assign(existingProject, rest);
                                existingProject.toDos = toDos;
                                this.updateProjectCards(existingProject);
                            } else {
                                const project = this.newProject(rest);
                                if (project && Array.isArray(toDos)) {
                                    project.toDos = toDos;
                                    this.updateProjectCards(project);
                                }
                            }
                        } catch (error) {
                            console.error(`Failed to import project: ${projectData.name}`, error);
                        }
                    }

                    for (const userData of importedUsers) {
                        try {
                            const user = new User(userData);
                            users.push(user);
                            console.log("User imported successfully:", user);
                        } catch (error) {
                            console.error("Failed to import user:", userData, error);
                        }
                    }

                    if (this.list.length > 0) {
                        this.list.forEach(project => this.updateProjectCards(project));
                    }

                    if (onComplete) onComplete();
                    console.log("Projects, users, and companies imported successfully.");
                } catch (error) {
                    console.error("Error parsing the JSON file:", error);
                    if (onComplete) onComplete();
                }
            };
            reader.onerror = () => {
                console.error("Failed to read the file:", reader.error);
                if (onComplete) onComplete();
            };

            reader.readAsText(file);
        });

        input.click();
    }

    // Method to filter to-dos by project ID (data only, UI handled by React)
    filterToDosByProjectId(projectId: string): any[] {
        console.log(`Filtering to-dos for project ID: ${projectId}`); // Debugging statement

        // Log all elements of the toDos list
        console.log("All to-dos before filtering:", toDoManagerInstance.getToDos()); // Debugging statement

        // Get the filtered tasks
        const filteredToDos = toDoManagerInstance.getToDos().filter(toDo => toDo.project_id === projectId);

        console.log(`Found ${filteredToDos.length} to-dos for project ID: ${projectId}`); // Debugging statement
        return filteredToDos;
    }

    // Method to gather and return all users
    exportUsers(): IUser[] {
        return users.map(user => ({
            id: user.id,
            icon: user.icon,
            color: user.color,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone,
            role: user.role,
            access: user.access,
            company: user.company
        }));
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
        return this.list.filter(project =>
            project.name.toLowerCase().includes(query.toLowerCase())
        );
    }
}