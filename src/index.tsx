import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Router from 'react-router-dom';
import {Sidebar} from './react-components/Sidebar';
import { ProjectsPage } from './react-components/ProjectsPage';
import {Banner} from './react-components/Banner';
import { IProject, status, userRole, phase, Project} from "./classes/Project"
import { IUser, usersRole, access} from "./classes/User"
import { UsersManager } from "./classes/UsersManager"
import { ICompany } from "./classes/Company"
import { CompaniesManager, companiesManagerInstance } from "./classes/CompaniesManager"
import { ItoDo, toDoPriority, toDoStatus, toDoPercentage } from "./classes/toDo"
import { toDoManager } from "./classes/toDoManager"
import { toDoManagerInstance } from './classes/toDoManager';
import { usersManagerInstance, users } from "./classes/UsersManager";
import { ProjectDetailsPage } from './react-components/ProjectDetailsPage';
import { ProjectsManager } from './classes/ProjectsManager';
import { ToDoPage } from "./react-components/toDoPage";
import { UsersPage } from './react-components/UsersPage';
import { LanguageProvider } from "./context/LanguageContext";

const projectsManager = new ProjectsManager();


const rootElement = document.getElementById('app') as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement)
appRoot.render(
    <LanguageProvider>
        <Router.BrowserRouter>
            <Sidebar customStyle={{ zIndex: 1, position: "fixed" }} />
            <div id="main-content">
                <Banner customStyle={{ zIndex: 3, position: "relative" }} />
                <Router.Routes>
                    <Router.Route path="/" element={<ProjectsPage projectManager={projectsManager} />} />
                    <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager} />} />
                    <Router.Route path="/toDo" element={<ToDoPage toDoManager={toDoManagerInstance} projectsManager={projectsManager} />} />
                    <Router.Route path="/users" element={<UsersPage usersManager={usersManagerInstance} projectsManager={projectsManager} />} />
                </Router.Routes>
            </div>
        </Router.BrowserRouter>
    </LanguageProvider>
);



// Initialize toDoManagerInstance before using it
//const toDoManagerInstance = new toDoManager(toDoListUI);
//Languages import

let currentLanguage = 'en';

import { translations } from "./text/Language"
import { Side } from 'three';

export let currentProjectId: string | null = null;



//const projectsManager = new ProjectsManager(projectsListElement);

document.getElementById('newToDoForm')!.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!currentProjectId) {
        console.error("currentProjectId is null");
        return;
    }

    const newToDoData: ItoDo = {
        title: (document.getElementById('toDoTitle') as HTMLInputElement).value,
        description: (document.getElementById('toDoDescription') as HTMLTextAreaElement).value,
        status: (document.getElementById('toDoStatus') as HTMLSelectElement).value as toDoStatus,
        priority: (document.getElementById('toDoPriority') as HTMLSelectElement).value as toDoPriority,
        project_id: currentProjectId,
        assigned_to: (document.getElementById('toDoAssignedTo') as HTMLSelectElement).value,
        created_by: (document.getElementById('toDoCreatedBy') as HTMLSelectElement).value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: (document.getElementById('toDoDueDate') as HTMLInputElement).value,
        start_date: (document.getElementById('toDoStartDate') as HTMLInputElement).value,
        completion_date: '',
        estimated_hours: parseFloat((document.getElementById('toDoEstimatedHours') as HTMLInputElement).value),
        actual_hours: parseFloat((document.getElementById('toDoActualHours') as HTMLInputElement).value),
        dependencies: [],
        progress_percentage: '0%' as toDoPercentage,
        comments: []
    };

    try {
        const toDo = toDoManagerInstance.newToDo(newToDoData, currentProjectId!); // Use the instance of toDoManager
        (document.getElementById('newToDoForm') as HTMLFormElement).reset();
        closeModal('newToDoModal');
    } catch (error) {
        alert(error);
    }
})




//Shows a modal. If the modal id is not found, it will show an error
export function showModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement){
        modal.showModal()
    }   else {
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}

//Closes a modal. If the modal id is not found, it will show an error
export function closeModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement){
        modal.close()
    }   else {
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}


// Attach to the global window object, Ensures that setChangeButton() runs when the app initializes, so the "Change" button always works.
(window as any).closeModal = closeModal;

const projectsListUI = document.getElementById("projectsList") as HTMLElement


