import { IProject, status, userRole, phase} from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"
import { IUser, usersRole, access} from "./classes/User"
import { UsersManager } from "./classes/UsersManager"
import { ICompany} from "./classes/Companies"
import { CompanyManager } from "./classes/CompaniesManager"

//Languages import

let currentLanguage = 'en';

import { translations } from "./text/Language"


//Shows a modal. If the modal id is not found, it will show an error
function showModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement){
        modal.showModal()
    }   else {
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}

//Closes a modal. If the modal id is not found, it will show an error
function closeModal(id: string) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement){
        modal.close()
    }   else {
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}


// Attach to the global window object
(window as any).closeModal = closeModal;

const projectsListUI = document.getElementById("projectsList") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

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
    editProjectBtn.addEventListener("click", () => {showModal("editProjectModal")})
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


//Button Login temporary:
const logINBtn = document.getElementById("logINBtn");

if (logINBtn) {
    logINBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Prevents the form from submitting
        console.log("logINBtn clicked");
        showModal("newAccountModal");
    });
} else {
    console.warn("logINBtn was not found");
}

/*Add event listener to logIn button(Main Page)
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

})*/


// Add event listener to Projects button
const projectsBtn = document.getElementById("projectsBtn") as HTMLLIElement;
const usersBtn = document.getElementById("usersBtn") as HTMLLIElement;

projectsBtn?.addEventListener("click", () => {
    const projectsPage = document.getElementById("projectsPage") as HTMLDivElement;
    const usersPage = document.getElementById("usersPage") as HTMLDivElement;
    const detailsPage = document.getElementById("projectDetails") as HTMLDivElement;
    const introPage = document.getElementById("intro") as HTMLDivElement;
    const sidebar = document.getElementById("sidebar") as HTMLDivElement;

    if (!(projectsPage && usersPage)) {
        return console.warn("Pages not found");
    }

    // Page changes
    usersPage.style.display = "none";
    projectsPage.style.display = "flex";
    detailsPage.style.display = "none";
    introPage.style.display = "none";
    sidebar.style.display = "flex";

    // Set Projects button to active style
    if (projectsBtn) {
        projectsBtn.classList.add("active"); // Add the active class
        projectsBtn.innerHTML = `<span class="material-icons-round">maps_home_work</span> Projects`; // Keep the icon and text
    }

    // Revert Users button to default style
    if (usersBtn) {
        usersBtn.classList.remove("active"); // Remove the active class
        usersBtn.innerHTML = `<span class="material-icons-round">group</span> Users`; // Keep the icon and text
    }
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
const usersListUI = document.getElementById("usersList") as HTMLElement
const usersManager = new UsersManager(usersListUI)

const userForm = document.getElementById("newUserForm")
if (userForm && userForm instanceof HTMLFormElement) {
    userForm.addEventListener("submit", (e) => {
        e.preventDefault()
        
        const formData = new FormData(userForm)
        const UserData: IUser = {
            name: formData.get("name") as string,
            surname: formData.get("surname") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            role: formData.get("role") as usersRole,
            access: formData.get("access") as access,
            company: formData.get("company") as string
        }
        const user = usersManager.newUser(UserData)
        userForm.reset()
        if (usersManager.list.length === 0) {
            console.log("No users found.");
        } else {
            console.log("List of Users:");
            usersManager.list.forEach((user, index) => {
                console.log(
                    `${index + 1}. Name: ${user.name} ${user.surname}, Email: ${user.email}, Role: ${user.role}, Access: ${user.access}`
                );
            });
        }
        closeModal("newUserModal")
    })
} else {
    console.warn("The user form was not found. Check the ID!")
}


/**
 * Handles the submission of the "New Company" form:
 * - Prevents default form submission behavior.
 * - Extracts form input values using FormData.
 * - Constructs an IProject object with the provided data.
 * - Creates a new project instance using ProjectsManager.
 * - Resets the form and closes the modal dialog for a clean user experience.
 */
const companyListUI = document.getElementById("companyList") as HTMLElement
const companyManager = new CompanyManager(usersListUI)

const companyForm = document.getElementById("newCompanyForm")
if (companyForm && companyForm instanceof HTMLFormElement) {
    companyForm.addEventListener("submit", (e) => {
        e.preventDefault()
        
        const formData = new FormData(companyForm)
        const CompanyData: ICompany = {
            cName: formData.get("cName") as string,
            cAddress: formData.get("cAddress") as string,
            cEmail: formData.get("cEmail") as string,
            cPhone: formData.get("cPhone") as string
        }
        const company = companyManager.newCompany(CompanyData)
        companyForm.reset()
        if (companyManager.list.length === 0) {
            console.log("No companies found.");
        } else {
            console.log("List of Companies:");
            companyManager.list.forEach((company, index) => {
                console.log(
                    `${index + 1}. cName: ${company.cName}, cAddress: ${company.cAddress}, cEmail: ${company.cEmail}, cPhone: ${company.cPhone}`
                );
            });
        }
        closeModal("newCompanyModal")
    })
} else {
    console.warn("The Company form was not found. Check the ID!")
}

const exportProjectsBtn = document.getElementById("exportProjectsBtn")
if (exportProjectsBtn) {
    exportProjectsBtn.addEventListener("click", () => {
        projectsManager.exportToJSON()
    })
}

const importProjectsBtn = document.getElementById("importProjectsBtn")
if (importProjectsBtn) {
    importProjectsBtn.addEventListener("click", () => {
        projectsManager.importFromJSON()
    })
}


// Show/Hide Menu
document.getElementById("languageButton")!.addEventListener("click", () => {
    const menu = document.getElementById("languageMenu")!;
    menu.classList.toggle("hidden");
    if (!menu.classList.contains("hidden")) {
        updateMenuText(currentLanguage);
    }
});

// Change Language
document.querySelectorAll("#languageMenu li").forEach((item) => {
    item.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement) {
            const lang = event.target.getAttribute("data-lang");
            if (lang) {
                currentLanguage = lang;
                updateLanguage(currentLanguage);
                const menu = document.getElementById("languageMenu");
                if (menu) {
                    menu.classList.add("hidden");
                }
            }
        }
    });
});

// Update Language
function updateLanguage(language: string) {
    document.querySelectorAll("[data-lang]").forEach((element) => {
        const key = element.getAttribute("data-lang");
        if (key && translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
}

// Update Menu Text (language switcher)
function updateMenuText(language: string) {
    const menuItems = document.querySelectorAll("#languageMenu li");
    menuItems.forEach((item) => {
        const lang = item.getAttribute("data-lang");
        if (lang && translations[language]) {
            item.textContent = translations[language][lang];
        }
    });
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
    });
});