import * as THREE from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { IProject, Project, userRole, status, phase } from "./Project";
import { toDoManagerInstance } from "./toDoManager"; // Import the toDoManager instance
import { setCurrentProjectId } from "../index"; // Import the global constant and setter function
import { toDo, ItoDo } from "./toDo";
import { IUser, User } from "./User";
import { users } from "./UsersManager";
import { CompaniesManager, companiesManagerInstance } from "./CompaniesManager";

export let currentProject: Project | null = null; // Ensure it's globally accessible

export class ProjectsManager {
    list: Project[] = [];
    onProjectCreated = (project: Project) => {}; // Callback for when a project is created
    onProjectDeleted = () => {}; 
    currentProject: Project | null = null;
    projectsListContainer: HTMLElement | null = null; // To hold the #projectsList container

    constructor() {
        const project = this.newProject({
            name: "Default Project",
            description: "This is a default project",
            status: "Pending",
            userRole: "Architect",
            finishDate: "2023-12-31",
            icon: "MM",                // <-- Add a default icon
            color: "#e0e0e0",          // <-- Add a default color
            location: "Unknown",       // <-- Add a default location
            progress: 0,               // <-- Add a default progress
            cost: 0,                   // <-- Add a default cost
            startDate: "2023-01-01",   // <-- Add a default start date
            phase: "Design",           // <-- Add a default phase if required
            id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), // <-- Add a default id if required
        })
        
    }

    // Method to find a project by its ID
    findProjectById(id: string): Project | undefined {
        return this.list.find(project => project.id === id);
    }

    newProject(data: IProject) {
        const projectNames = this.list.map((project) => project.name);
        const nameInUse = projectNames.includes(data.name);
        const project = new Project(data);
        this.onProjectCreated(project)

        if (nameInUse) {
            this.showErrorModalDupName(data.name);
            return null; // Prevent further execution
        }

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
        // THREE JS
        // ThreeJS viewer
       /*const scene = new THREE.Scene()

        const viewerContainer = document.getElementById("viewerContainer") as HTMLDivElement
       
        const camera = new THREE.PerspectiveCamera(75)
        camera.position.z = 5

        // Clear the container
        viewerContainer.innerHTML = "";

        // Create and append the renderer
        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        viewerContainer.append(renderer.domElement);

    function resizeViewer(){
        const containerDimensions = viewerContainer.getBoundingClientRect()
        renderer.setSize(containerDimensions.width, containerDimensions.height)
        const aspectRatio = containerDimensions.width / containerDimensions.height
        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
    }

        window.addEventListener("resize", resizeViewer)

        resizeViewer()

        renderer.render(scene, camera)

        const boxGeometry = new THREE.BoxGeometry()
        const material = new THREE.MeshStandardMaterial()
        const cube = new THREE.Mesh(boxGeometry, material)
        
        //create spot Light
        const spotLight = new THREE.SpotLight()
        spotLight.position.set(2, 2, 2)
        spotLight.intensity = 0.5
        
        
        //const directionalLight = new THREE.DirectionalLight()
        const ambientLight = new THREE.AmbientLight()
        ambientLight.intensity = 0.4

        

        const cameraControls = new OrbitControls(camera, viewerContainer)

        
        function renderScene() {
            renderer.render(scene, camera)
            requestAnimationFrame(renderScene)
        }

        renderScene()
        
        const axes = new THREE.AxesHelper()
        const grid = new THREE.GridHelper(10, 10)
        grid.material.transparent = true
        grid.material.opacity = 1
        grid.material.color = new THREE.Color("#1CFFCA")

        

        scene.add(axes, grid)

        const gui = new GUI()
        const cubeControls = gui.addFolder("Cube")
        //code for the spot light
        const spotLightControls = gui.addFolder("Spot_Light")
        spotLightControls.add(spotLight.position, "x", -10, 10, 0.1)
        spotLightControls.add(spotLight.position, "y", -10, 10, 0.1)
        spotLightControls.add(spotLight.position, "z", -10, 10, 0.1)
        spotLightControls.add(spotLight, "intensity", 0, 10, 0.1).name("Intensity")
        spotLightControls.addColor(spotLight, "color").name("Color")
        spotLightControls.add(spotLight, "visible").name("Visible")

        //code for the cube control
        cubeControls.add(cube.position, "x", -10, 10, 0.1)
        cubeControls.add(cube.position, "y", -10, 10, 0.1)
        cubeControls.add(cube.position, "z", -10, 10, 0.1)
        cubeControls.add(cube, "visible")
        cubeControls.addColor(cube.material, "color")
        // Create a parent object for the light
        const lightParent = new THREE.Object3D();
        scene.add(lightParent);
        // Create the directional light and add it to the parent
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        lightParent.add(directionalLight);
        // Add a GUI folder for light rotation
        const directionalLightRotationControls = gui.addFolder("Directional Light Rotation");
        directionalLightRotationControls.add(lightParent.rotation, "x", 0, Math.PI * 2, 0.01).name("Rotation X");
        directionalLightRotationControls.add(lightParent.rotation, "y", 0, Math.PI * 2, 0.01).name("Rotation Y");
        directionalLightRotationControls.add(lightParent.rotation, "z", 0, Math.PI * 2, 0.01).name("Rotation Z");
        directionalLightRotationControls.open();
        //code for directional light
        const directionalLightControls = gui.addFolder("Directional_Light")
        directionalLightControls.add(directionalLight.position, "x", -10, 10, 0.1)
        directionalLightControls.add(directionalLight.position, "y", -10, 10, 0.1)
        directionalLightControls.add(directionalLight.position, "z", -10, 10, 0.1)
        directionalLightControls.add(directionalLight, "intensity", 0, 10, 0.1).name("Intensity")
        directionalLightControls.addColor(directionalLight, "color").name("Color")
        directionalLightControls.add(directionalLight, "visible").name("Visible")

        scene.add(directionalLight,ambientLight, spotLight)

        */
        
        //OBJ LOADER 
        /*const objLoader = new OBJLoader()
        const mtlLoader = new MTLLoader()

        

        mtlLoader.load("/assets/Gear/Gear1.mtl", (materials) => {
            materials.preload()
            objLoader.setMaterials(materials)
            objLoader.load("/assets/Gear/Gear1.obj", (mesh) => {
                scene.add(mesh)
            })
            })
        

        //GLTF LOADER
        const gltfLoader = new GLTFLoader()
        gltfLoader.load("/assets/fossil/scene.gltf", (gltf) => {
            scene.add(gltf.scene)
        })
        */

        
    
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
            const { ui, ...projectData } = project; // Destructure to exclude `ui`
            return {
                ...projectData,
                toDos: (project.toDos || []).map(toDo => ({
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