export function setCurrentProjectId(projectId: string | null) {
    if (projectsManager?.currentProject?.id != null) {
    currentProjectId = projectsManager.currentProject.id;
}}

//the same we do for projects, we do for toDos
const toDosListUI = document.getElementById("toDoList") as HTMLElement
const toDosManager = new toDoManager(toDosListUI)

// Call this method to set up the "Change" button event listener
projectsManager.setChangeButton();

projectsManager.setDeleteProjectButton();

//newProjectModal
const newProjectBtn = document.getElementById("newProjectBtn")


if (newProjectBtn){
    newProjectBtn.addEventListener("click", () => {showModal("newProjectModal")})
} else {
    console.warn("New projects button was not found")
}



//editProjectModal
const editProjectBtn = document.getElementById("editProject")


if (editProjectBtn){
    editProjectBtn.addEventListener("click", () => {
        (showModal("editProjectModal"));
        
        // Check if currentProject is not null
        if (projectsManager) {
            console.log(projectsManager.currentProject?.id); // Access currentProject.name safely
        } else {
            console.warn("projectsManager is null!");
        }
    
    })

} else {
    console.warn("Edit projects button was not found")
}

//deleteProjectModal
const deleteProjectBtn = document.getElementById("deleteProjectBtn")


if (deleteProjectBtn){
    deleteProjectBtn.addEventListener("click", () => {
        (showModal("DeleteProjectModal"));
        console.log("now testing again");
        
        // Check if currentProject is not null
        if (projectsManager) {
            console.log(projectsManager); // Access currentProject.name safely
        } else {
            console.warn("projectsManager is null!");
        }
    
    })

} else {
    console.warn("Edit projects button was not found")
}


//newUserModal
const newUserBtn = document.getElementById("newUserBtn")

if (newUserBtn){
    newUserBtn.addEventListener("click", () => {showModal("newUserModal")})
} else {
    console.warn("New projects button was not found")
}


//newCompanyModal
const newCompanyBtn = document.getElementById("newCompanyBtn")

if (newCompanyBtn){
    newCompanyBtn.addEventListener("click", () => {showModal("newCompanyModal")})
} else {
    console.warn("New company button was not found")
}

//insightModal
const insightBtn = document.getElementById("insightsBtn")

if (insightBtn){
    insightBtn.addEventListener("click", () => {showModal("insightsModal")})
} else {
    console.warn("insightsModal button was not found")
}

//insightModal2
const insightBtn2 = document.getElementById("insightsBtn2")

if (insightBtn2){
    insightBtn2.addEventListener("click", () => {showModal("insightsModal")})
} else {
    console.warn("insightsModal2 button was not found")
}

//servicesModal
const servicesBtn = document.getElementById("servicesBtn")

if (servicesBtn){
    servicesBtn.addEventListener("click", () => {showModal("servicesModal")})
} else {
    console.warn("servicesModal button was not found")
}

//servicesModal2
const servicesBtn2 = document.getElementById("servicesBtn2")

if (servicesBtn2){
    servicesBtn2.addEventListener("click", () => {showModal("servicesModal")})
} else {
    console.warn("servicesModal2 button was not found")
}

//npInfoModal
const npInfoBtn = document.getElementById("npInfoBtn")

if (npInfoBtn){
    npInfoBtn.addEventListener("click", () => {showModal("npInfoModal")})
} else {
    console.warn("npInfo Modal button was not found")
}

//npInfoModal2
const npInfoBtn2 = document.getElementById("npInfoBtn2")

if (npInfoBtn2){
    npInfoBtn2.addEventListener("click", () => {showModal("npInfoModal")})
} else {
    console.warn("npInfo2 Modal button was not found")
}

//loginModal
const infoLogINBtn = document.getElementById("infoLogINBtn")

if (infoLogINBtn){
    infoLogINBtn.addEventListener("click", () => {showModal("loginModal")})
} else {
    console.warn("login Modal button was not found")
}

//loginModalEnd
const logINBtnEnd = document.getElementById("logINBtnEnd")

if (logINBtnEnd){
    logINBtnEnd.addEventListener("click", () => {showModal("loginModal")})
} else {
    console.warn("logINBtnEnd  button was not found")
}

//newAccountBtn
const newAccountBtn = document.getElementById("newAccountBtn");

if (newAccountBtn) {
    newAccountBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Prevents the form from submitting
        console.log("newAccountBtn clicked");
        showModal("newAccountModal");
    });
} else {
    console.warn("newAccountBtn was not found");
}


