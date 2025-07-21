import React from "react";

interface EditProjectFormOldProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSubmit: (updates: any) => Promise<void>;
  t: (key: string) => string;
}

export const EditProjectFormOld: React.FC<EditProjectFormOldProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit,
  t,
}) => {
  const [editName, setEditName] = React.useState(project?.name ?? "");
  const [editDescription, setEditDescription] = React.useState(
    project?.description ?? ""
  );
  const [editLocation, setEditLocation] = React.useState(project?.location ?? "");
  const [editProgress, setEditProgress] = React.useState(
    (project?.progress ?? "").toString()
  );
  const [editCost, setEditCost] = React.useState((project?.cost ?? "").toString());
  const [editUserRole, setEditUserRole] = React.useState(project?.userRole ?? "");
  const [editStatus, setEditStatus] = React.useState(project?.status ?? "");
  const [editPhase, setEditPhase] = React.useState(project?.phase ?? "");
  const [editStartDate, setEditStartDate] = React.useState(
    project?.startDate ?? ""
  );
  const [editFinishDate, setEditFinishDate] = React.useState(
    project?.finishDate ?? ""
  );

  React.useEffect(() => {
    if (isOpen && project) {
      setEditName(project.name ?? "");
      setEditDescription(project.description ?? "");
      setEditLocation(project.location ?? "");
      setEditProgress((project.progress ?? "").toString());
      setEditCost((project.cost ?? "").toString());
      setEditUserRole(project.userRole ?? "");
      setEditStatus(project.status ?? "");
      setEditPhase(project.phase ?? "");
      setEditStartDate(project.startDate ?? "");
      setEditFinishDate(project.finishDate ?? "");
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      name: editName,
      description: editDescription,
      location: editLocation,
      progress: parseFloat(editProgress) || 0,
      cost: parseFloat(editCost) || 0,
      userRole: editUserRole,
      status: editStatus,
      phase: editPhase,
      startDate: editStartDate,
      finishDate: editFinishDate,
    };
    await onSubmit(updates);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog open>
      <form className="userForm form-wide" id="editProjectForm" onSubmit={handleSubmit}>
        <h2>{t("projects_edit_project") || "Edit Project"}</h2>
        <div className="userCard">
          <div className="formFieldContainer">
            <label><span className="material-icons-round">apartment</span>{t("projects_name") || "Name"}</label>
            <input name="name" type="text" id="projectNameInput" value={editName} onChange={e => setEditName(e.target.value)} />
            <label className="label-tip">{t("projects_name_tip") || "TIP give it a short name"}</label>
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">subject</span>{t("projects_description") || "Description"}</label>
            <textarea
                name="description"
                cols={30}
                rows={5}
                placeholder={t("projects_description_placeholder") || "Give your project a nice description!"}
                id="projectDescriptionInput"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
            />
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">pin_drop</span>{t("projects_location") || "Location"}</label>
            <input
                name="location"
                type="text"
                placeholder={t("projects_location_placeholder") || "Where is your project located?"}
                id="projectLocationInput"
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
            />
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">percent</span>{t("projects_progress") || "Estimated Progress"}</label>
            <input
                name="progress"
                type="number"
                placeholder={t("projects_progress_placeholder") || "What's the estimated completion progress of the project?"}
                id="projectProgressInput"
                value={editProgress}
                onChange={e => setEditProgress(e.target.value)}
            />
            <label className="label-tip">{t("projects_progress_tip") || "Estimated progress percentage of the project"}</label>
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">paid</span>{t("projects_cost") || "Estimated cost"}</label>
            <input
                name="cost"
                type="number"
                placeholder={t("projects_cost_placeholder") || "What's the estimated cost of the project?"}
                id="projectCostInput"
                value={editCost}
                onChange={e => setEditCost(e.target.value)}
            />
            <label className="label-tip">{t("projects_cost_tip") || "Estimated cost of the project"}</label>
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">account_circle</span>{t("projects_role") || "Role"}</label>
            <select name="userRole" id="projectRoleInput" value={editUserRole} onChange={e => setEditUserRole(e.target.value)}>
                <option>{t("projects_role_not_defined") || "not defined"}</option>
                <option>{t("projects_role_architect") || "Architect"}</option>
                <option>{t("projects_role_engineer") || "Engineer"}</option>
                <option>{t("projects_role_developer") || "Developer"}</option>
            </select>
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">not_listed_location</span>{t("projects_status") || "Status"}</label>
            <select name="status" id="projectStatusInput" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                <option>{t("projects_status_pending") || "Pending"}</option>
                <option>{t("projects_status_active") || "Active"}</option>
                <option>{t("projects_status_finished") || "Finished"}</option>
            </select>
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">calendar_view_week</span>{t("projects_phase") || "Design Phase"}</label>
            <select name="phase" id="projectPhaseInput" value={editPhase} onChange={e => setEditPhase(e.target.value)}>
                <option>{t("projects_phase_design") || "Design"}</option>
                <option>{t("projects_phase_construction_project") || "Construction project"}</option>
                <option>{t("projects_phase_execution") || "Execution"}</option>
                <option>{t("projects_phase_construction") || "Construction"}</option>
            </select>
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}</label>
            <input name="startDate" type="date" id="projectStartPDInput" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} />
          </div>
          <div className="formFieldContainer">
            <label><span className="material-icons-round">calendar_month</span>{t("projects_finish_date") || "Finish Date"}</label>
            <input name="finishDate" type="date" id="projectFinishPDInput" value={editFinishDate} onChange={e => setEditFinishDate(e.target.value)} />
          </div>
        </div>
        <div className="cancelAccept">
          <button
            type="button"
            className="cancelButton"
            onClick={onClose}
          >
            {t("projects_cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            className="acceptButton"
          >
            {t("projects_accept") || "Accept"}
          </button>
        </div>
      </form>
    </dialog>
  );
};

