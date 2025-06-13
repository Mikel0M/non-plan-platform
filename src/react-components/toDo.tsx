import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ProjectsManager } from '../classes/ProjectsManager';
import { toDoManager } from '../classes/toDoManager';
import * as Router from 'react-router-dom';



interface Props {
    projectsManager: ProjectsManager
    toDoManager:toDoManager
}

export function ToDoPage(props: Props) {
    // Helper to close modals by id
    const closeModal = (id: string) => {
        const modal = document.getElementById(id) as HTMLDialogElement | null;
        if (modal) modal.close();
    };
    const { id } = useParams();
    // Ensure id is a string before using it
    const project = id ? props.projectsManager.getProject(id) : undefined;

    return (
    <div className="page" id="toDoPage" style={{ display: "flex" }}>
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

          {/* Header Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#404040",
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