//Add event listener to logIn button(Main Page)
const logINBtn = document.getElementById("logINBtn");
logINBtn?.addEventListener("click", ()=> {
    const projectsPage = document.getElementById("projectsPage") as HTMLDivElement;
    const usersPage = document.getElementById("usersPage") as HTMLDivElement;
    const detailsPage = document.getElementById("projectDetails") as HTMLDivElement;
    const introPage = document.getElementById("intro") as HTMLDivElement;
    const sidebar = document.getElementById("sidebar") as HTMLDivElement;
    if (!(projectsPage && detailsPage)) return console.warn("Pages not found");
    detailsPage.style.display = "none";
    usersPage.style.display = "none";
    projectsPage.style.display = "flex";
    introPage.style.display = "none";
    sidebar.style.display = "flex";
    // Get buttons to hide
    const insightsBtn = document.getElementById("insightsBtn") as HTMLButtonElement;
    const servicesBtn = document.getElementById("servicesBtn") as HTMLButtonElement;
    const npInfoBtn = document.getElementById("npInfoBtn") as HTMLButtonElement;
    // Hide specific buttons
    insightsBtn.style.display = "none";
    servicesBtn.style.display = "none";
    npInfoBtn.style.display = "none";

})


// Add event listener to Projects button
const projectsBtn = document.getElementById("projectsBtn") as HTMLLIElement;
const usersBtn = document.getElementById("usersBtn") as HTMLLIElement;

projectsBtn?.addEventListener("click", () => {
    const projectsPage = document.getElementById("projectsPage") as HTMLDivElement;
    const usersPage = document.getElementById("usersPage") as HTMLDivElement;
    const detailsPage = document.getElementById("projectDetails") as HTMLDivElement;
    const introPage = document.getElementById("intro") as HTMLDivElement;
    const sidebar = document.getElementById("sidebar") as HTMLDivElement;
    console.log(projectsManager.list)

    if (!(projectsPage && usersPage)) {
        return console.warn("Pages not found");
    }

    // Hide other pages and show the Projects page
    usersPage.style.display = "none";
    detailsPage.style.display = "none";
    introPage.style.display = "none";
    projectsPage.style.display = "flex"; // Show Projects page
    sidebar.style.display = "flex";

    // Set the Projects button to active style
    projectsBtn.classList.add("active");
    projectsBtn.innerHTML = `<span class="material-icons-round">maps_home_work</span> Projects`;

    

    // Reset Users button to default style
    usersBtn.classList.remove("active");
    usersBtn.innerHTML = `<span class="material-icons-round">group</span> Users`; // Keep the icon and text
});



// Add event listener to Users button
usersBtn?.addEventListener("click", () => {
    const projectsPage = document.getElementById("projectsPage") as HTMLDivElement;
    const usersPage = document.getElementById("usersPage") as HTMLDivElement;
    const detailsPage = document.getElementById("projectDetails") as HTMLDivElement;
    const introPage = document.getElementById("intro") as HTMLDivElement;
    const sidebar = document.getElementById("sidebar") as HTMLDivElement;

    if (!(projectsPage && usersPage)) {
        return console.warn("Pages not found");
    }

    // Page changes
    projectsPage.style.display = "none";
    usersPage.style.display = "flex";
    detailsPage.style.display = "none";
    introPage.style.display = "none";
    sidebar.style.display = "flex";

    // Set Users button to active style
    if (usersBtn) {
        usersBtn.classList.add("active"); // Add the active class
        usersBtn.innerHTML = `<span class="material-icons-round">group</span> Users`; // Keep the icon and text
    }

    // Revert Projects button to default style
    if (projectsBtn) {
        projectsBtn.classList.remove("active"); // Remove the active class
        projectsBtn.innerHTML = `<span class="material-icons-round">maps_home_work</span> Projects`; // Keep the icon and text
    }

    // Refresh the users UI
    console.log("Refreshing users UI...");
    // usersManagerInstance.refreshUsersUI(); // No longer needed, UI is now managed by React
});

/**
 * Handles the submission of the "New Project" form:
 * - Prevents default form submission behavior.
 * - Extracts form input values using FormData.
 * - Constructs an IProject object with the provided data.
 * - Creates a new project instance using ProjectsManager.
 * - Resets the form and closes the modal dialog for a clean user experience.
 */
