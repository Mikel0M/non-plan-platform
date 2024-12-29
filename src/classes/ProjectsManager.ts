import { IProject, Project } from "./Project"

export class ProjectsManager {
    list: Project[] = []
    ui: HTMLElement

    constructor(container: HTMLElement) {
        this.ui = container
    }

    newProject(data: IProject) {
        const projectNames = this.list.map((project) => project.name);
        const nameInUse = projectNames.includes(data.name);
        const project = new Project(data);
    
        if (nameInUse) {
            // Trigger the modal instead of throwing an error
            this.showErrorModal(data.name);
            return null; // Prevent further execution
        }
        project.ui.addEventListener("click", () => {
            const projectsPage = document.getElementById("projectsPage")
            const detailsPage = document.getElementById("projectDetails")
            if (!projectsPage || !detailsPage) {return}
            projectsPage.style.display = "none"
            detailsPage.style.display = "flex"
        })

        this.ui.append(project.ui);
        this.list.push(project);
        return project;
    }
    
    // Method to handle modal display
    showErrorModal(repeatedName: string) {
        const modal = document.getElementById("newProjectErrorModal") as HTMLDialogElement;
    
        // Find the content area of the modal (create a target element in your modal if needed)
        const errorMessageElement = modal.querySelector("#errorMessage");
    
        if (errorMessageElement) {
            errorMessageElement.textContent = `A project with the name "${repeatedName}" already exists.`;
        }
    
        // Show the modal
        if (modal) {
            modal.showModal();
        }
    }

    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project 
    }

    deleteProject(id: string) {
        const project = this.getProject(id)
        if(!project) { return }
        project.ui.remove()
        const remaining = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remaining
    }

    getProjectbyName(name: string) {
        const project = this.list.find((project) => {
            return project.name === name
        })
        return project
    }

    getTotalCostAllProjects() {
        let totalCost = 0
        for (let i = 0; i> this.list.length; i++){
            totalCost+=this.list[i].cost;
        }
        return totalCost
    }

    exportToJSON() {
        // Create a version of the projects data that excludes the `ui` property
        const exportableData = this.list.map(project => {
            const { ui, ...projectData } = project; // Destructure to exclude `ui`
            return projectData;
        });
    
        // Convert the cleaned data to JSON
        const json = JSON.stringify(exportableData, null, 2);
    
        // Trigger a download of the JSON file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.json';
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL object
    }
    
    importFromJSON() {
        // Create a file input element to select the JSON file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
    
        // Handle file loading
        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (!file) {
                console.error("No file selected");
                return;
            }
    
            // Read the file's content
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const json = reader.result as string;
                    const projects: IProject[] = JSON.parse(json); // Parse the JSON data
    
                    // Loop through the projects and create new instances
                    for (const projectData of projects) {
                        try {
                            // Ensure the UI is properly initialized when importing
                            this.newProject(projectData);
                        } catch (error) {
                            console.error(`Failed to import project: ${projectData.name}`, error);
                        }
                    }
                    console.log("Projects imported successfully.");
                } catch (error) {
                    console.error("Error parsing the JSON file:", error);
                }
            };
            reader.onerror = () => {
                console.error("Failed to read the file:", reader.error);
            };
    
            reader.readAsText(file); // Start reading the file
        });
    
        // Trigger the file input
        input.click();
    }
}
