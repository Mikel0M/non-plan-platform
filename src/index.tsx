import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Router from 'react-router-dom';
import {Sidebar} from './react-components/Sidebar';
import { ProjectsPage } from './react-components/ProjectsPage';
import {Banner} from './react-components/Banner';
import { ProjectDetailsPage } from './react-components/ProjectDetailsPage';
import { projectsManagerInstance } from './classes/ProjectsManager';
import { ToDoPage } from "./react-components/ToDoPage";
import { UsersPage } from './react-components/UsersPage';
import { LanguageProvider } from "./react-components/LanguageContext";
import { usersManagerInstance } from "./classes/UsersManager";
import { AppWrapper } from './react-components/AppWrapper';

// Global state
export let currentProjectId: string | null = null;
export let currentLanguage = 'en';

// React Router setup
const rootElement = document.getElementById('app') as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement)
appRoot.render(
    <LanguageProvider>
        <AppWrapper>
            <Router.BrowserRouter>
                <Sidebar customStyle={{ zIndex: 1, position: "fixed" }} />
                <div id="main-content">
                    <Banner customStyle={{ zIndex: 3, position: "relative" }} />
                    <Router.Routes>
                        <Router.Route path="/" element={<ProjectsPage projectManager={projectsManagerInstance} />} />
                        <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManagerInstance} />} />
                        <Router.Route path="/toDo" element={<ToDoPage projectsManager={projectsManagerInstance} />} />
                        <Router.Route path="/users" element={<UsersPage usersManager={usersManagerInstance} projectsManager={projectsManagerInstance} />} />
                    </Router.Routes>
                </div>
            </Router.BrowserRouter>
        </AppWrapper>
    </LanguageProvider>
);

// Utility functions for modal management
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


// Attach to the global window object for modal functionality
(window as any).closeModal = closeModal;

export function setCurrentProjectId(projectId: string | null) {
    if (projectsManagerInstance?.currentProject?.id != null) {
        currentProjectId = projectsManagerInstance.currentProject.id;
    }
}

// Utility date formatting function
function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

// Make modal functions available globally for legacy compatibility
(window as any).showModal = showModal;
