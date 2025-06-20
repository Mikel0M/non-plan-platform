import * as React from 'react';
import * as Router from 'react-router-dom';
import { IUser, User, usersRole, access } from "../classes/User";
import { UsersManager } from '../classes/UsersManager';
import { ProjectsManager } from '../classes/ProjectsManager';
import { companiesManagerInstance } from '../classes/CompaniesManager';
import { useTranslation } from "../context/LanguageContext";
import UserCard from "./UserCard";
import CompanyCard from "./CompanyCard";

interface Props {

    projectsManager: ProjectsManager
    usersManager: UsersManager
}

declare global {
  interface Window {
    openEditUserModal?: (userId: string) => void;
  }
}

export function UsersPage(props: Props) {
    const { t } = useTranslation();
    // State to control which modal is open
    const [openModal, setOpenModal] = React.useState<null | 'newUser' | 'changeUser' | 'newCompany' | 'changeCompany'>(null);
    const [users, setUsers] = React.useState<IUser[]>(props.usersManager.getUsers());
    const [companies, setCompanies] = React.useState(companiesManagerInstance.getCompanies());
    const [newUserForm, setNewUserForm] = React.useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        usersRole: 'Architect',
        access: 'Administrator',
        company: '',
        icon: '',
        color: '#1CFFCA',
    });
    const [editUserForm, setEditUserForm] = React.useState({
        id: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        usersRole: 'Architect',
        access: 'Administrator',
        company: '',
        icon: '',
        color: '#1CFFCA',
    });
    const [userToDelete, setUserToDelete] = React.useState<{id: string, name: string} | null>(null);
    const [activeTab, setActiveTab] = React.useState<'users' | 'companies'>('users');
    const [newCompanyForm, setNewCompanyForm] = React.useState({
        name: '',
        address: '',
        email: '',
        phone: '',
    });
    const [editCompanyForm, setEditCompanyForm] = React.useState({
        id: '',
        name: '',
        address: '',
        email: '',
        phone: '',
    });
    const [companyToDelete, setCompanyToDelete] = React.useState<{id: string, name: string} | null>(null);

    // Sync users state with UsersManager
    React.useEffect(() => {
        setUsers(props.usersManager.getUsers());
    }, [props.usersManager]);

    // Update companies state when manager changes (add effect if needed)
    React.useEffect(() => {
      setCompanies(companiesManagerInstance.getCompanies());
    }, []);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUserForm({ ...newUserForm, [e.target.name]: e.target.value });
    };

    // Handle new user form submit
    const handleNewUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        props.usersManager.newUser({
            ...newUserForm,
            role: newUserForm.usersRole as usersRole,
            access: newUserForm.access as access,
        });
        setUsers(props.usersManager.getUsers()); // update state from manager
        setOpenModal(null);
        setNewUserForm({
            name: '',
            surname: '',
            email: '',
            phone: '',
            usersRole: 'Architect',
            access: 'Administrator',
            company: '',
            icon: '',
            color: '#1CFFCA',
        });
    };

    // Expose global function to open edit modal
    React.useEffect(() => {
        window.openEditUserModal = (userId: string) => {
            const user = props.usersManager.getUsers().find(u => u.id === userId);
            if (user) {
                setEditUserForm({
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    phone: user.phone,
                    usersRole: user.role || 'Architect',
                    access: user.access || 'Administrator',
                    company: user.company || '',
                    icon: user.icon || '',
                    color: user.color || '#1CFFCA',
                });
                setOpenModal('changeUser');
            }
        };
        return () => { delete window.openEditUserModal; };
    }, [props.usersManager]);

    // Change user form submit
    const handleEditUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        props.usersManager.editUser({
            id: editUserForm.id,
            name: editUserForm.name,
            surname: editUserForm.surname,
            email: editUserForm.email,
            phone: editUserForm.phone,
            role: editUserForm.usersRole as usersRole,
            access: editUserForm.access as access,
            company: editUserForm.company,
            icon: editUserForm.icon,
            color: editUserForm.color,
        });
        setUsers(props.usersManager.getUsers());
        setOpenModal(null);
    };

    // Handler for confirming user deletion
    const handleConfirmDeleteUser = () => {
        if (!userToDelete) return;
        props.usersManager.deleteUser(userToDelete.id);
        setUsers(props.usersManager.getUsers());
        setUserToDelete(null);
        const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null;
        if (modal) modal.close();
    };

    // Handle new company form input changes
    const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCompanyForm({ ...newCompanyForm, [e.target.name]: e.target.value });
    };
    // Handle new company form submit
    const handleNewCompanySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        companiesManagerInstance.addCompany({
            name: newCompanyForm.name,
            address: newCompanyForm.address,
            email: newCompanyForm.email,
            phone: newCompanyForm.phone,
        });
        setCompanies([...companiesManagerInstance.getCompanies()]);
        setOpenModal(null);
        setNewCompanyForm({ name: '', address: '', email: '', phone: '' });
    };
    // Handle edit company modal open
    const openEditCompanyModal = (companyId: string) => {
        const company = companies.find(c => c.id === companyId);
        if (company) {
            setEditCompanyForm({
                id: company.id,
                name: company.name,
                address: company.address || '',
                email: company.email || '',
                phone: company.phone || '',
            });
            setOpenModal('changeCompany');
        }
    };
    // Handle edit company form submit
    const handleEditCompanySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const idx = companies.findIndex(c => c.id === editCompanyForm.id);
        if (idx !== -1) {
            companies[idx].name = editCompanyForm.name;
            companies[idx].address = editCompanyForm.address;
            companies[idx].email = editCompanyForm.email;
            companies[idx].phone = editCompanyForm.phone;
            setCompanies([...companies]);
        }
        setOpenModal(null);
    };
    // Handle confirm delete company
    const handleConfirmDeleteCompany = () => {
        if (!companyToDelete) return;
        companiesManagerInstance.deleteCompany(companyToDelete.id);
        setCompanies([...companiesManagerInstance.getCompanies()]);
        setCompanyToDelete(null);
        const modal = document.getElementById('DeleteCompanyModal') as HTMLDialogElement | null;
        if (modal) modal.close();
    };

    return (
        <div className="page page-flex" id="usersPage">
            <header>
  <div className="tabs-row" style={{margin: '15px 0'}}>
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
                            <select name="usersRole" value={newUserForm.usersRole} onChange={handleInputChange}>
                                <option>{t("projects_role_architect") || "Architect"}</option>
                                <option>{t("projects_role_engineer") || "Engineer"}</option>
                                <option>{t("projects_role_developer") || "Developer"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">vpn_key</span>{t("users_access") || "Access rights"}
                            </label>
                            <select name="access" value={newUserForm.access} onChange={handleInputChange}>
                                <option>{t("users_access_admin") || "Administrator"}</option>
                                <option>{t("users_access_editor") || "Editor"}</option>
                                <option>{t("users_access_guest") || "Guest"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">business</span>{t("users_company") || "Company"}
                            </label>
                            <select name="company" value={newUserForm.company} onChange={handleInputChange}>
                                <option value="">{t("users_select_company") || "Select company"}</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.name}>{company.name}</option>
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
                            <select name="CH_usersRole" value={editUserForm.usersRole} onChange={e => setEditUserForm(f => ({...f, usersRole: e.target.value}))}>
                                <option>{t("projects_role_architect") || "Architect"}</option>
                                <option>{t("projects_role_engineer") || "Engineer"}</option>
                                <option>{t("projects_role_developer") || "Developer"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">vpn_key</span>{t("users_access") || "Access rights"}
                            </label>
                            <select name="CH_access" value={editUserForm.access} onChange={e => setEditUserForm(f => ({...f, access: e.target.value}))}>
                                <option>{t("users_access_admin") || "Administrator"}</option>
                                <option>{t("users_access_editor") || "Editor"}</option>
                                <option>{t("users_access_guest") || "Guest"}</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">business</span>{t("users_company") || "Company"}
                            </label>
                            <select name="CH_company" value={editUserForm.company} onChange={e => setEditUserForm(f => ({...f, company: e.target.value}))}>
                                <option value="">{t("users_select_company") || "Select company"}</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.name}>{company.name}</option>
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
                            <input type="text" name="address" value={newCompanyForm.address} onChange={handleCompanyInputChange} />
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
                            <input type="text" name="address" value={editCompanyForm.address} onChange={e => setEditCompanyForm(f => ({...f, address: e.target.value}))} />
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
        {users.map((user, idx) => (
          <UserCard
            key={user.id || idx}
            user={user}
            onEdit={id => window.openEditUserModal && window.openEditUserModal(id)}
            onDelete={id => {
              setUserToDelete({ id, name: `${user.name} ${user.surname}` });
              const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null;
              if (modal) modal.showModal();
            }}
          />
        ))}
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
        {companies.map((company, idx) => (
          <CompanyCard
            key={company.id}
            company={company}
            onEdit={id => openEditCompanyModal(id)}
            onDelete={id => {
              setCompanyToDelete({ id, name: company.name });
              const modal = document.getElementById('DeleteCompanyModal') as HTMLDialogElement | null;
              if (modal) modal.showModal();
            }}
          />
        ))}
      </div>
      </>
    )}
</div>
        </div>
    );
}