const projectForm =  document.getElementById("newProjectForm")
if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (e) => {
        e.preventDefault()
        
        const formData = new FormData(projectForm)
        const ProjectData: IProject = {
            icon:formData.get("icon") as string,
            color:formData.get("color") as string,
            name:formData.get("name") as string,
            description:formData.get("description") as string,
            userRole:formData.get("userRole") as userRole,
            location:formData.get("location") as string,
            progress: formData.get("progress") ? parseFloat(formData.get("progress") as string) : 0,
            cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : 0,
            status:formData.get("status") as status,
            phase:formData.get("phase") as phase,
            startDate:formData.get("startDate") as string,
            finishDate:formData.get("finishDate") as string,
        }
        try {
            const project = projectsManager.newProject(ProjectData)
            projectForm.reset()
            closeModal("newProjectModal")
        } catch(error) {
            alert(error)
        }
        
        
        
    })
}   else {
    console.warn("The project form was not found. Check the ID!")
}




/**
 * Handles the submission of the "New Users" form:
 * - Prevents default form submission behavior.
 * - Extracts form input values using FormData.
 * - Constructs an IProject object with the provided data.
 * - Creates a new project instance using ProjectsManager.
 * - Resets the form and closes the modal dialog for a clean user experience.
 */
const usersListUI = document.getElementById("usersList") as HTMLElement;


// Function to update the user count
function updateUserCount() {
    // Assuming you have a list of users in your HTML or you can fetch it from an API
    const usersList = document.getElementById('usersList');
    console.log("Let's check if I can read the users list")
    console.log(usersList)
    const userCountElement = document.getElementById('userCount');

    if (usersList && userCountElement) {
        const userCount = usersList.children.length;
        userCountElement.textContent = String(userCount);
    }
}

// Call the function to update the user count when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    updateUserCount();
});

// Function to populate the select elements with user options
function populateUserSelects() {
    const usersList = document.getElementById('usersList');
    const responsiblePersonSelect = document.getElementById('toDoCreatedBy');
    const createdBySelect = document.getElementById('toDoAssignedTo');
    const editResponsiblePersonSelect = document.getElementById('editToDoCreatedBy');
    const editCreatedBySelect = document.getElementById('editToDoAssignedTo');
    

    if (usersList && responsiblePersonSelect && createdBySelect && editResponsiblePersonSelect && editCreatedBySelect) {
        // Clear existing options
        responsiblePersonSelect.innerHTML = '';
        createdBySelect.innerHTML = '';
        editResponsiblePersonSelect.innerHTML = '';
        editCreatedBySelect.innerHTML = '';

        // Populate with new options
        Array.from(usersList.children).forEach((userItem) => {
            const userName = userItem.querySelector('.fullName')?.textContent || '';

            const option = document.createElement('option');
            option.value = userName;
            option.textContent = userName;

            responsiblePersonSelect.appendChild(option.cloneNode(true));
            createdBySelect.appendChild(option.cloneNode(true));
            editResponsiblePersonSelect.appendChild(option.cloneNode(true));
            editCreatedBySelect.appendChild(option.cloneNode(true));
        });
    } else {
        console.warn("One or more elements were not found. Check the IDs!");
    }
}

// Call the function to populate the select elements when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    populateUserSelects();
});

/**
 * Handles the submission of the "To Do" form:
 * - Prevents default form submission behavior.
 * - Extracts form input values using FormData.
 * - Constructs an IToDo object with the provided data.
 * - Creates a new project instance using ProjectsManager.
 * - Resets the form and closes the modal dialog for a clean user experience.
 */
 if (projectsManager?.currentProject?.id != null) {
    const currentID = projectsManager.currentProject.id;
} else {
    console.log("ID is null or undefined");
}

const toDoForm = document.getElementById("newToDoForm");
const editToDoForm = document.getElementById("editToDoForm");

