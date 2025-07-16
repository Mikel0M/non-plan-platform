import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IProject, userRole, status, phase } from '../classes/Project';
import { ICompany } from '../classes/Company';
import { IUser } from '../classes/User';
import { useTranslation } from './LanguageContext';
import { OpenStreetMapComponent } from './OpenStreetMapComponent';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { Calendar } from './Calendar';

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
    const [projectAddress, setProjectAddress] = useState<string>(initialData?.location || "");
    const [projectCoordinates, setProjectCoordinates] = useState<{ lat: number; lng: number } | null>(
        initialData?.latitude && initialData?.longitude 
            ? { lat: initialData.latitude, lng: initialData.longitude }
            : null
    );
    const [plotNumber, setPlotNumber] = useState<string>(initialData?.plotNumber || "");
    const [debouncedAddress, setDebouncedAddress] = useState<string>(initialData?.location || "");
    const todayStr = new Date().toISOString().split('T')[0];
    const [formStartDate, setFormStartDate] = useState<string>(initialData?.startDate || todayStr);
    const [formFinishDate, setFormFinishDate] = useState<string>(initialData?.finishDate || todayStr);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');

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
        // Always save the full address (with number, street, city, province, country) as provided by OSM
        let locationToSave = projectAddress;
        if (!locationToSave) {
            locationToSave = "not defined";
        }
        // Only save lat/lng if they are valid numbers (not 0 or undefined)
        const latitudeToSave = (projectCoordinates && typeof projectCoordinates.lat === 'number' && projectCoordinates.lat !== 0) ? projectCoordinates.lat : undefined;
        const longitudeToSave = (projectCoordinates && typeof projectCoordinates.lng === 'number' && projectCoordinates.lng !== 0) ? projectCoordinates.lng : undefined;
        // Only save plotNumber if not empty or default
        const plotNumberToSave = (plotNumber && plotNumber !== 'DefaultPlotNumber') ? plotNumber : undefined;
        const ProjectData: Omit<IProject, 'id'> = {
            icon: formData.get("icon") as string || generateIcon(projectName),
            color: formData.get("color") as string || undefined,
            name: projectName,
            description: formData.get("description") as string || "Default Project Description",
            userRole: formData.get("userRole") as userRole,
            location: locationToSave,
            plotNumber: plotNumberToSave,
            latitude: latitudeToSave,
            longitude: longitudeToSave,
            progress: 0,
            cost: formData.get("cost") ? parseFloat(formData.get("cost") as string) : 0,
            status: formData.get("status") as status,
            phase: formData.get("phase") as phase,
            startDate: formData.get("startDate") as string,
            finishDate: formData.get("finishDate") as string,
            companyId: formData.get("companyId") as string || undefined,
            createdBy: "",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            modifiedBy: "",
            toDos: [],
            assignedUsers: assignedUsers,
        };

        try {
            await onSubmit(ProjectData);
            
            // Reset form and close modal
            const form = e.target as HTMLFormElement;
            form.reset();
            setProjectAddress("");
            setProjectCoordinates(null);
            setPlotNumber("");
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

    const handleLocationSelect = (lat: number, lng: number, address: string, foundPlotNumber?: string) => {
        // Always use the full address (with number, street, city, province, country)
        setProjectAddress(address);
        setProjectCoordinates({ lat, lng });
        // Always auto-populate plot number if found in OSM (even if user typed something)
        if (foundPlotNumber && foundPlotNumber.trim()) {
            setPlotNumber(foundPlotNumber);
        }
        // Update debounced address for display/autocomplete
        setDebouncedAddress(address);
    };

    const handleAddressChange = useCallback((newAddress: string) => {
        setProjectAddress(newAddress);
        
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        // Set new timeout to update debounced address after 500ms
        debounceTimeoutRef.current = setTimeout(() => {
            setDebouncedAddress(newAddress);
        }, 500);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

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
            
            <dialog id="newProjectModal" open>
                <form className="userForm form-wide" id="newProjectForm"  onSubmit={handleFormSubmit}>
                    {/* Project Name at the very top, replacing the modal title */}
                    <h2>
                        {"New Project"}
                    </h2>
                    <div className="formFieldContainer" >
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
                        <label>
                            <span className="material-icons-round">calendar_view_week</span>
                            {t("projects_phase") || "Design Phase"}
                        </label>
                        <select name="phase" defaultValue={initialData?.phase || "Design"} className="modalInput">
                            <option value="Design">{t("projects_phase_design") || "Design"}</option>
                            <option value="Construction project">{t("projects_phase_construction_project") || "Construction project"}</option>
                            <option value="Execution">{t("projects_phase_execution") || "Execution"}</option>
                            <option value="Construction">{t("projects_phase_construction") || "Construction"}</option>
                        </select>
                        <label>
                            <span className="material-icons-round">subject</span>{t("projects_description") || "Description"}
                        </label>
                        <textarea
                            name="description"
                            cols={30}
                            rows={6}
                            placeholder={t("projects_description_placeholder") || "Give your project a nice description!"}
                            defaultValue={initialData?.description || ""}
                        />
                        
                    </div>
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">pin_drop</span>{t("projects_location") || "Location"}
                        </label>
                        <AddressAutocompleteInput
                            value={projectAddress}
                                onChange={handleAddressChange}
                                onLocationSelect={handleLocationSelect}
                                placeholder={t("projects_location_placeholder") || "Enter project address..."}
                                className="modalInput"
                            />
                            <label className="label-tip">
                                {t("projects_location_tip") || "Start typing to search for addresses"}
                            </label>
                            {/*<div className="coordinatesDisplay">
                                {projectCoordinates && (
                                    <>📍 {projectCoordinates.lat.toFixed(6)}, {projectCoordinates.lng.toFixed(6)}</>
                                )}
                            </div>*/}
                        <div className="mapContainer" style={{ marginTop: 0 }}>
                            <OpenStreetMapComponent
                                address={debouncedAddress}
                                latitude={projectCoordinates?.lat}
                                longitude={projectCoordinates?.lng}
                                onLocationSelect={handleLocationSelect}
                                interactive={false}
                                showMarker={true}
                                height="440px"
                                zoom={25}
                                plotNumber={plotNumber}
                            />
                            {/* Debug info */}
                            <div style={{ fontSize: '10px', color: '#666', padding: '4px' }}>
                                Debug: address="{debouncedAddress}", coords=({projectCoordinates?.lat || 'undefined'}, {projectCoordinates?.lng || 'undefined'})
                            </div>
                        </div>
                        <label className="label-tip">
                        {t("projects_map_tip") || "Click on the map to select precise location"}
                        </label>
                    </div>
                    <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
                    {/* Start date */}
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_today</span>{t("projects_start_date") || "Start Date"}
                        </label>
                        <input
                            name="startDate"
                            type="date"
                            value={formStartDate}
                            onChange={e => setFormStartDate(e.target.value)}
                            className="modalInput"
                        />
                    </div>
                    {/* Finish date */}
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">calendar_month</span>{t("projects_finish_date") || "Finish Date"}
                        </label>
                        <input
                            name="finishDate"
                            type="date"
                            value={formFinishDate}
                            onChange={e => setFormFinishDate(e.target.value)}
                            className="modalInput"
                        />
                    </div>
                    {/* Calendar below the date fields */}
                    <div style={{ gridColumn: "1 / -1", margin: "12px 0" }}>
                    <Calendar
                        tasks={[
                            {
                                id: "temp-project-bar",
                                title: initialData?.name || "New Project",
                                startDate: formStartDate,
                                dueDate: formFinishDate,
                                completed: false,
                                color: initialData?.color || "#007bff",
                                isProjectDuration: true,
                            }
                        ]}
                        start={formStartDate}
                        end={formFinishDate}
                        projectColor={initialData?.color || "#007bff"}
                        projectName={initialData?.name || "New Project"}
                        hideTaskNames={true}
                    />
                    </div>
                    <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />               
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">business</span>{t("projects_company") || "Company"}
                        </label>
                        <select 
                            name="companyId" 
                            defaultValue={initialData?.companyId || ""}
                            className="modalInput"
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
                    {/* Assigned users selection */}
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
                    <hr style={{ gridColumn: "1 / -1", margin: "12px 0" }} />
                    {/* Cost */}
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">paid</span>{t("projects_cost") || "Estimated cost"}
                        </label>
                        <input
                            name="cost"
                            type="number"
                            placeholder={t("projects_cost_placeholder") || "What's the estimated cost of the project?"}
                            defaultValue={initialData?.cost || ""}
                            className="modalInput"
                        />
                        <label className="label-tip">
                            {t("projects_cost_tip") || "Estimated cost of the project"}
                        </label>
                    </div>
                    {/* Status */}
                    <div className="formFieldContainer">
                        <label>
                            <span className="material-icons-round">not_listed_location</span>
                            {t("projects_status") || "Status"}
                        </label>
                        <select name="status" defaultValue={initialData?.status || "Active"} className="modalInput">
                            <option value="Pending">{t("projects_status_pending") || "Pending"}</option>
                            <option value="Active">{t("projects_status_active") || "Active"}</option>
                            <option value="Finished">{t("projects_status_finished") || "Finished"}</option>
                        </select>
                    </div>
                    
                    
                <div className="userCard">
                    {/* Company selection */}
                    
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
