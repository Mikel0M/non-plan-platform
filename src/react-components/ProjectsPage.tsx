import * as React from 'react';
import * as Router from 'react-router-dom';
import { IProject, userRole, status, phase, Project } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { ProjectCard } from './ProjectCard';

interface Props {
    projectManager: ProjectsManager;
    customStyle?: React.CSSProperties;
}

export function ProjectsPage({ projectManager, customStyle }: Props) {
    const [projects, setProjects] = React.useState<Project[]>(projectManager.list)
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    projectManager.onProjectCreated = () => { setProjects([...projectManager.list]) }
    projectManager.onProjectDeleted = () => { setProjects([...projectManager.list]) }

    const projectCards = projects.map((project) => {
        return (
            <Router.Link to={`/project/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div>
                    <ProjectCard project={project} />
                </div>
            </Router.Link>
        )
    })

    React.useEffect(() => {console.log("Projects state updated", projects)}, [projects])
    

    const onNewProjectClick = () => {
        setIsModalOpen(true);
    };

    const onExportClick = () => {
        projectManager.exportToJSON()
    }
    

    const onImportClick = () => {
        projectManager.importFromJSON()
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
            setProjects([...projectManager.list]); // Force update after new project
            projectForm.reset(); // Reset the form
            setIsModalOpen(false);
        } catch (error) {
            setErrorMessage(error.message);
            setIsErrorModalOpen(true);
        }
    };

    return (
        <div className="page" id="projectsPage" style={{ display: "flex", padding: 0, margin: 0, marginTop: "20px", marginLeft: "0px", marginRight: "0px", ...customStyle }}>
            {isModalOpen && (
                <dialog id="newProjectModal" open>
                    <form onSubmit={(e) => {onFormSubmit(e)}} className="userForm" id="newProjectForm" style={{width: 500, maxWidth: '95vw', minWidth: 350, boxSizing: 'border-box'}}>
                    <h2>New Project</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">apartment</span>Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="What's the name of your project?"
                        />
                        <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
                            TIP give it a short name
                        </label>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">subject</span>Description
                        </label>
                        <textarea
                            name="description"
                            cols={30}
                            rows={5}
                            placeholder="Give your project a nice description!"
                            defaultValue={""}
                        />
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">pin_drop</span>Location
                        </label>
                        <input
                            name="location"
                            type="text"
                            placeholder="Where is your project located?"
                        />
                        <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }} />
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">paid</span>Estimated cost
                        </label>
                        <input
                            name="cost"
                            type="number"
                            placeholder="What's the estimated cost of the project?"
                        />
                        <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
                            Estimated cost of the project
                        </label>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">percent</span>Estimated
                            Progress
                        </label>
                        <input
                            name="progress"
                            type="number"
                            placeholder="What's the estimated completion progress of the project?"
                        />
                        <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
                            Estimated progress percentage of the project
                        </label>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">account_circle</span>Role
                        </label>
                        <select name="userRole">
                            <option>not defined</option>
                            <option>Architect</option>
                            <option>Engineer</option>
                            <option>Developer</option>
                        </select>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">not_listed_location</span>
                            Status
                        </label>
                        <select name="status">
                            <option>Pending</option>
                            <option>Active</option>
                            <option>Finished</option>
                        </select>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_view_week</span>
                            Design Phase
                        </label>
                        <select name="phase">
                            <option>Design</option>
                            <option>Construction project</option>
                            <option>Execution</option>
                            <option>Construction</option>
                        </select>
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_today</span>Start
                            Date
                        </label>
                        <input name="startDate" type="date" />
                        </div>
                        <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_month</span>Finish
                            Date
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
                            Cancel
                        </button>
                        <button type="submit" className="acceptButton">
                        Accept
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
                        Error
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
            <header
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    zIndex: 100,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 20px 0 0px",
                    marginTop: "70px",
                    gap: "50px",
                    background: "var(--secondary100)",
                }}
            >
                {/* Left-aligned text */}
                <h2 style={{ marginRight: "auto",marginLeft: "250px" }}>Projects</h2>

                {/* Right-aligned buttons */}
                <div style={{ display: "flex", gap: "10px",  }}>
                    <button id="importProjectsBtn" className="buttonTertiary" onClick={onImportClick}>
                        <span className="material-icons-round">file_download</span>
                    </button>
                    <button id="exportProjectsBtn" className="buttonTertiary" onClick={onExportClick}>
                        <span className="material-icons-round">file_upload</span>
                    </button>
                    <button onClick={(onNewProjectClick)} id="newProjectBtn" className="buttonTertiary">
                        <span className="material-icons-round">add</span>
                    </button>
                </div>
            </header>
            <div id="projectsList" className="projectsList" style={{marginTop: "70px", marginLeft: 0}}>{ projectCards}</div>
    </div>

    )
}