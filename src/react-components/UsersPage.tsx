import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from "firebase/firestore";
import { IUser, User, usersRole, access } from "../classes/User";
import { ICompany } from "../classes/Company";
import { UsersManager } from '../classes/UsersManager';
import { ProjectsManager } from '../classes/ProjectsManager';
import { companiesManagerInstance } from '../classes/CompaniesManager';
import { useTranslation } from "./LanguageContext";
import UserCard from "./UserCard";
import CompanyCard from "./CompanyCard";
import { SearchBox } from './SearchBox';
import { getCollection, deleteDocument } from '../firebase';

interface Props {

    projectsManager: ProjectsManager
    usersManager: UsersManager
}

declare global {
  interface Window {
    openEditUserModal?: (userId: string) => void;
  }
}

const usersCollection = getCollection<IUser>("/users");
const companiesCollection = getCollection<ICompany>("/companies");

export function UsersPage(props: Props) {
    const { t } = useTranslation();
    // State to control which modal is open
    const [openModal, setOpenModal] = React.useState<null | 'newUser' | 'changeUser' | 'newCompany' | 'changeCompany'>(null);
    const [users, setUsers] = React.useState<IUser[]>([]);
    const [companies, setCompanies] = React.useState(companiesManagerInstance.getCompanies());

    const [newUserForm, setNewUserForm] = React.useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        role: 'architect',
        permissions: 'create_projects',
        companyId: '',
        companyRole: 'user',
        invitedBy: '',
        icon: '',
        color: '#1CFFCA',
    });
    const [editUserForm, setEditUserForm] = React.useState({
        id: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        role: 'architect',
        permissions: 'create_projects',
        companyId: '',
        companyRole: 'user',
        invitedBy: '',
        icon: '',
        color: '#1CFFCA',
    });
    const [userToDelete, setUserToDelete] = React.useState<{id: string, name: string} | null>(null);
    const [activeTab, setActiveTab] = React.useState<'users' | 'companies'>('users');
    const [newCompanyForm, setNewCompanyForm] = React.useState({
        name: '',
        backgroundColor: '#FFFFFF',
        primaryColor: '#3F51B5',
        billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        email: '',
        phone: '',
    });
    const [editCompanyForm, setEditCompanyForm] = React.useState({
        id: '',
        name: '',
        backgroundColor: '#FFFFFF',
        primaryColor: '#3F51B5',
        billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        email: '',
        phone: '',
    });
    const [companyToDelete, setCompanyToDelete] = React.useState<{id: string, name: string} | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [isRefreshingCompanies, setIsRefreshingCompanies] = React.useState(false);

    // Manual refresh function
    const handleRefreshUsers = async () => {
        setIsRefreshing(true);
        try {
            console.log('[UsersPage] Manually refreshing users...');
            await props.usersManager.refreshUsersFromFirebase();
            const refreshedUsers = props.usersManager.getUsers();
            setUsers(refreshedUsers);
            console.log(`[UsersPage] Users refreshed. Total: ${refreshedUsers.length}`);
        } catch (error) {
            console.error('Failed to refresh users:', error);
            alert('Failed to refresh users. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Manual refresh function for companies
    const handleRefreshCompanies = async () => {
        setIsRefreshingCompanies(true);
        try {
            console.log('[UsersPage] Manually refreshing companies...');
            await companiesManagerInstance.refreshCompaniesFromFirebase();
            const refreshedCompanies = companiesManagerInstance.getCompanies();
            setCompanies(refreshedCompanies);
            console.log(`[UsersPage] Companies refreshed. Total: ${refreshedCompanies.length}`);
        } catch (error) {
            console.error('Failed to refresh companies:', error);
            alert('Failed to refresh companies. Please try again.');
        } finally {
            setIsRefreshingCompanies(false);
        }
    };

    // Load users and companies from Firebase

    

    // Load users and companies when component mounts
    React.useEffect(() => {
        const loadInitialData = async () => {
            try {
                console.log('[UsersPage] Loading initial data...');
                
                // Users are already loaded at app level - just get them from the manager
                const loadedUsers = props.usersManager.getUsers();
                setUsers(loadedUsers);
                console.log(`[UsersPage] Loaded ${loadedUsers.length} users from manager`);
                
                // Companies are already loaded at app level - just get them from the manager
                const loadedCompanies = companiesManagerInstance.getCompanies();
                setCompanies(loadedCompanies);
                console.log(`[UsersPage] Loaded ${loadedCompanies.length} companies from manager`);
                
                console.log('[UsersPage] Initial data load complete');
            } catch (error) {
                console.error('Failed to load initial data:', error);
                
                // Fallback to manager data if something fails
                try {
                    const loadedUsers = props.usersManager.getUsers();
                    setUsers(loadedUsers);
                    console.log(`[UsersPage] Fallback: Loaded ${loadedUsers.length} users from manager`);
                    
                    const loadedCompanies = companiesManagerInstance.getCompanies();
                    setCompanies(loadedCompanies);
                    console.log(`[UsersPage] Fallback: Loaded ${loadedCompanies.length} companies from manager`);
                } catch (fallbackError) {
                    console.error('Failed to load data from managers:', fallbackError);
                }
            }
        };
        
        loadInitialData();
    }, [props.usersManager]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUserForm({ ...newUserForm, [e.target.name]: e.target.value });
    };

    // Handle new user form submit
    const handleNewUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // STEP 1: Create user locally first (generates missing fields)
            const user = props.usersManager.newUser({
                name: newUserForm.name,
                surname: newUserForm.surname,
                email: newUserForm.email,
                phone: newUserForm.phone,
                role: newUserForm.role,
                permissions: newUserForm.permissions,
                companyId: newUserForm.companyId,
                companyRole: newUserForm.companyRole,
                invitedBy: newUserForm.invitedBy,
                icon: newUserForm.icon,
                color: newUserForm.color,
            });
            
            // STEP 2: Save complete user data to Firestore with proper defaults
            const completeUserData = {
                name: user.name || '',
                surname: user.surname || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'architect',
                permissions: user.permissions || 'create_projects',
                companyId: user.companyId || '',
                companyRole: user.companyRole || 'user',
                invitedBy: user.invitedBy || '',
                icon: user.icon || '',
                color: user.color || '#1CFFCA',
                displayName: user.displayName || `${user.name} ${user.surname}`,
                
                // ✅ FIX: Provide defaults for potentially undefined fields
                isActive: user.isActive !== undefined ? user.isActive : true,
                notifications: user.notifications !== undefined ? user.notifications : true,
                preferences: user.preferences || {
                    language: "english",
                    timezone: "europe"
                },
                createdAt: user.createdAt || new Date(),
                
                // ✅ ADD: Other fields that might be undefined
                invitedAt: user.invitedAt || null,
                joinedAt: user.joinedAt || null,
                lastLogin: user.lastLogin || null,
            };
            
            // Remove any undefined values before sending to Firestore
            const cleanedData = Object.fromEntries(
                Object.entries(completeUserData).filter(([_, value]) => value !== undefined)
            ) as Partial<IUser>;
            
            // 🔥 FIREBASE WRITE
            await Firestore.addDoc(usersCollection, cleanedData);
            
            // Update local state
            const updatedUsers = props.usersManager.getUsers();
            setUsers(updatedUsers);
            
            setOpenModal(null);
            setNewUserForm({
                name: '',
                surname: '',
                email: '',
                phone: '',
                role: 'architect',
                permissions: 'create_projects',
                companyId: '',
                companyRole: 'user',
                invitedBy: '',
                icon: '',
                color: '#1CFFCA',
            });
            
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    };

    // Expose global function to open edit modal
    React.useEffect(() => {
        window.openEditUserModal = (userId: string) => {
            try {
                const currentUsers = props.usersManager.getUsers();
                const user = currentUsers.find(u => u.id === userId);
                if (user) {
                    setEditUserForm({
                        id: user.id || '',
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        phone: user.phone,
                        role: user.role || 'architect',
                        permissions: user.permissions || 'create_projects',
                        companyId: user.companyId || '',
                        companyRole: user.companyRole || 'user',
                        invitedBy: user.invitedBy || '',
                        icon: user.icon || '',
                        color: user.color || '#1CFFCA',
                    });
                    setOpenModal('changeUser');
                }
            } catch (error) {
                console.error('Failed to load user for editing:', error);
            }
        };
        return () => { delete window.openEditUserModal; };
    }, [props.usersManager]);

    // Change user form submit
    const handleEditUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // STEP 1: Update locally first
            props.usersManager.editUser({
                id: editUserForm.id,
                name: editUserForm.name,
                surname: editUserForm.surname,
                email: editUserForm.email,
                phone: editUserForm.phone,
                role: editUserForm.role,
                permissions: editUserForm.permissions,
                companyId: editUserForm.companyId,
                companyRole: editUserForm.companyRole,
                invitedBy: editUserForm.invitedBy,
                icon: editUserForm.icon,
                color: editUserForm.color,
            });
            
            // STEP 2: Update in Firebase
            const updatedUserData = {
                name: editUserForm.name,
                surname: editUserForm.surname,
                email: editUserForm.email,
                phone: editUserForm.phone,
                role: editUserForm.role,
                permissions: editUserForm.permissions,
                companyId: editUserForm.companyId,
                companyRole: editUserForm.companyRole,
                invitedBy: editUserForm.invitedBy,
                icon: editUserForm.icon,
                color: editUserForm.color,
                displayName: `${editUserForm.name} ${editUserForm.surname}`,
                updatedAt: new Date(),
            };
            
            // Clean undefined values
            const cleanedData = Object.fromEntries(
                Object.entries(updatedUserData).filter(([_, value]) => value !== undefined)
            ) as Partial<IUser>;
            
            // 🔥 FIREBASE WRITE
            await Firestore.updateDoc(Firestore.doc(usersCollection, editUserForm.id), cleanedData);
            
            // STEP 3: Update UI state
            const updatedUsers = props.usersManager.getUsers();
            setUsers(updatedUsers);
            
            setOpenModal(null);
            
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    // Handler for confirming user deletion
    const handleConfirmDeleteUser = async () => {
        if (!userToDelete) return;
        
        try {
            console.log(`🗑️ Deleting user: ${userToDelete.name} (ID: ${userToDelete.id})`);
            
            // STEP 1: Delete from Firebase first
            await deleteDocument("/users", userToDelete.id);
            console.log('✅ User deleted from Firebase');
            
            // STEP 2: Delete from local state
            props.usersManager.deleteUser(userToDelete.id);
            console.log('✅ User deleted from local state');
            
            // STEP 3: Update UI state
            const updatedUsers = props.usersManager.getUsers();
            setUsers(updatedUsers);
            console.log('✅ UI state updated');
            
            // STEP 4: Close modal
            setUserToDelete(null);
            const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null;
            if (modal) modal.close();
            
            console.log('✅ User deletion completed successfully');
            
        } catch (error) {
            console.error('❌ Failed to delete user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    // Handle new company form input changes
    const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('billingAddress.')) {
            const field = name.split('.')[1];
            setNewCompanyForm(prev => ({
                ...prev,
                billingAddress: {
                    ...prev.billingAddress,
                    [field]: value
                }
            }));
        } else {
            setNewCompanyForm({ ...newCompanyForm, [name]: value });
        }
    };
    // Handle new company form submit
    const handleNewCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // STEP 1: Create company locally first
            const company = companiesManagerInstance.addCompany({
                name: newCompanyForm.name,
                backgroundColor: newCompanyForm.backgroundColor,
                primaryColor: newCompanyForm.primaryColor,
                billingAddress: newCompanyForm.billingAddress,
                email: newCompanyForm.email,
                phone: newCompanyForm.phone,
            });
            
            // STEP 2: Save complete company data to Firestore
            const completeCompanyData = {
                name: company.name,
                backgroundColor: company.backgroundColor,
                primaryColor: company.primaryColor,
                billingAddress: company.billingAddress,
                email: company.email,
                phone: company.phone,
                bankAccount: company.bankAccount || "",
                features: company.features || [],
                settings: company.settings || {
                    allowExternalCollaboration: false,
                    allowUserInvites: true,
                    customRoles: [],
                    defaultProjectRole: "contributor",
                    defaultUserPermissions: "create_projects",
                    language: "english",
                    requireInviteApproval: true,
                    timezone: "europe"
                },
                subscription: company.subscription || {
                    isActive: true,
                    maxProjects: 5,
                    maxUsers: 5,
                    plan: "free",
                    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
                },
                createdAt: company.createdAt || new Date(),
                // Don't include ID - Firestore generates it
            };
            
            // 🔥 FIREBASE WRITE - This was missing!
            await Firestore.addDoc(companiesCollection, completeCompanyData);
            
            setCompanies([...companiesManagerInstance.getCompanies()]);
            setOpenModal(null);
            setNewCompanyForm({ 
                name: '', 
                backgroundColor: '#FFFFFF',
                primaryColor: '#3F51B5',
                billingAddress: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                },
                email: '', 
                phone: '' 
            });
            
        } catch (error) {
            console.error('Failed to create company:', error);
            // Handle error - show error message to user
        }
    };
    // Handle edit company modal open
    const openEditCompanyModal = (companyId: string) => {
        const company = companies.find(c => c.id === companyId);
        if (company) {
            setEditCompanyForm({
                id: company.id || '',
                name: company.name,
                backgroundColor: company.backgroundColor || '#FFFFFF',
                primaryColor: company.primaryColor || '#3F51B5',
                billingAddress: company.billingAddress || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                },
                email: company.email || '',
                phone: company.phone || '',
            });
            setOpenModal('changeCompany');
        }
    };
    // Handle edit company form submit
    const handleEditCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // STEP 1: Update locally first
            companiesManagerInstance.editCompany({
                id: editCompanyForm.id,
                name: editCompanyForm.name,
                backgroundColor: editCompanyForm.backgroundColor,
                primaryColor: editCompanyForm.primaryColor,
                billingAddress: editCompanyForm.billingAddress,
                email: editCompanyForm.email,
                phone: editCompanyForm.phone,
            });
            
            // STEP 2: Update in Firebase
            const updatedCompanyData = {
                name: editCompanyForm.name,
                backgroundColor: editCompanyForm.backgroundColor,
                primaryColor: editCompanyForm.primaryColor,
                billingAddress: editCompanyForm.billingAddress,
                email: editCompanyForm.email,
                phone: editCompanyForm.phone,
                updatedAt: new Date(),
            };
            
            // 🔥 FIREBASE WRITE
            await Firestore.updateDoc(Firestore.doc(companiesCollection, editCompanyForm.id), updatedCompanyData);
            
            // STEP 3: Update UI state
            setCompanies([...companiesManagerInstance.getCompanies()]);
            
            setOpenModal(null);
            
        } catch (error) {
            console.error('Failed to update company:', error);
            alert('Failed to update company. Please try again.');
        }
    };
    // Handle confirm delete company
    const handleConfirmDeleteCompany = async () => {
        if (!companyToDelete) return;
        
        try {
            console.log(`🗑️ Deleting company: ${companyToDelete.name} (ID: ${companyToDelete.id})`);
            
            // STEP 1: Delete from Firebase first
            await deleteDocument("/companies", companyToDelete.id);
            console.log('✅ Company deleted from Firebase');
            
            // STEP 2: Delete from local state
            companiesManagerInstance.deleteCompany(companyToDelete.id);
            console.log('✅ Company deleted from local state');
            
            // STEP 3: Update UI state
            setCompanies([...companiesManagerInstance.getCompanies()]);
            console.log('✅ UI state updated');
            
            // STEP 4: Close modal
            setCompanyToDelete(null);
            const modal = document.getElementById('DeleteCompanyModal') as HTMLDialogElement | null;
            if (modal) modal.close();
            
            console.log('✅ Company deletion completed successfully');
            
        } catch (error) {
            console.error('❌ Failed to delete company:', error);
            alert('Failed to delete company. Please try again.');
        }
    };

    // Filter users and companies to only those that match the search query
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredCompanies = companies.filter(company =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page page-flex" id="usersPage">
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <header>
  <div className="tabs-row" style={{margin: '15px 0', display: 'flex', alignItems: 'center', gap: 8}}>
    {activeTab === 'users' && (
      <button
        className="tabCircle"
        onClick={() => setActiveTab('companies')}
        type="button"
        title={t("users_show_companies") || "Show Companies"}
      >
        <span className="material-icons-round">business</span>
      </button>
    )}
    {activeTab === 'companies' && (
      <button
        className="tabCircle"
        onClick={() => setActiveTab('users')}
        type="button"
        title={t("users_show_users") || "Show Users"}
      >
        <span className="material-icons-round">person</span>
      </button>
    )}
    {/* Search bar right of the icon */}
    <div style={{ minWidth: 180, flex: 1 }}>
      <SearchBox value={searchQuery} onValueChange={setSearchQuery} placeholder={activeTab === 'users' ? t("search_users") || "Search for users" : t("search_companies") || "Search for companies"} />
    </div>
    {/* Refresh button for users */}
    {activeTab === 'users' && (
      <button 
        className="buttonTertiary" 
        onClick={handleRefreshUsers}
        disabled={isRefreshing}
        title={t("users_refresh") || "Refresh users from database"}
        style={{ opacity: isRefreshing ? 0.6 : 1 }}
      >
        <span className="material-icons-round" style={{ 
          animation: isRefreshing ? 'spin 1s linear infinite' : 'none' 
        }}>
          refresh
        </span>
      </button>
    )}
    {/* Refresh button for companies */}
    {activeTab === 'companies' && (
      <button 
        className="buttonTertiary" 
        onClick={handleRefreshCompanies}
        disabled={isRefreshingCompanies}
        title={t("companies_refresh") || "Refresh companies from database"}
        style={{ opacity: isRefreshingCompanies ? 0.6 : 1 }}
      >
        <span className="material-icons-round" style={{ 
          animation: isRefreshingCompanies ? 'spin 1s linear infinite' : 'none' 
        }}>
          refresh
        </span>
      </button>
    )}
    {activeTab === 'users' && (
      <button id="newUserBtn" className="buttonTertiary" onClick={() => setOpenModal('newUser')}>
        <span className="material-icons-round">add</span>
        <span className="material-icons-round">person</span>
      </button>
    )}
    {activeTab === 'companies' && (
      <button id="newCompanyBtn" className="buttonTertiary" onClick={() => setOpenModal('newCompany')}>
        <span className="material-icons-round">add</span>
        <span className="material-icons-round">business</span>
      </button>
    )}
  </div>
</header>
            <dialog id="newUserModal" open={openModal === 'newUser'}>
                <form className="userForm" id="newUserForm" onSubmit={handleNewUserSubmit}>
                    <h2>{t("users_new_user") || "New User"}</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_name") || "Name"}
                            </label>
                            <input name="name" type="text" value={newUserForm.name} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_surname") || "Surname"}
                            </label>
                            <input name="surname" type="text" value={newUserForm.surname} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>{t("users_email") || "Email Address"}
                            </label>
                            <input name="email" type="text" value={newUserForm.email} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>{t("users_phone") || "Telephone Number"}
                            </label>
                            <input name="phone" type="text" value={newUserForm.phone} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">account_circle</span>{t("users_role") || "Role"}
                            </label>
                            <select name="role" value={newUserForm.role} onChange={handleInputChange}>
                                <option value="architect">{t("projects_role_architect") || "Architect"}</option>
                                <option value="engineer">{t("projects_role_engineer") || "Engineer"}</option>
                                <option value="developer">{t("projects_role_developer") || "Developer"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">vpn_key</span>{t("users_access") || "Access rights"}
                            </label>
                            <select name="permissions" value={newUserForm.permissions} onChange={handleInputChange}>
                                <option value="create_projects">{t("users_access_admin") || "Administrator"}</option>
                                <option value="edit_projects">{t("users_access_editor") || "Editor"}</option>
                                <option value="view_projects">{t("users_access_guest") || "Guest"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">business</span>{t("users_company") || "Company"}
                            </label>
                            <select name="companyId" value={newUserForm.companyId} onChange={handleInputChange}>
                                <option value="">{t("users_select_company") || "Select company"}</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id || ''}>{company.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button
                            type="button"
                            className="cancelButton"
                            onClick={() => setOpenModal(null)}
                        >
                            {t("projects_cancel") || "Cancel"}
                        </button>
                        <button type="submit" className="acceptButton" id="UserCreateButton">
                            {t("projects_accept") || "Accept"}
                        </button>
                    </div>
                </form>
            </dialog>
            <dialog id="ChangeUserModal" open={openModal === 'changeUser'}>
                <form className="userForm" id="newUserForm" onSubmit={handleEditUserSubmit}>
                    <h2>{t("users_change_user") || "Change User"}</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_name") || "Name"}
                            </label>
                            <input name="CH_name" type="text" value={editUserForm.name} onChange={e => setEditUserForm(f => ({...f, name: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_surname") || "Surname"}
                            </label>
                            <input name="CH_surname" type="text" value={editUserForm.surname} onChange={e => setEditUserForm(f => ({...f, surname: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>{t("users_email") || "Email Address"}
                            </label>
                            <input name="CH_email" type="text" value={editUserForm.email} onChange={e => setEditUserForm(f => ({...f, email: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>{t("users_phone") || "Telephone Number"}
                            </label>
                            <input name="CH_phone" type="text" value={editUserForm.phone} onChange={e => setEditUserForm(f => ({...f, phone: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">account_circle</span>{t("users_role") || "Role"}
                            </label>
                            <select name="CH_role" value={editUserForm.role} onChange={e => setEditUserForm(f => ({...f, role: e.target.value}))}>
                                <option value="architect">{t("projects_role_architect") || "Architect"}</option>
                                <option value="engineer">{t("projects_role_engineer") || "Engineer"}</option>
                                <option value="developer">{t("projects_role_developer") || "Developer"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">vpn_key</span>{t("users_access") || "Access rights"}
                            </label>
                            <select name="CH_permissions" value={editUserForm.permissions} onChange={e => setEditUserForm(f => ({...f, permissions: e.target.value}))}>
                                <option value="create_projects">{t("users_access_admin") || "Administrator"}</option>
                                <option value="edit_projects">{t("users_access_editor") || "Editor"}</option>
                                <option value="view_projects">{t("users_access_guest") || "Guest"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">business</span>{t("users_company") || "Company"}
                            </label>
                            <select name="CH_companyId" value={editUserForm.companyId} onChange={e => setEditUserForm(f => ({...f, companyId: e.target.value}))}>
                                <option value="">{t("users_select_company") || "Select company"}</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id || ''}>{company.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button type="button" className="cancelButton" onClick={() => setOpenModal(null)}>{t("projects_cancel") || "Cancel"}</button>
                        <button type="submit" className="acceptButton" id="UserChangeAcceptButton">{t("projects_accept") || "Accept"}</button>
                    </div>
                </form>
            </dialog>
            <dialog id="newCompanyModal" open={openModal === 'newCompany'}>
                <form className="userForm" id="newCompanyForm" onSubmit={handleNewCompanySubmit}>
                    <h2>{t("users_new_company") || "New Company"}</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_company_name") || "Company Name"}
                            </label>
                            <input type="text" name="name" value={newCompanyForm.name} onChange={handleCompanyInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_company_address") || "Company Address"}
                            </label>
                            <input type="text" name="billingAddress.street" value={newCompanyForm.billingAddress.street} onChange={handleCompanyInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>{t("users_company_email") || "Contact Email"}
                            </label>
                            <input type="text" name="email" value={newCompanyForm.email} onChange={handleCompanyInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>{t("users_company_phone") || "Telephone Number"}
                            </label>
                            <input type="tel" name="phone" value={newCompanyForm.phone} onChange={handleCompanyInputChange} />
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button
                            type="button"
                            className="cancelButton"
                            onClick={() => setOpenModal(null)}
                        >
                            {t("projects_cancel") || "Cancel"}
                        </button>
                        <button type="submit" className="acceptButton">
                            {t("projects_accept") || "Accept"}
                        </button>
                    </div>
                </form>
            </dialog>
            <dialog id="ChangeCompanyModal" open={openModal === 'changeCompany'}>
                <form className="userForm" id="editCompanyForm" onSubmit={handleEditCompanySubmit}>
                    <h2>{t("users_edit_company") || "Edit Company"}</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_company_name") || "Company Name"}
                            </label>
                            <input type="text" name="name" value={editCompanyForm.name} onChange={e => setEditCompanyForm(f => ({...f, name: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>{t("users_company_address") || "Company Address"}
                            </label>
                            <input type="text" name="billingAddress.street" value={editCompanyForm.billingAddress.street} onChange={e => setEditCompanyForm(f => ({...f, billingAddress: {...f.billingAddress, street: e.target.value}}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>{t("users_company_email") || "Contact Email"}
                            </label>
                            <input type="text" name="email" value={editCompanyForm.email} onChange={e => setEditCompanyForm(f => ({...f, email: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>{t("users_company_phone") || "Telephone Number"}
                            </label>
                            <input type="tel" name="phone" value={editCompanyForm.phone} onChange={e => setEditCompanyForm(f => ({...f, phone: e.target.value}))} />
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button type="button" className="cancelButton" onClick={() => setOpenModal(null)}>{t("projects_cancel") || "Cancel"}</button>
                        <button type="submit" className="acceptButton">{t("projects_accept") || "Accept"}</button>
                    </div>
                </form>
            </dialog>
            <dialog id="DeleteUserModal">
              <form className="userForm" id="DeleteUserForm">
                <h2>{t("users_confirm_delete_user") || "Are you sure you want to delete the user"} {userToDelete?.name ? `"${userToDelete.name}"?` : "?"}</h2>
                <div className="cancelAccept">
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={() => { setUserToDelete(null); const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null; if (modal) modal.close(); }}>
                    {t("projects_cancel") || "Cancel"}
                  </button>
                  <button type="button" className="acceptButton" id="ConfirmDeleteUserButton" onClick={handleConfirmDeleteUser}>{t("users_delete") || "Delete"}</button>
                </div>
              </form>
            </dialog>
            <dialog id="DeleteCompanyModal">
              <form className="userForm" id="DeleteCompanyForm">
                <h2>{t("users_confirm_delete_company") || "Are you sure you want to delete the company"} {companyToDelete?.name ? `"${companyToDelete.name}"?` : "?"}</h2>
                <div className="cancelAccept">
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={() => { setCompanyToDelete(null); const modal = document.getElementById('DeleteCompanyModal') as HTMLDialogElement | null; if (modal) modal.close(); }}>
                    {t("projects_cancel") || "Cancel"}
                  </button>
                  <button type="button" className="acceptButton" id="ConfirmDeleteCompanyButton" onClick={handleConfirmDeleteCompany}>{t("users_delete") || "Delete"}</button>
                </div>
              </form>
            </dialog>
            <div className="flex-row user-count-row" style={{ marginLeft: 10, alignItems: 'center', height: 40 }}>
              <label className="label-tip" style={{ marginRight: 8, marginBottom: 0 }}>{t("users_total_number") || "Total number of"} {activeTab === 'users' ? t("sidebar_users") || 'Users' : t("users_companies") || 'Companies'}:</label>
              <label className="label-tip" id="userCount" style={{ marginBottom: 0 }}>
                {activeTab === 'users' ? users.length : companies.length}
              </label>
            </div>
            {/* Only one list visible at a time */}
            <div className="user-cards-grid">
    {activeTab === 'users' && (
      <div className="user-cards-header" style={{
        display: 'grid',
        gridTemplateColumns: '40px 2fr 1fr 2fr 40px',
        paddingLeft: 10,
        paddingRight: 30,
        paddingTop: 30,
        columnGap: 10,
        alignItems: 'center',
        fontWeight: 600,
        color: 'var(--text-100, #fff)'
      }}>
        <label className="label-tip"></label>
        <label className="label-tip">{t("users_user_name") || "User name"}</label>
        <label className="label-tip">{t("users_role") || "Role"}</label>
        <label className="label-tip">{t("users_company") || "Company"}</label>
        <label className="label-tip" style={{ justifySelf: "end" }}></label>
      </div>
    )}
    {activeTab === 'users' && (
      <div
        id="usersList"
        className="usersList"
        style={{ display: 'flex', flexDirection: 'column', rowGap: 10, paddingLeft: 10, paddingRight: 30 }}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={id => window.openEditUserModal && window.openEditUserModal(id)}
              onDelete={id => {
                setUserToDelete({ id, name: `${user.name} ${user.surname}` });
                const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null;
                if (modal) modal.showModal();
              }}
            />
          ))
        ) : (
          <div style={{color: '#aaa'}}>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 16, color: '#888' }}>
              There are no users to display!
            </p>
          </div>
        )}
      </div>
    )}
    {activeTab === 'companies' && (
      <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 2fr 2fr 2fr 1fr 40px",
          paddingLeft: 10,
          paddingRight: 30,
          paddingTop: 30,
          columnGap: 10,
          alignItems: "center",
          fontWeight: 600,
          color: "var(--text-100, #fff)"
        }}
      >
        <label className="label-tip"></label>
        <label className="label-tip">{t("users_company") || "Company"}</label>
        <label className="label-tip">{t("users_company_address") || "Address"}</label>
        <label className="label-tip">{t("users_company_email") || "Email"}</label>
        <label className="label-tip">{t("users_company_phone") || "Phone"}</label>
        <label className="label-tip" style={{ justifySelf: "end" }}></label>
      </div>
      <div
        id="companiesList"
        className="usersList"
        style={{ display: 'flex', flexDirection: 'column', rowGap: 10, paddingLeft: 10, paddingRight: 30 }}
      >
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map(company => (
            <CompanyCard
              key={company.id}
              company={{
                id: company.id || '',
                name: company.name,
                address: `${company.billingAddress?.street || ''}, ${company.billingAddress?.city || ''}, ${company.billingAddress?.state || ''} ${company.billingAddress?.zipCode || ''}, ${company.billingAddress?.country || ''}`.trim(),
                email: company.email,
                phone: company.phone
              }}
              onEdit={id => openEditCompanyModal(id)}
              onDelete={id => {
                setCompanyToDelete({ id: company.id || '', name: company.name });
                const modal = document.getElementById('DeleteCompanyModal') as HTMLDialogElement | null;
                if (modal) modal.showModal();
              }}
            />
          ))
        ) : (
          <div style={{color: '#aaa'}}>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 16, color: '#888' }}>
              There are no companies to display!
            </p>
          </div>
        )}
      </div>
      </>
    )}
</div>
        </div>
    );
}