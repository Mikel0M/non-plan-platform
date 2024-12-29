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
})

//Add event listener to logIn button End(Main Page)
const logINBtnEnd = document.getElementById("logINBtnEnd");
logINBtnEnd?.addEventListener("click", ()=> {
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
})

//Add event listener to Projects button
const projectsBtn = document.getElementById("projectsBtn");
projectsBtn?.addEventListener("click", ()=> {
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
})

//Add event listener to Users button
const usersBtn = document.getElementById("usersBtn");
usersBtn?.addEventListener("click", ()=> {
    const projectsPage = document.getElementById("projectsPage") as HTMLDivElement;
    const usersPage = document.getElementById("usersPage") as HTMLDivElement;
    const detailsPage = document.getElementById("projectDetails") as HTMLDivElement;
    const introPage = document.getElementById("intro") as HTMLDivElement;
    const sidebar = document.getElementById("sidebar") as HTMLDivElement;
    if (!(projectsPage && detailsPage)) return console.warn("Pages not found");
    detailsPage.style.display = "none";
    usersPage.style.display = "flex";
    projectsPage.style.display = "none";
    introPage.style.display = "none";
    sidebar.style.display = "flex";
})

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
            name:formData.get("name") as string,
            description:formData.get("description") as string,
            userRole:formData.get("userRole") as userRole,
            status:formData.get("status") as status,
            phase:formData.get("phase") as phase,
            startDate:new Date(formData.get("startDate") as string),
            finishDate:new Date(formData.get("finishDate") as string),
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