import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from "firebase/firestore"
import { IProject, userRole, status, phase, Project } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { ProjectCard } from './ProjectCard';
import { useTranslation } from "./LanguageContext";
import { SearchBox } from './SearchBox';
import { getCollection } from '../firebase';

interface Props {
    projectManager: ProjectsManager;
    customStyle?: React.CSSProperties;
}

const projectsCollection = getCollection<IProject>("/projects");

export function ProjectsPage({ projectManager, customStyle }: Props) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    
    // Update UI when projects are created or deleted
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    // Set up callbacks
    React.useEffect(() => {
        projectManager.onProjectCreated = () => { forceUpdate(); };
        projectManager.onProjectUpdated = () => { forceUpdate(); };
        projectManager.onProjectDeleted = () => { forceUpdate(); };
        projectManager.onProjectsImported = () => { forceUpdate(); }; // Add this callback
        projectManager.onProjectError = (error: string) => {
            setErrorMessage(error);
            setIsErrorModalOpen(true);
        };
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
            setErrorMessage('Failed to refresh projects. Please try again.');
            setIsErrorModalOpen(true);
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
                setErrorMessage('Failed to load project data. Please refresh the page.');
                setIsErrorModalOpen(true);
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


    const onFormSubmit = async (e: React.FormEvent) => {
        const projectForm = document.getElementById("newProjectForm");
        if (!(projectForm && projectForm instanceof HTMLFormElement)) {
            return;
        }
        e.preventDefault();

        const formData = new FormData(projectForm);
        
        // Generate icon from project name if not provided
        const projectName = formData.get("name") as string;
        const generateIcon = (name: string): string => {
            if (!name || name.trim().length === 0) return "PR";
            
            // Split name into words and take first letter of each word
            const words = name.trim().split(/\s+/);
            if (words.length >= 2) {
                return (words[0][0] + words[1][0]).toUpperCase();
            } else {
                // If single word, take first two letters
                return name.trim().substring(0, 2).toUpperCase();
            }
        };
        
        const ProjectData: IProject = {
            icon: formData.get("icon") as string || generateIcon(projectName), // Generate icon from name
            color: formData.get("color") as string || undefined, // Allow undefined so Project constructor generates random color
            name: projectName,
            description: formData.get("description") as string,
            userRole: formData.get("userRole") as userRole,
            location: formData.get("location") as string,
            progress: formData.get("progress") ? parseFloat(formData.get("progress") as string) : 0,
            cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : 0,
            status: formData.get("status") as status,
            phase: formData.get("phase") as phase,
            startDate: formData.get("startDate") as string,
            finishDate: formData.get("finishDate") as string,
        };

        try {
            // First create the project locally (this will generate random color if needed)
            const project = projectManager.newProject(ProjectData);
            
            // Then save the complete project data (including generated color and icon) to Firebase
            const completeProjectData = {
                icon: project.icon, // This will have the generated icon
                color: project.color, // This will have the generated random color
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
                assignedUsers: project.assignedUsers || [],
                toDos: project.toDos || []
            };
            
            await Firestore.addDoc(projectsCollection, completeProjectData);
            
            projectForm.reset(); // Reset the form
            setIsModalOpen(false);
        } catch (error) {
            setErrorMessage((error as Error).message);
            setIsErrorModalOpen(true);
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
            {isModalOpen && (
                <dialog id="newProjectModal" open>
                    <form onSubmit={(e) => {onFormSubmit(e)}} className="userForm form-wide" id="newProjectForm">
                    <h2>{t("projects_new") || "New Project"}</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">apartment</span>{t("projects_name") || "Name"}
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder={t("projects_name_placeholder") || "What's the name of your project?"}
                        />
                        <label className="label-tip">
                            {t("projects_name_tip") || "TIP give it a short name"}
                        </label>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">subject</span>{t("projects_description") || "Description"}
                        </label>
                        <textarea
                            name="description"
                            cols={30}
                            rows={5}
                            placeholder={t("projects_description_placeholder") || "Give your project a nice description!"}
                            defaultValue={""}
                        />
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">pin_drop</span>{t("projects_location") || "Location"}
                        </label>
                        <input
                            name="location"
                            type="text"
                            placeholder={t("projects_location_placeholder") || "Where is your project located?"}
                        />
                        <label className="label-tip" />
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">paid</span>{t("projects_cost") || "Estimated cost"}
                        </label>
                        <input
                            name="cost"
                            type="number"
                            placeholder={t("projects_cost_placeholder") || "What's the estimated cost of the project?"}
                        />
                        <label className="label-tip">
                            {t("projects_cost_tip") || "Estimated cost of the project"}
                        </label>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">percent</span>{t("projects_progress") || "Estimated Progress"}
                        </label>
                        <input
                            name="progress"
                            type="number"
                            placeholder={t("projects_progress_placeholder") || "What's the estimated completion progress of the project?"}
                        />
                        <label className="label-tip">
                            {t("projects_progress_tip") || "Estimated progress percentage of the project"}
                        </label>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">account_circle</span>{t("projects_role") || "Role"}
                        </label>
                        <select name="userRole">
                            <option>{t("projects_role_not_defined") || "not defined"}</option>
                            <option>{t("projects_role_architect") || "Architect"}</option>
                            <option>{t("projects_role_engineer") || "Engineer"}</option>
                            <option>{t("projects_role_developer") || "Developer"}</option>
                        </select>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">not_listed_location</span>
                            {t("projects_status") || "Status"}
                        </label>
                        <select name="status">
                            <option>{t("projects_status_pending") || "Pending"}</option>
                            <option>{t("projects_status_active") || "Active"}</option>
                            <option>{t("projects_status_finished") || "Finished"}</option>
                        </select>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_view_week</span>
                            {t("projects_phase") || "Design Phase"}
                        </label>
                        <select name="phase">
                            <option>{t("projects_phase_design") || "Design"}</option>
                            <option>{t("projects_phase_construction_project") || "Construction project"}</option>
                            <option>{t("projects_phase_execution") || "Execution"}</option>
                            <option>{t("projects_phase_construction") || "Construction"}</option>
                        </select>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}
                        </label>
                        <input name="startDate" type="date" />
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_month</span>{t("projects_finish_date") || "Finish Date"}
                        </label>
                        <input name="finishDate" type="date" />
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button
                            type="button"
                            className="cancelButton"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {t("projects_cancel") || "Cancel"}
                        </button>
                        <button type="submit" className="acceptButton">
                        {t("projects_accept") || "Accept"}
                        </button>
                    </div>
                    </form>
                </dialog>
            )}
            {isErrorModalOpen && (
                <dialog id="newProjectErrorModal" open>
                    <form
                    className="userForm"
                    id="newProjectErrorForm"
                    method="dialog"
                    style={{ boxSizing: "border-box"}}
                    >
                    <h2
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 20,
                        padding: 10,
                        margin: 0
                        }}
                    >
                        <span
                        className="material-icons-round"
                        style={{ fontSize: 20, verticalAlign: "middle" }}
                        >
                        warning
                        </span>
                        {t("projects_error") || "Error"}
                    </h2>
                    <div
                        style={{
                        borderTop: "2px solid var(--complementary200)",
                        marginTop: 8,
                        marginBottom: 16
                        }}
                    />
                    <p
                        id="errorMessage"
                        style={{ display: "flex", justifyContent: "center" }}
                    >
                        {errorMessage}
                    </p>
                    <div
                        style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
                    >
                        <button
                        type="button"
                        className="cancelButton"
                        style={{ marginRight: 10, height: 30 }}
                        onClick={() => setIsErrorModalOpen(false)}
                        >
                            OK
                        </button>
                    </div>
                    </form>
                </dialog>
            )}
        </div>
    )
}