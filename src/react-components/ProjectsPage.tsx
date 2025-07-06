import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from "firebase/firestore"
import { IProject, userRole, status, phase, Project } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { ProjectCard } from './ProjectCard';
import { useTranslation } from "./LanguageContext";
import { SearchBox } from './SearchBox';
import { firebaseDB } from '../firebase';

interface Props {
    projectManager: ProjectsManager;
    customStyle?: React.CSSProperties;
}

export function ProjectsPage({ projectManager, customStyle }: Props) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    // Update UI when projects are created or deleted
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    // Set up callbacks
    React.useEffect(() => {
        projectManager.onProjectCreated = () => { forceUpdate(); };
        projectManager.onProjectDeleted = () => { forceUpdate(); };
        projectManager.onProjectError = (error: string) => {
            setErrorMessage(error);
            setIsErrorModalOpen(true);
        };
    }, [projectManager]);

    const filteredProjects = projectManager.filterByName(searchQuery);

    const getFirestoreProject = async () => {
        try {
            const projectsCollection = Firestore.collection(firebaseDB, "projects") as Firestore.CollectionReference<IProject>;
            const firebaseProjects = await Firestore.getDocs(projectsCollection);
            for (const doc of firebaseProjects.docs) {
                const data = doc.data();
                console.log("Raw Firestore data:", data);
                
                // Add document ID to the data
                const projectData = {
                    ...data,
                    id: doc.id
                };
                
                try {
                    projectManager.newProject(projectData);
                } catch (error) {
                    // Error will be handled by the onProjectError callback
                    console.warn("Skipping project due to error:", error);
                }
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            setErrorMessage("Failed to load projects from database");
            setIsErrorModalOpen(true);
        }
    }

    React.useEffect(() => {
        getFirestoreProject();
    }, []);
    
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
        projectManager.importFromJSON(() => {
            // No need to update projects state, it's derived from projectManager.list
        });
    }


    const onFormSubmit = (e: React.FormEvent) => {
        const projectForm = document.getElementById("newProjectForm");
        if (!(projectForm && projectForm instanceof HTMLFormElement)) {
            return;
        }
        e.preventDefault();

        const formData = new FormData(projectForm);
        const ProjectData: IProject = {
            icon: formData.get("icon") as string,
            color: formData.get("color") as string,
            name: formData.get("name") as string,
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
            const project = projectManager.newProject(ProjectData);
            projectForm.reset(); // Reset the form
            setIsModalOpen(false);
        } catch (error) {
            setErrorMessage((error as Error).message);
            setIsErrorModalOpen(true);
        }
    };

    return (
        <div className="page" id="projectsPage">
            <div className="projects-content">
                <header className="projects-content-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
                        <SearchBox onValueChange={setSearchQuery} placeholder={t("search_projects") || "Search for projects"} style={{ width: '100%', maxWidth: 350 }} />
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