if (toDoForm && toDoForm instanceof HTMLFormElement) {
    toDoForm.addEventListener("submit", (e) => {
        console.log("testing toDoForm")
        e.preventDefault();

        const formData = new FormData(toDoForm);
        const dependencies = formData.get("toDoDependencies") as string;
        if (projectsManager?.currentProject?.id != null) {
        const toDoData: ItoDo = {
            title: formData.get("toDoTitle") as string,
            description: formData.get("toDoDescription") as string,
            status: formData.get("toDoStatus") as toDoStatus,
            priority: formData.get("toDoPriority") as toDoPriority,
            project_id: projectsManager.currentProject.id,
            assigned_to: formData.get("toDoAssignedTo") as string,
            created_by: formData.get("toDoCreatedBy") as string,
            created_at: formData.get("toDoCreatedAt") as string,
            updated_at: formData.get("toDoUpdatedAt") as string,
            due_date: formData.get("toDoDueDate") as string,
            start_date: formData.get("toDoStartDate") as string,
            completion_date: formData.get("toDoCompletionDate") as string,
            estimated_hours: formData.get("toDoEstimatedHours") ? Number(formData.get("toDoEstimatedHours")) : 0,
            actual_hours: formData.get("toDoActualHours") ? Number(formData.get("toDoActualHours")) : 0,
            dependencies: dependencies ? dependencies.split(',') : [],
            progress_percentage: formData.get("toDoProgress") as toDoPercentage,
            comments: formData.get("toDoComments") ? (formData.get("toDoComments") as string).split(',') : []
        };

        try {
            console.log("testing for ID",projectsManager.currentProject?.id)
            const toDo = toDoManagerInstance.newToDo(toDoData, projectsManager.currentProject?.id); // Use the instance of toDoManager
            toDoForm.reset();
            closeModal("newToDoModal");
        } catch (error) {
            alert(error);
        }
    }});
} else {
    console.warn("The to-do form was not found. Check the ID!");
}

if (editToDoForm && editToDoForm instanceof HTMLFormElement) {
    editToDoForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(editToDoForm);
        const dependencies = formData.get("toDoDependencies") as string;
        const toDoData: ItoDo = {
            title: formData.get("toDoTitle") as string,
            description: formData.get("toDoDescription") as string,
            status: formData.get("toDoStatus") as toDoStatus,
            priority: formData.get("toDoPriority") as toDoPriority,
            project_id: formData.get("toDoProject") as string,
            assigned_to: formData.get("toDoAssignedTo") as string,
            created_by: formData.get("toDoCreatedBy") as string,
            created_at: formData.get("toDoCreatedAt") as string,
            updated_at: formData.get("toDoUpdatedAt") as string,
            due_date: formData.get("toDoDueDate") as string,
            start_date: formData.get("toDoStartDate") as string,
            completion_date: formData.get("toDoCompletionDate") as string,
            estimated_hours: formData.get("toDoEstimatedHours") ? Number(formData.get("toDoEstimatedHours")) : 0,
            actual_hours: formData.get("toDoActualHours") ? Number(formData.get("toDoActualHours")) : 0,
            dependencies: dependencies ? dependencies.split(',') : [],
            progress_percentage: formData.get("toDoProgress") as toDoPercentage,
            comments: formData.get("toDoComments") ? (formData.get("toDoComments") as string).split(',') : []
        };
        console.log("testing editToDoForm")
        try {
            // Update the existing to-do item
            const toDo = toDoManagerInstance.updateToDo(toDoData); // Implement the updateToDo method in toDoManager
            editToDoForm.reset(); //to be checked
            closeModal("editToDoModal");
        } catch (error) {
            //alert(error);
        }
    });
} else {
    console.warn("The edit to-do form was not found. Check the ID!");
}

// Function to open the edit modal and populate it with existing data
function openEditToDoModal(toDoData: ItoDo) {
    const editToDoModal = document.getElementById("editToDoModal") as HTMLDialogElement;
    if (editToDoModal) {
        // Populate the form with existing data
        (document.getElementById("editToDoTitle") as HTMLInputElement).value = toDoData.title;
        (document.getElementById("editToDoDescription") as HTMLTextAreaElement).value = toDoData.description;
        (document.getElementById("editToDoStatus") as HTMLSelectElement).value = toDoData.status;
        (document.getElementById("editToDoPriority") as HTMLSelectElement).value = toDoData.priority;
        (document.getElementById("editToDoAssignedTo") as HTMLSelectElement).value = toDoData.assigned_to;
        (document.getElementById("editToDoCreatedBy") as HTMLSelectElement).value = toDoData.created_by;
        (document.getElementById("editToDoStartDate") as HTMLInputElement).value = toDoData.start_date;
        (document.getElementById("editToDoUpdatedAt") as HTMLInputElement).value = toDoData.updated_at;
        (document.getElementById("editToDoEstimatedHours") as HTMLInputElement).value = toDoData.estimated_hours.toString();
        (document.getElementById("editToDoActualHours") as HTMLInputElement).value = toDoData.actual_hours.toString();
        (document.getElementById("editToDoDueDate") as HTMLInputElement).value = toDoData.due_date;
        (document.getElementById("editToDoDependencies") as HTMLSelectElement).value = toDoData.dependencies.join(", ");
        (document.getElementById("editToDoComments") as HTMLTextAreaElement).value = toDoData.comments.join(", ");

        // Open the modal
        editToDoModal.showModal();
    } else {
        console.warn("The edit to-do modal was not found. Check the ID!");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const showMoreButton = document.getElementById('showMoreButton');
    const showLessButton = document.getElementById('showLessButton');
    const hiddenItems = document.querySelectorAll('.grid-item.hidden');

    // Show More: Display hidden items and toggle buttons
    showMoreButton?.addEventListener('click', () => {
        hiddenItems.forEach(item => item.classList.remove('hidden'));

        if (showMoreButton) showMoreButton.style.display = 'none';
        if (showLessButton) showLessButton.style.display = 'inline-block';
    });

    // Show Less: Hide extra items and toggle buttons
    showLessButton?.addEventListener('click', () => {
        hiddenItems.forEach(item => item.classList.add('hidden'));

        if (showLessButton) showLessButton.style.display = 'none';
        if (showMoreButton) showMoreButton.style.display = 'inline-block';
    });});


