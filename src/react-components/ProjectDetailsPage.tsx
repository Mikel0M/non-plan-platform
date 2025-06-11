import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import * as Router from 'react-router-dom';

interface Props {
    projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
    // Helper to close modals by id
    const closeModal = (id: string) => {
        const modal = document.getElementById(id) as HTMLDialogElement | null;
        if (modal) modal.close();
    };
    const routeParams = Router.useParams<{ id: string }>();
    console.log("ProjectDetailsPage routeParams:", routeParams.id);
    const { id } = useParams();
    // Ensure id is a string before using it
    const project = id ? props.projectsManager.getProject(id) : undefined;
    if (!project) {
      return <div>Project not found.</div>;
    }
    return (
    <div className="page" id="projectDetails" style={{ display: "flex" }}>
        <dialog id="DeleteProjectModal">
            <form className="userForm" id="DeleteNewUserForm">
                <h2>Are you sure you want to delete the project?</h2>
                <div className="cancelAccept">
                    <button
                        type="button"
                        className="cancelButton"
                        onClick={() => closeModal('DeleteProjectModal')}>Cancel
                    </button>
                    <button type="button" className="acceptButton" id="ConfirmDeleteButton">Delete</button>
                </div>
            </form>
        </dialog>
        <dialog id="editProjectModal">
            <form className="userForm" id="editProjectForm">
                <h2>Edit Project</h2>
                <div className="userCard">
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">apartment</span>Name
          </label>
          <input name="name" type="text" id="projectNameInput" />
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
            id="projectDescriptionInput"
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
            id="projectLocationInput"
          />
          <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }} />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">percent</span>Estimated
            progress
          </label>
          <input
            name="progress"
            type="number"
            placeholder="What's the estimated progress of the project?"
            id="projectProgressInput"
          />
          <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            Estimated cost of the project
          </label>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">paid</span>Estimated cost
          </label>
          <input
            name="cost"
            type="number"
            placeholder="What's the estimated cost of the project?"
            id="projectCostInput"
          />
          <label style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}>
            Estimated cost of the project
          </label>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">account_circle</span>Role
          </label>
          <select name="userRole" id="projectRoleInput">
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
          <select name="status" id="projectStatusInput">
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
          <select name="phase" id="projectPhaseInput">
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
          <input name="startDate" type="date" id="projectStartPDInput" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">calendar_month</span>Finish
            Date
          </label>
          <input name="finishDate" type="date" id="projectFinishPDInput" />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => closeModal('editProjectModal')}
        >
          Cancel
        </button>
        <button type="button" className="acceptButton" id="changeProjectButton">
          Change
        </button>
      </div>
    </form>
  </dialog>
  <dialog id="newToDoModal">
    <form className="toDoForm" id="newToDoForm">
      <input type="hidden" name="toDoProject" id="toDoProject" />
      <div className="userCard">
        <div className="formGrid">
          <div className="formColumn">
            <h2 style={{ margin: 0 }}>Add a Task</h2>
            <div className="formFieldContainerToDo">
              <label>
                <span className="material-icons-round">apartment</span>Title
              </label>
              <input name="toDoTitle" type="text" id="toDoTitle" />
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                TIP give it a short title
              </label>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">subject</span>Description
              </label>
              <textarea
                name="toDoDescription"
                cols={30}
                rows={5}
                placeholder="Give your project a nice description!"
                id="toDoDescription"
                defaultValue={""}
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Status
              </label>
              <select name="toDoStatus" id="toDoStatus">
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Priority
              </label>
              <select name="toDoPriority" id="toDoPriority">
                <option>High</option>
                <option>Standard</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="formColumn">
            <div className="formFieldContainerToDo">
              <h2 data-project-info="toDoProjectName" style={{ margin: 0 }}>
                Project Name
              </h2>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Responsible Person
              </label>
              <select name="toDoAssignedTo" id="toDoAssignedTo">
                {/* Options will be dynamically populated */}
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Created By
              </label>
              <select name="toDoCreatedBy" id="toDoCreatedBy">
                {/* Options will be dynamically populated */}
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_today</span>
                To-Do start date
              </label>
              <span id="currentDate" className="formatted-date" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                To-Do last update date
              </label>
              <span id="updateDate" className="formatted-date" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Estimated
                hours
              </label>
              <input
                name="toDoEstimatedHours"
                type="number"
                placeholder="What's the estimated cost of the project?"
                id="projectCostInput"
              />
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                Estimated hours for the project
              </label>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Actual hours
              </label>
              <input
                name="toDoActualHours"
                type="number"
                placeholder="What's the estimated cost of the project?"
                id="projectCostInput"
              />
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                hours used so far
              </label>
            </div>
          </div>
        </div>
        <div className="separator-horizontal" />
        <div className="formGrid">
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>Due
                Date
              </label>
              <input name="toDoDueDate" type="date" id="projectFinishPDInput" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                Start Date
              </label>
              <input
                name="toDoStartDate"
                type="date"
                id="projectFinishPDInput"
              />
            </div>
          </div>
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Dependancies
              </label>
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                select the tasks this project is dependant of
              </label>
              <select name="status" id="toDoPriority">
                <option>You</option>
                <option>Standard</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </div>
        <div className="separator-horizontal" />
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Comments
          </label>
          <textarea
            name="toDoComments"
            cols={30}
            rows={5}
            placeholder="Add any clarification comment"
            id="projectDescriptionInput"
            defaultValue={""}
          />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => closeModal('newToDoModal')}
        >
          Cancel
        </button>
        <button type="submit" className="acceptButton" id="submitToDoButton">
          Accept
        </button>
      </div>
    </form>
  </dialog>
  <dialog id="editToDoModal">
    <form className="toDoForm" id="editToDoForm">
      <input type="hidden" id="editToDoId" name="editToDoId" />
      {/* Other form fields... */}
      <div className="userCard">
        <div className="formGrid">
          <div className="formColumn">
            <h2 style={{ margin: 0 }}>Edit Task</h2>
            <div className="formFieldContainerToDo">
              <label>
                <span className="material-icons-round">apartment</span>Title
              </label>
              <input name="toDoTitle" type="text" id="editToDoTitle" />
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                TIP give it a short title
              </label>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">subject</span>Description
              </label>
              <textarea
                name="toDoDescription"
                cols={30}
                rows={5}
                placeholder="Give your project a nice description!"
                id="editToDoDescription"
                defaultValue={""}
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Status
              </label>
              <select name="toDoStatus" id="editToDoStatus">
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Priority
              </label>
              <select name="toDoPriority" id="editToDoPriority">
                <option>High</option>
                <option>Standard</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="formColumn">
            <div className="formFieldContainerToDo">
              <h2 data-project-info="toDoProjectName" style={{ margin: 0 }}>
                Project Name
              </h2>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Responsible Person
              </label>
              <select name="edittoDoAssignedTo" id="editToDoAssignedTo">
                {/* Options will be dynamically populated */}
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Created By
              </label>
              <select name="edittoDoCreatedBy" id="editToDoCreatedBy">
                {/* Options will be dynamically populated */}
              </select>
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_today</span>
                To-Do start date
              </label>
              <input
                name="editToDoStartDate"
                type="date"
                id="editToDoStartDate"
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                To-Do last update date
              </label>
              <input
                name="editToDoUpdatedAt"
                type="date"
                id="editToDoUpdatedAt"
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Estimated
                hours
              </label>
              <input
                name="editToDoEstimatedHours"
                type="number"
                placeholder="Estimated hours for the project"
                id="editToDoEstimatedHours"
              />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">paid</span>Actual hours
              </label>
              <input
                name="editToDoActualHours"
                type="number"
                placeholder="Hours used so far"
                id="editToDoActualHours"
              />
            </div>
          </div>
        </div>
        <div className="separator-horizontal" />
        <div className="formGrid">
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>Due
                Date
              </label>
              <input name="editToDoDueDate" type="date" id="editToDoDueDate" />
            </div>
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">calendar_month</span>
                Start Date
              </label>
              <input
                name="editToDoStartDate"
                type="date"
                id="editToDoStartDate"
              />
            </div>
          </div>
          <div className="formColumn">
            <div className="formFieldContainer">
              <label>
                <span className="material-icons-round">
                  not_listed_location
                </span>
                Dependencies
              </label>
              <label
                style={{ fontSize: 12, fontStyle: "italic", paddingTop: 5 }}
              >
                Select the tasks this project is dependent on
              </label>
              <select name="editToDoDependencies" id="editToDoDependencies">
                <option>You</option>
                <option>Standard</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </div>
        <div className="separator-horizontal" />
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Comments
          </label>
          <textarea
            name="editToDoComments"
            cols={30}
            rows={5}
            placeholder="Add any clarification comment"
            id="editToDoComments"
            defaultValue={""}
          />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => closeModal('editToDoModal')}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="acceptButton"
          id="submitEditToDoButton"
        >
          Accept
        </button>
      </div>
    </form>
  </dialog>
  <div className="mainPageContent">
    <div style={{ display: "flex", flexDirection: "column", rowGap: 10 }}>
      <div className="dashboardCard">
        <div className="upperDashboard">
          <p
            id="iconPD"
            style={{
              fontSize: "var(--fontSizeBig)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: project.color,
              padding: 5,
              borderRadius: "50%",
              aspectRatio: 1,
              width: 40,
              height: 40,
              color: "white"
            }}
            data-project-info="iconPD"
          >
            {project.icon}
          </p>
          <div style={{ display: "flex", flexDirection: "row", gap: 20 }}>
            <button
              id="editProject"
              className="buttonSecondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 100,
                height: 40,
                fontSize: "var(--fontSizeStandard)"
              }}
            >
              Edit
            </button>
            <button
              id="deleteProjectBtn"
              className="buttonSecondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 100,
                height: 40,
                fontSize: "var(--fontSizeStandard)"
              }}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="middleDashboard">
          <h5 data-project-info="nameBigPD">{project.name}</h5>
          <p data-project-info="descriptionPD">
            {project.description || "No description provided."}
          </p>
        </div>
        <div className="bottomDashboard">
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Status
            </p>
            <p data-project-info="statusPD">{project.status || "No status provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Cost
            </p>
            <p data-project-info="costPD">{project.cost || "No cost provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Role
            </p>
            <p data-project-info="rolePD">{project.userRole || "No role provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Start Date
            </p>
            <p data-project-info="startPD">{project.startDate || "No start date provided."}</p>
          </div>
          <div>
            <p style={{ color: "#969696", fontSize: "var(--fontSizeSmall)" }}>
              Finish Date
            </p>
            <p data-project-info="finishPD">{project.finishDate || "No finish date provided."}</p>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#404040",
            width: "calc(100% - 40px)",
            height: 25,
            borderRadius: 50,
            overflow: "hidden",
            margin: "20px auto 30px auto",
            position: "relative"
          }}
        >
          <div
            id="percentageDiv"
            style={{
              width: `${project.progress ?? 0}%`,
              height: "100%",
              backgroundColor: (project.progress ?? 0) >= 50 ? "green" : "orange",
              borderRadius: "10px 0 0 10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              color: "white",
              fontWeight: "bold",
              transition: "width 0.5s"
            }}
          >
            <span
              id="progressText"
              style={{
                position: "absolute",
                width: "100%",
                textAlign: "center",
                left: 0
              }}
            >
              {project.progress ?? 0}%
            </span>
          </div>
        </div>
      </div>
      <div className="dashboardCard" style={{ flexGrow: 1 }}>
        <div
          id="toDoList"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            padding: 20
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <h4>To-Do</h4>
            <div
              style={{ display: "flex", alignItems: "center", paddingLeft: 80 }}
            >
              <span
                className="material-icons-round"
                style={{ paddingRight: 10 }}
              >
                search
              </span>
              <input
                type="text"
                style={{ fontSize: "var(--fontSizeSmall)" }}
                placeholder="Search To-Do's by name"
              />
            </div>
            <button id="newToDoBtn" className="buttonTertiary">
              <span className="material-icons-round">add</span>
            </button>
          </div>
          {/* To-Do List Container */}
          <div
            id="toDoListContainer"
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: 10,
              marginTop: 20
            }}
          >
            {/* To-Do list items will be appended here */}
          </div>
        </div>
      </div>
    </div>
    <div
      id="viewerContainer"
      className="dashboardCard"
      style={{ minWidth: 0, minHeight: 700, maxHeight: 700 }}
    />
  </div>
</div>
)
}