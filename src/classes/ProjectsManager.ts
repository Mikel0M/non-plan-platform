import { closeModal } from "..";
import { IProject, Project, userRole, status, phase } from "./Project";
import { toDoManagerInstance, toDos } from "./toDoManager"; // Import the toDoManager instance
import { currentProjectId, setCurrentProjectId } from "../index"; // Import the global constant and setter function
import { toDo, ItoDo } from "./toDo";
import { IUser, User } from "./User";
import { users } from "./UsersManager";

export let currentProject: Project | null = null; // Ensure it's globally accessible

export class ProjectsManager {
    list: Project[] = [];
    ui: HTMLElement;
    currentProject: Project | null = null;
    projectsListContainer: HTMLElement | null = null; // To hold the #projectsList container

    constructor(container: HTMLElement) {
        this.ui = container;
    }

    // Method to find a project by its ID
    findProjectById(id: string): Project | undefined {
        return this.list.find(project => project.id === id);
    }

    newProject(data: IProject) {
        const projectNames = this.list.map((project) => project.name);
        const nameInUse = projectNames.includes(data.name);
        const project = new Project(data);

        if (nameInUse) {
            this.showErrorModalDupName(data.name);
            return null; // Prevent further execution
        }

        project.ui.addEventListener("click", () => {
            const projectsPage = document.getElementById("projectsPage");
            const detailsPage = document.getElementById("projectDetails");
            if (!projectsPage || !detailsPage) return;

            projectsPage.style.display = "none";
            detailsPage.style.display = "flex";

            this.currentProject = project;
            setCurrentProjectId(project.id); // Update the global constant
            this.setDetailsPage(project);  // Set the details page with the selected project
            this.setProjectsPage(project);  // Set the details page with the selected project

            // Call the method to filter and display to-dos by project ID
            console.log(`Calling filterAndDisplayToDosByProjectId with project ID: ${project.id}`); // Debugging statement
            this.filterAndDisplayToDosByProjectId(project.id);

            // Access the toDoListUI element
            const toDoListUI = toDoManagerInstance.getToDoListUI();
            console.log("toDoListUI content:", toDoListUI.innerHTML); // Debugging statement
        });

        const newtoDoModalBtn = document.getElementById("newToDoBtn");
        const modaltoDo = document.getElementById("newToDoModal") as HTMLDialogElement;
        if (newtoDoModalBtn && modaltoDo) {
            const name = modaltoDo.querySelector("[data-project-info='toDoProjectName']");
            const projectID = modaltoDo.querySelector("[data-project-info='toDoProjectID']");
            if (name) { name.textContent = data.name }
            if (projectID) { projectID.textContent = data.id ? data.id : "" }
            newtoDoModalBtn.addEventListener("click", () => { modaltoDo.showModal() })
        }

        if (data.name.length < 5) {
            this.showErrorModalShortName();
            return null; // Prevent further execution
        }

        this.ui.append(project.ui);
        this.list.push(project);
        return project;
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
        };

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
        setInputValue("projectProgressInput", project.progress);
        setInputValue("projectCostInput", project.cost);
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
            progress: project.progress, // Project progress
            cost: project.cost, // Project costs
            status: project.status, // Project status
            role: project.userRole, // Project role
            startDate: project.startDate, // Project start date
            endDate: project.finishDate, // Project end date
            // You can add more project properties here
        };
        
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
                    this.currentProject.updateUI()
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

    refreshModalToDo(project){
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

        this.updateProjectUI(project);
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

    showErrorModalShortName() {
        const modal = document.getElementById("newProjectErrorModal") as HTMLDialogElement;
        const errorMessageElement = modal.querySelector("#errorMessage");

        if (errorMessageElement) {
            errorMessageElement.textContent = `A valid project name should have at least 5 characters.`;
        }

        if (modal) {
            modal.showModal();
        }
    }

    showErrorModalDupName(repeatedName: string) {
        const modal = document.getElementById("newProjectErrorModal") as HTMLDialogElement;
        const errorMessageElement = modal.querySelector("#errorMessage");

        if (errorMessageElement) {
            errorMessageElement.textContent = `A project with the name "${repeatedName}" already exists.`;
        }

        if (modal) {
            modal.showModal();
        }
    }

    getProject(id: string) {
        const project = this.list.find((project) => project.id === id);
        return project;
    }


    deleteProject(id: string) {
        const project = this.getProject(id);
        if (!project) return;
        project.ui.remove();
        this.list = this.list.filter((project) => project.id !== id);
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
            const { ui, ...projectData } = project; // Destructure to exclude `ui`
            return {
                ...projectData,
                toDos: toDoManagerInstance.getToDos().filter(toDo => toDo.project_id === project.id).map(toDo => ({
                    id: toDo.id,
                    title: toDo.title,
                    description: toDo.description,
                    status: toDo.status,
                    priority: toDo.priority,
                    project_id: toDo.project_id,
                    assigned_to: toDo.assigned_to,
                    created_by: toDo.created_by,
                    created_at: toDo.created_at,
                    updated_at: toDo.updated_at,
                    due_date: toDo.due_date,
                    start_date: toDo.start_date,
                    completion_date: toDo.completion_date,
                    estimated_hours: toDo.estimated_hours,
                    actual_hours: toDo.actual_hours,
                    dependencies: toDo.dependencies,
                    progress_percentage: toDo.progress_percentage,
                    comments: toDo.comments
                }))
            };
        });

        const toDos = toDoManagerInstance.getToDos().map(toDo => ({
            id: toDo.id,
            title: toDo.title,
            description: toDo.description,
            status: toDo.status,
            priority: toDo.priority,
            project_id: toDo.project_id,
            assigned_to: toDo.assigned_to,
            created_by: toDo.created_by,
            created_at: toDo.created_at,
            updated_at: toDo.updated_at,
            due_date: toDo.due_date,
            start_date: toDo.start_date,
            completion_date: toDo.completion_date,
            estimated_hours: toDo.estimated_hours,
            actual_hours: toDo.actual_hours,
            dependencies: toDo.dependencies,
            progress_percentage: toDo.progress_percentage,
            comments: toDo.comments
        }));

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

        const exportableData = { projects, toDos, usersJSON };

        console.log("Exporting projects, to-dos and users to JSON:", exportableData);

        const json = JSON.stringify(exportableData, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.json';
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL object
    }

    importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (!file) {
                console.error("No file selected");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const json = reader.result as string;
                    const parsedData: any = JSON.parse(json);

                    // Ensure the parsed data is an object with 'projects' and 'toDos' properties
                    if (!parsedData.projects || !parsedData.toDos) {
                        throw new Error("Invalid JSON format. Expected an object with 'projects' and 'toDos' properties");
                    }

                    const projects: IProject[] = parsedData.projects;
                    const toDos: ItoDo[] = parsedData.toDos;
                    const importedUsers: IUser[] = parsedData.usersJSON || [];

                    // Debugging: Log the parsed data
                    console.log("Parsed projects:", projects);
                    console.log("Parsed to-dos:", toDos);
                    console.log("Parsed users:", importedUsers);

                    // Import projects
                    for (const projectData of projects) {
                        try {
                            if (!projectData.name) {
                                console.error("Project data is missing the 'name' property:", projectData);
                                continue;
                            }
                            this.newProject(projectData);
                        } catch (error) {
                            console.error(`Failed to import project: ${projectData.name}`, error);
                        }
                    }

                    // Import users
                    for (const userData of importedUsers) {
                        try {
                            const user = new User(userData); // Create a User instance
                            users.push(user); // Add the user to the global users array
                            console.log("User imported successfully:", user); // Debugging statement
                        } catch (error) {
                            console.error("Failed to import user:", userData, error);
                        }
                    }

                    console.log("Users imported successfully.");
                    console.log(users); // Debugging statement
                    

                    // Import to-dos
                    for (const toDoData of toDos) {
                        try {
                            const newToDo = new toDo(toDoData); // Instantiate the toDo object
                            toDoManagerInstance.newToDo(newToDo, toDoData.project_id);
                        } catch (error) {
                            console.error(`Failed to import to-do: ${toDoData.title}`, error);
                        }
                    }

                    console.log("Projects and to-dos imported successfully.");
                } catch (error) {
                    console.error("Error parsing the JSON file:", error);
                }
            };
            reader.onerror = () => {
                console.error("Failed to read the file:", reader.error);
            };

            reader.readAsText(file); // Start reading the file
        });

        input.click();
    }

    // Method to filter to-dos by project ID and update the UI
    filterAndDisplayToDosByProjectId(projectId: string): void {
        console.log(`Filtering to-dos for project ID: ${projectId}`); // Debugging statement

        // Log all elements of the toDos list
        console.log("All to-dos before filtering:", toDoManagerInstance.getToDos()); // Debugging statement

        // Clear existing tasks
        const toDoListUI = toDoManagerInstance.getToDoListUI();
        toDoListUI.innerHTML = '';

        // Delete all UI elements
        toDoManagerInstance.getToDos().forEach(toDo => {
            toDo.deleteUI();
        });

        // Log the length of the toDos list
        console.log(`Number of to-dos before filtering: ${toDoManagerInstance.getToDos().length}`); // Debugging statement

        // Log the title of each task
        toDoManagerInstance.getToDos().forEach(toDo => {
            console.log(`Task title: ${toDo.title}`);
        });

        // Get the filtered tasks
        const filteredToDos = toDoManagerInstance.getToDos().filter(toDo => toDo.project_id === projectId);

        // Append the filtered tasks to the to-do list container
        filteredToDos.forEach(toDo => {
            toDoListUI.appendChild(toDo.ui);
        });

        console.log(`Displayed ${filteredToDos.length} to-dos for project ID: ${projectId}`); // Debugging statement
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
}