// Function to format the date as dd.mm.yy
function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

// Get today's date
const today = new Date();

// Format the date and display it in the span elements
document.addEventListener('DOMContentLoaded', () => {
    const currentDateElement = document.getElementById('currentDate');
    const updateDateElement = document.getElementById('updateDate');
    if (currentDateElement) {
        currentDateElement.textContent = formatDate(today);
    }
    if (updateDateElement) {
        updateDateElement.textContent = formatDate(today);
    }
});

// Update the update date when the form is submitted
document.getElementById('newToDoForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const updateDateElement = document.getElementById('updateDate');
    if (updateDateElement) {
        updateDateElement.textContent = formatDate(new Date());
    }
    // Add your form submission logic here
});

document.getElementById("editToDoForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Extract data from form fields
    const toDoId = (document.getElementById("editToDoId") as HTMLInputElement).value ?? '';
    const title = (document.getElementById("editToDoTitle") as HTMLInputElement).value ?? '';
    const description = (document.getElementById("editToDoDescription") as HTMLTextAreaElement).value ?? '';
    const status = (document.getElementById("editToDoStatus") as HTMLSelectElement).value as toDoStatus ?? 'Pending';
    const priority = (document.getElementById("editToDoPriority") as HTMLSelectElement).value as toDoPriority ?? 'Low';
    const assigned_to = (document.getElementById("editToDoAssignedTo") as HTMLSelectElement).value ?? '';
    const created_by = (document.getElementById("editToDoCreatedBy") as HTMLSelectElement).value ?? '';
    const start_date = (document.getElementById("editToDoStartDate") as HTMLInputElement).value ?? '';
    const updated_at = (document.getElementById("editToDoUpdatedAt") as HTMLInputElement).value ?? '';
    const estimated_hours = parseFloat((document.getElementById("editToDoEstimatedHours") as HTMLInputElement).value ?? '0');
    const actual_hours = parseFloat((document.getElementById("editToDoActualHours") as HTMLInputElement).value ?? '0');
    const due_date = (document.getElementById("editToDoDueDate") as HTMLInputElement).value ?? '';
    const dependencies = (document.getElementById("editToDoDependencies") as HTMLInputElement).value?.split(", ") ?? [];
    const comments = (document.getElementById("editToDoComments") as HTMLTextAreaElement).value?.split(", ") ?? [];

    // Find the corresponding toDo instance
    const toDoInstance = toDoManagerInstance.findToDoById(toDoId);
    if (!toDoInstance) {
        alert("Error: To-Do item not found");
        return;
    }

    // Update the toDo instance
    toDoInstance.title = title;
    toDoInstance.description = description;
    toDoInstance.status = status;
    toDoInstance.priority = priority;
    toDoInstance.assigned_to = assigned_to;
    toDoInstance.created_by = created_by;
    toDoInstance.start_date = start_date;
    toDoInstance.updated_at = updated_at;
    toDoInstance.estimated_hours = estimated_hours;
    toDoInstance.actual_hours = actual_hours;
    toDoInstance.due_date = due_date;
    toDoInstance.dependencies = dependencies;
    toDoInstance.comments = comments;

    // Update the UI
    toDoInstance.updateUI();

    // Close the modal
    closeModal("editToDoModal");
});

