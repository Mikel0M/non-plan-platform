import React, { useState } from 'react';
import { IProject, userRole, status, phase } from '../classes/Project';
import { ICompany } from '../classes/Company';
import { IUser } from '../classes/User';
import { useTranslation } from './LanguageContext';

interface ProjectFormProps {
    isVisible: boolean;
    onSubmit: (projectData: Omit<IProject, 'id'>) => Promise<void>;
    onCancel: () => void;
    initialData?: Partial<IProject>;
    title?: string;
    companies?: ICompany[];
    users?: IUser[];
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ 
    isVisible, 
    onSubmit, 
    onCancel, 
    initialData,
    title,
    companies = [],
    users = []
}) => {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>(initialData?.assignedUsers?.map(au => au.userId) || []);
    const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData(e.target as HTMLFormElement);
        
        // Use selected users from state instead of form element
        const assignedUsers = selectedUsers.map(userId => ({
            userId: userId,
            role: "Developer" // Default role, could be made configurable later
        }));
        
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
        
        const ProjectData: Omit<IProject, 'id'> = {
            icon: formData.get("icon") as string || generateIcon(projectName), // Generate icon from name
            color: formData.get("color") as string || undefined, // Allow undefined so Project constructor generates random color
            name: projectName,
            description: formData.get("description") as string || "Default Project Description",
            userRole: formData.get("userRole") as userRole,
            location: formData.get("location") as string || "not defined",
            progress: 0, // Always start at 0% - calculated from completed todos
            cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : 0,
            status: formData.get("status") as status,
            phase: formData.get("phase") as phase,
            startDate: formData.get("startDate") as string,
            finishDate: formData.get("finishDate") as string,
            // Firebase fields with proper defaults
            companyId: formData.get("companyId") as string || undefined,
            createdBy: "", // Will be set by the system
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            modifiedBy: "", // Will be set by the system
            toDos: [], // Start with empty todos array
            assignedUsers: assignedUsers, // Use selected users
        };

        try {
            await onSubmit(ProjectData);
            
            // Reset form and close modal
            const form = e.target as HTMLFormElement;
            form.reset();
            onCancel();
        } catch (error) {
            setErrorMessage((error as Error).message);
            setIsErrorModalOpen(true);
        }
    };

    const handleUserToggle = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleUserSelectionConfirm = () => {
        setIsUserSelectionModalOpen(false);
    };

    const getSelectedUsersDisplay = () => {
        if (selectedUsers.length === 0) return t("projects_no_users_selected") || "No users selected";
        if (selectedUsers.length === 1) {
            const user = users.find(u => u.id === selectedUsers[0]);
            return user ? `${user.name} ${user.surname}` : "1 user selected";
        }
        return `${selectedUsers.length} users selected`;
    };

    if (!isVisible) return null;

    return (
        <>
            <style>{`
                #newProjectModal {
                    background-color: transparent;
                    border: none;
                    margin: auto;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                #newProjectModal::backdrop {
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(3px);
                }

                #newProjectModal .userForm {
                    width: calc(100vw - 200px); /* Less margin, wider modal */
                    max-width: 1200px; /* Increased max width */
                    height: calc(100vh - 100px); /* Less top/bottom margin */
                    max-height: 85vh;
                    margin: 0;
                    padding: 32px;
                    background-color: var(--background-100);
                    color: white;
                    border-radius: var(--gap-small);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                #newProjectModal .userForm h2 {
                    padding: var(--gap-standard);
                    margin: 0 0 20px 0;
                }

                #newProjectModal .userCard {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr; /* Three columns */
                    gap: 24px; /* Increased gap */
                    padding: 0;
                    background: transparent;
                    margin-bottom: 32px;
                    overflow-y: auto;
                }

                #newProjectModal .formFieldContainer {
                    display: flex;
                    flex-direction: column;
                    row-gap: 10px;
                }

                #newProjectModal .cancelAccept {
                    flex-shrink: 0;
                    margin-top: auto;
                }

                @media (max-width: 1400px) {
                    #newProjectModal .userCard {
                        grid-template-columns: 1fr 1fr; /* Two columns on medium screens */
                    }
                }

                @media (max-width: 900px) {
                    #newProjectModal .userCard {
                        grid-template-columns: 1fr; /* Single column on small screens */
                    }
                }

                /* Custom styles for multi-select dropdown */
                #newProjectModal select[multiple] {
                    min-height: 120px;
                    border: 1px solid var(--complementary200);
                    border-radius: 4px;
                    padding: 8px;
                    background-color: var(--background-200);
                    color: white;
                }

                #newProjectModal select[multiple] option {
                    padding: 4px 8px;
                    margin: 2px 0;
                    background-color: var(--background-200);
                    color: white;
                }

                #newProjectModal select[multiple] option:checked {
                    background-color: var(--complementary100);
                    color: var(--background-100);
                }

                #newProjectModal select[multiple] option:hover {
                    background-color: var(--complementary200);
                }

                /* User selection modal styles */
                #userSelectionModal {
                    background-color: transparent;
                    border: none;
                    margin: auto;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1100;
                }

                #userSelectionModal::backdrop {
                    background-color: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(3px);
                }

                #userSelectionModal .userForm {
                    width: calc(100vw - 300px);
                    max-width: 800px;
                    height: calc(100vh - 200px);
                    max-height: 70vh;
                    margin: 0;
                    padding: 24px;
                    background-color: var(--background-100);
                    color: white;
                    border-radius: var(--gap-small);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .userSelectionGrid {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                    overflow-y: auto;
                    margin: 12px 0;
                }

                .userSelectionCard {
                    background-color: var(--background-200);
                    border: 2px solid var(--complementary200);
                    border-radius: 6px;
                    padding: 8px 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                    min-height: auto;
                    width: 100%;
                }

                .userSelectionCard:hover {
                    background-color: var(--background-300);
                    border-color: var(--complementary100);
                }

                .userSelectionCard.selected {
                    background-color: var(--complementary100);
                    border-color: var(--complementary100);
                    color: var(--background-100);
                }

                .userSelectionCard .userIcon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .userSelectionCard .userInfo {
                    flex: 1;
                    min-width: 0;
                }

                .userSelectionCard .userName {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 0;
                    color: white !important;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .userSelectionCard .checkMark {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background-color: var(--complementary100);
                    color: var(--background-100);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .userSelectionCard.selected .checkMark {
                    opacity: 1;
                }

                .userSelectionButton {
                    background-color: var(--background-200);
                    border: 2px solid var(--complementary200);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: center;
                }

                .userSelectionButton:hover {
                    background-color: var(--background-300);
                    border-color: var(--complementary100);
                }
            `}</style>
            <dialog id="newProjectModal" open>
                <form onSubmit={handleFormSubmit} className="userForm form-wide" id="newProjectForm">
                    <h2>{title || t("projects_new") || "New Project"}</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">apartment</span>{t("projects_name") || "Name"}
                            </label>
                            <input
                                name="name"
                                type="text"
                                placeholder={t("projects_name_placeholder") || "What's the name of your project?"}
                                defaultValue={initialData?.name || ""}
                                required
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
                                defaultValue={initialData?.description || ""}
                            />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">business</span>{t("projects_company") || "Company"}
                            </label>
                            <select 
                                name="companyId" 
                                defaultValue={initialData?.companyId || ""}
                            >
                                <option value="">{t("projects_company_none") || "No company"}</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                            <label className="label-tip">
                                {t("projects_company_tip") || "Company associated with this project"}
                            </label>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">people</span>{t("projects_assigned_users") || "Assigned Users"}
                            </label>
                            <button
                                type="button"
                                className="userSelectionButton"
                                onClick={() => setIsUserSelectionModalOpen(true)}
                            >
                                <span className="material-icons-round">person_add</span>
                                {getSelectedUsersDisplay()}
                            </button>
                            <label className="label-tip">
                                {t("projects_assigned_users_tip") || "Click to select users for this project"}
                            </label>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">pin_drop</span>{t("projects_location") || "Location"}
                            </label>
                            <input
                                name="location"
                                type="text"
                                placeholder={t("projects_location_placeholder") || "Where is your project located?"}
                                defaultValue={initialData?.location || ""}
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
                                defaultValue={initialData?.cost || ""}
                            />
                            <label className="label-tip">
                                {t("projects_cost_tip") || "Estimated cost of the project"}
                            </label>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">account_circle</span>{t("projects_role") || "Role"}
                            </label>
                            <select name="userRole" defaultValue={initialData?.userRole || "not defined"}>
                                <option value="not defined">{t("projects_role_not_defined") || "not defined"}</option>
                                <option value="Architect">{t("projects_role_architect") || "Architect"}</option>
                                <option value="Engineer">{t("projects_role_engineer") || "Engineer"}</option>
                                <option value="Developer">{t("projects_role_developer") || "Developer"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">not_listed_location</span>
                                {t("projects_status") || "Status"}
                            </label>
                            <select name="status" defaultValue={initialData?.status || "Pending"}>
                                <option value="Pending">{t("projects_status_pending") || "Pending"}</option>
                                <option value="Active">{t("projects_status_active") || "Active"}</option>
                                <option value="Finished">{t("projects_status_finished") || "Finished"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">calendar_view_week</span>
                                {t("projects_phase") || "Design Phase"}
                            </label>
                            <select name="phase" defaultValue={initialData?.phase || "Design"}>
                                <option value="Design">{t("projects_phase_design") || "Design"}</option>
                                <option value="Construction project">{t("projects_phase_construction_project") || "Construction project"}</option>
                                <option value="Execution">{t("projects_phase_execution") || "Execution"}</option>
                                <option value="Construction">{t("projects_phase_construction") || "Construction"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}
                            </label>
                            <input name="startDate" type="date" defaultValue={initialData?.startDate || ""} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">calendar_month</span>{t("projects_finish_date") || "Finish Date"}
                            </label>
                            <input name="finishDate" type="date" defaultValue={initialData?.finishDate || ""} />
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button
                            type="button"
                            className="cancelButton"
                            onClick={onCancel}
                        >
                            {t("projects_cancel") || "Cancel"}
                        </button>
                        <button type="submit" className="acceptButton">
                            {t("projects_accept") || "Accept"}
                        </button>
                    </div>
                </form>
            </dialog>

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

            {isUserSelectionModalOpen && (
                <dialog id="userSelectionModal" open>
                    <form className="userForm" onSubmit={(e) => e.preventDefault()}>
                        <h2 style={{ margin: 0, padding: "16px 0" }}>
                            <span className="material-icons-round" style={{ verticalAlign: "middle", marginRight: 8 }}>
                                people
                            </span>
                            {t("projects_select_users") || "Select Users"}
                        </h2>
                        <div className="userSelectionGrid">
                            {users.map(user => (
                                <div 
                                    key={user.id}
                                    className={`userSelectionCard ${selectedUsers.includes(user.id!) ? 'selected' : ''}`}
                                    onClick={() => handleUserToggle(user.id!)}
                                >
                                    <div 
                                        className="userIcon" 
                                        style={{ backgroundColor: user.color }}
                                    >
                                        {user.icon}
                                    </div>
                                    <div className="userInfo">
                                        <div className="userName">{user.name} {user.surname}</div>
                                    </div>
                                    <div className="checkMark">
                                        <span className="material-icons-round">check</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 16 }}>
                            <button
                                type="button"
                                className="cancelButton"
                                onClick={() => setIsUserSelectionModalOpen(false)}
                            >
                                {t("projects_cancel") || "Cancel"}
                            </button>
                            <button
                                type="button"
                                className="acceptButton"
                                onClick={handleUserSelectionConfirm}
                            >
                                {t("projects_confirm") || "Confirm"} ({selectedUsers.length})
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </>
    );
};
