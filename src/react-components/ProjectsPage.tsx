import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from "firebase/firestore"
import { IProject, userRole, status, phase, Project } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { ProjectCard } from './ProjectCard';
import { NewProjectForm } from './NewProjectForm';
import { useTranslation } from "./LanguageContext";
import { SearchBox } from './SearchBox';
import { getCollection } from '../firebase';
import { companiesManagerInstance } from '../classes/CompaniesManager';
import { usersManagerInstance } from '../classes/UsersManager';

interface Props {
    projectManager: ProjectsManager;
    customStyle?: React.CSSProperties;
}

const projectsCollection = getCollection<IProject>("/projects");

export function ProjectsPage({ projectManager, customStyle }: Props) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    
    // Load companies and users data
    const [companies, setCompanies] = React.useState(companiesManagerInstance.getCompanies());
    const [users, setUsers] = React.useState(usersManagerInstance.getUsers());
    
    // Update UI when projects are created or deleted
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    // Set up callbacks
    React.useEffect(() => {
        projectManager.onProjectCreated = () => { forceUpdate(); };
        projectManager.onProjectUpdated = () => { forceUpdate(); };
        projectManager.onProjectDeleted = () => { forceUpdate(); };
        projectManager.onProjectsImported = () => { forceUpdate(); }; // Add this callback
        projectManager.onProjectError = (error: string) => {
            console.error('Project error:', error);
            // Error handling is now managed by ProjectForm
        };
        
        // Load companies and users data on mount
        const loadData = async () => {
            try {
                setCompanies(companiesManagerInstance.getCompanies());
                setUsers(usersManagerInstance.getUsers());
            } catch (error) {
                console.error('Error loading companies/users:', error);
            }
        };
        
        loadData();
    }, [projectManager]);

    const filteredProjects = projectManager.filterByName(searchQuery);

    // Manual refresh function for projects
    const handleRefreshProjects = async () => {
        setIsRefreshing(true);
        try {
            console.log('[ProjectsPage] Manually refreshing projects...');
            await projectManager.refreshProjectsFromFirebase();
            forceUpdate(); // Force UI update
            console.log(`[ProjectsPage] Projects refreshed. Total: ${projectManager.list.length}`);
        } catch (error) {
            console.error('Failed to refresh projects:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Load projects when component mounts - now uses cached data
    React.useEffect(() => {
        const loadInitialData = async () => {
            try {
                console.log('[ProjectsPage] Loading initial project data...');
                
                // Projects are already loaded at app level - just force UI update
                forceUpdate();
                console.log(`[ProjectsPage] Loaded ${projectManager.list.length} projects from manager`);
                
            } catch (error) {
                console.error('Failed to load initial project data:', error);
                // Error handling is now managed by individual components
            }
        };
        
        loadInitialData();
    }, [projectManager]);
    
    const projectCards = filteredProjects.map((project) => {
        return (
            <Router.Link to={`/project/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProjectCard project={project} />
            </Router.Link>
        )
    })

    React.useEffect(() => {
        console.log("Projects state updated", projectManager.list)
        const grid = document.querySelector('.project-cards-grid');
        if (grid) {
            console.log('Grid width:', grid.clientWidth);
        }
    }, [projectManager.list])
    

    const onNewProjectClick = () => {
        setIsModalOpen(true);
    };

    const onExportClick = () => {
        projectManager.exportToJSON()
    }
    

    const onImportClick = () => {
        projectManager.importFromJSON(); // Remove callback - handled by onProjectsImported
    }


    const handleNewProject = async (projectData: Omit<IProject, 'id'>) => {
        try {
            // Create the project (this will save it to Firebase automatically)
            const project = await projectManager.newProject(projectData);
            setIsModalOpen(false);
        } catch (error) {
            // Re-throw the error for ProjectForm to handle
            throw error;
        }
    };

    return (
        <div className="page" id="projectsPage">
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div className="projects-content">
                <header className="projects-content-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
                        <SearchBox onValueChange={setSearchQuery} placeholder={t("search_projects") || "Search for projects"} style={{ width: '100%', maxWidth: 350 }} />
                        <button 
                            className="buttonTertiary" 
                            onClick={handleRefreshProjects}
                            disabled={isRefreshing}
                            title={t("projects_refresh") || "Refresh projects from database"}
                            style={{ opacity: isRefreshing ? 0.6 : 1 }}
                        >
                            <span className="material-icons-round" style={{ 
                                animation: isRefreshing ? 'spin 1s linear infinite' : 'none' 
                            }}>
                                refresh
                            </span>
                        </button>
                        <button id="importProjectsBtn" className="buttonTertiary" onClick={onImportClick} title={t("projects_import") || "Import projects"}>
                            <span className="material-icons-round">file_download</span>
                        </button>
                        <button id="exportProjectsBtn" className="buttonTertiary" onClick={onExportClick} title={t("projects_export") || "Export projects"}>
                            <span className="material-icons-round">file_upload</span>
                        </button>
                        <button onClick={onNewProjectClick} id="newProjectBtn" className="buttonTertiary" title={t("projects_new") || "New project"}>
                            <span className="material-icons-round">add</span>
                        </button>
                    </div>
                </header>
                <div className="project-cards-grid">
                    {projectCards}
                </div>
                {filteredProjects.length === 0 && (
                    <p style={{ textAlign: 'center', marginTop: 32, fontSize: 18, color: '#888' }}>
                        There are no projects to display!
                    </p>
                )}
            </div>
            <NewProjectForm
                isVisible={isModalOpen}
                onSubmit={handleNewProject}
                onCancel={() => setIsModalOpen(false)}
                title={t("projects_new") || "New Project"}
                companies={companies}
                users={users}
            />
        </div>
    )
}