document.getElementById('newToDoForm')!.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!projectsManager.currentProject?.id) {
        console.error("currentProjectId is null");
        return;
    }

    console.log("this is the id in index",projectsManager.currentProject?.id)
    console.log("this is the list of toDos",toDosManager.getToDoListUI)

    const newToDoData: ItoDo = {
        title: (document.getElementById('toDoTitle') as HTMLInputElement).value,
        description: (document.getElementById('toDoDescription') as HTMLTextAreaElement).value,
        status: (document.getElementById('toDoStatus') as HTMLSelectElement).value as toDoStatus,
        priority: (document.getElementById('toDoPriority') as HTMLSelectElement).value as toDoPriority,
        project_id: projectsManager.currentProject?.id,
        assigned_to: (document.getElementById('toDoAssignedTo') as HTMLSelectElement).value,
        created_by: (document.getElementById('toDoCreatedBy') as HTMLSelectElement).value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: (document.getElementById('toDoDueDate') as HTMLInputElement).value,
        start_date: (document.getElementById('toDoStartDate') as HTMLInputElement).value,
        completion_date: '',
        estimated_hours: parseFloat((document.getElementById('toDoEstimatedHours') as HTMLInputElement).value),
        actual_hours: parseFloat((document.getElementById('toDoActualHours') as HTMLInputElement).value),
        dependencies: [],
        progress_percentage: '0%' as toDoPercentage,
        comments: []
    };

    toDoManagerInstance.newToDo(newToDoData, projectsManager.currentProject?.id);

    closeModal('newToDoModal');
});

// Export all to-dos and users
function exportData() {
    const toDos = toDoManagerInstance.exportToDos();
    const users = projectsManager.exportUsers();
    const companies = companiesManagerInstance.exportCompanies();
    return { toDos, users, companies };
}

// Example usage
const exportedData = exportData();
console.log("Exported Data:", exportedData);

function openChangeUserModal(userId: string) {
    console.log(`openChangeUserModal called for userId: ${userId}`);

    // Find the user in the global users array
    const user = users.find(u => u.id === userId);
    if (!user) {
        console.error(`User with ID ${userId} not found in the users array`);
        console.log("Current users array:", users);
        return;
    }

    console.log("User found:", user);

    // Get the form fields in the ChangeUserModal
    const nameInput = document.querySelector<HTMLInputElement>("input[name='CH_name']");
    if (!nameInput) console.error("Name input field not found");

    const surnameInput = document.querySelector<HTMLInputElement>("input[name='CH_surname']");
    if (!surnameInput) console.error("Surname input field not found");

    const emailInput = document.querySelector<HTMLInputElement>("input[name='CH_email']");
    if (!emailInput) console.error("Email input field not found");

    const phoneInput = document.querySelector<HTMLInputElement>("input[name='CH_phone']");
    if (!phoneInput) console.error("Phone input field not found");

    const roleSelect = document.querySelector<HTMLSelectElement>("select[name='CH_usersRole']");
    if (!roleSelect) console.error("Role select field not found");

    const accessSelect = document.querySelector<HTMLSelectElement>("select[name='CH_access']");
    if (!accessSelect) console.error("Access select field not found");

    const companyInput = document.querySelector<HTMLInputElement>("input[name='CH_company']");
    if (!companyInput) console.error("Company input field not found");

    // Prefill the form fields with the user's data
    if (nameInput) nameInput.value = user.name;
    if (surnameInput) surnameInput.value = user.surname;
    if (emailInput) emailInput.value = user.email;
    if (phoneInput) phoneInput.value = user.phone;
    if (roleSelect) roleSelect.value = user.role;
    if (accessSelect) accessSelect.value = user.access;
    if (companyInput) companyInput.value = user.company;

    // Open the ChangeUserModal
    const changeUserModal = document.getElementById("ChangeUserModal") as HTMLDialogElement;
    if (changeUserModal) {
        console.log("Opening modal...");
        changeUserModal.dataset.userId = userId; // Store the user's id in the modal
        changeUserModal.showModal(); // Open the modal
        console.log("Modal opened successfully");
    } else {
        console.error("ChangeUserModal not found in the DOM");
    }
}


// Update the user's UI
usersManagerInstance.setUserChangeButton(); // Ensure the change button is set



// Debugging: Print the updated users array
console.log("Updated users array:", users);
