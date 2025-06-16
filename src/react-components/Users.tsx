import * as React from 'react';
import * as Router from 'react-router-dom';
import { IUser, User, usersRole, access } from "../classes/User";
import { UsersManager } from '../classes/UsersManager';
import { ProjectsManager } from '../classes/ProjectsManager';
import { companiesManagerInstance } from '../classes/CompaniesManager';

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
    const newUserModalRef = React.useRef<HTMLDialogElement>(null);
    const changeUserModalRef = React.useRef<HTMLDialogElement>(null);
    const newCompanyModalRef = React.useRef<HTMLDialogElement>(null);
    const changeCompanyModalRef = React.useRef<HTMLDialogElement>(null);
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

    React.useEffect(() => {
        if (openModal === 'newUser') newUserModalRef.current?.showModal();
        else newUserModalRef.current?.close();
        if (openModal === 'changeUser') changeUserModalRef.current?.showModal();
        else changeUserModalRef.current?.close();
        if (openModal === 'newCompany') newCompanyModalRef.current?.showModal();
        else newCompanyModalRef.current?.close();
        if (openModal === 'changeCompany') changeCompanyModalRef.current?.showModal();
        else changeCompanyModalRef.current?.close();
    }, [openModal]);

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
        <div className="page" id="usersPage" style={{ display: "flex" }}>
            <dialog id="newUserModal" ref={newUserModalRef}>
                <form className="userForm" id="newUserForm" onSubmit={handleNewUserSubmit}>
                    <h2>New User</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Name
                            </label>
                            <input name="name" type="text" value={newUserForm.name} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Surname
                            </label>
                            <input name="surname" type="text" value={newUserForm.surname} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>Email Address
                            </label>
                            <input name="email" type="text" value={newUserForm.email} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>Telephone Number
                            </label>
                            <input name="phone" type="text" value={newUserForm.phone} onChange={handleInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">account_circle</span>Role
                            </label>
                            <select name="usersRole" value={newUserForm.usersRole} onChange={handleInputChange}>
                                <option>Architect</option>
                                <option>Engineer</option>
                                <option>Developer</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">vpn_key</span>Access rights
                            </label>
                            <select name="access" value={newUserForm.access} onChange={handleInputChange}>
                                <option>Administrator</option>
                                <option>Editor</option>
                                <option>Guest</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">business</span>Company
                            </label>
                            <select name="company" value={newUserForm.company} onChange={handleInputChange}>
                                <option value="">Select company</option>
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
                            Cancel
                        </button>
                        <button type="submit" className="acceptButton" id="UserCreateButton">
                            Accept
                        </button>
                    </div>
                </form>
            </dialog>
            <dialog id="ChangeUserModal" ref={changeUserModalRef}>
                <form className="userForm" id="newUserForm" onSubmit={handleEditUserSubmit}>
                    <h2>Change User</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Name
                            </label>
                            <input name="CH_name" type="text" value={editUserForm.name} onChange={e => setEditUserForm(f => ({...f, name: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Surname
                            </label>
                            <input name="CH_surname" type="text" value={editUserForm.surname} onChange={e => setEditUserForm(f => ({...f, surname: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>Email Address
                            </label>
                            <input name="CH_email" type="text" value={editUserForm.email} onChange={e => setEditUserForm(f => ({...f, email: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>Telephone Number
                            </label>
                            <input name="CH_phone" type="text" value={editUserForm.phone} onChange={e => setEditUserForm(f => ({...f, phone: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">account_circle</span>Role
                            </label>
                            <select name="CH_usersRole" value={editUserForm.usersRole} onChange={e => setEditUserForm(f => ({...f, usersRole: e.target.value}))}>
                                <option>Architect</option>
                                <option>Engineer</option>
                                <option>Developer</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">vpn_key</span>Access rights
                            </label>
                            <select name="CH_access" value={editUserForm.access} onChange={e => setEditUserForm(f => ({...f, access: e.target.value}))}>
                                <option>Administrator</option>
                                <option>Editor</option>
                                <option>Guest</option>
                            </select>
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">business</span>Company
                            </label>
                            <select name="CH_company" value={editUserForm.company} onChange={e => setEditUserForm(f => ({...f, company: e.target.value}))}>
                                <option value="">Select company</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.name}>{company.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button type="button" className="cancelButton" onClick={() => setOpenModal(null)}>Cancel</button>
                        <button type="submit" className="acceptButton" id="UserChangeAcceptButton">Accept</button>
                    </div>
                </form>
            </dialog>
            <dialog id="newCompanyModal" ref={newCompanyModalRef}>
                <form className="userForm" id="newCompanyForm" onSubmit={handleNewCompanySubmit}>
                    <h2>New Company</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Company Name
                            </label>
                            <input type="text" name="name" value={newCompanyForm.name} onChange={handleCompanyInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Company Address
                            </label>
                            <input type="text" name="address" value={newCompanyForm.address} onChange={handleCompanyInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>Contact Email
                            </label>
                            <input type="text" name="email" value={newCompanyForm.email} onChange={handleCompanyInputChange} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>Telephone Number
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
                            Cancel
                        </button>
                        <button type="submit" className="acceptButton">
                            Accept
                        </button>
                    </div>
                </form>
            </dialog>
            <dialog id="ChangeCompanyModal" ref={changeCompanyModalRef}>
                <form className="userForm" id="editCompanyForm" onSubmit={handleEditCompanySubmit}>
                    <h2>Edit Company</h2>
                    <div className="userCard">
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Company Name
                            </label>
                            <input type="text" name="name" value={editCompanyForm.name} onChange={e => setEditCompanyForm(f => ({...f, name: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">subject</span>Company Address
                            </label>
                            <input type="text" name="address" value={editCompanyForm.address} onChange={e => setEditCompanyForm(f => ({...f, address: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">email</span>Contact Email
                            </label>
                            <input type="text" name="email" value={editCompanyForm.email} onChange={e => setEditCompanyForm(f => ({...f, email: e.target.value}))} />
                        </div>
                        <div className="formFieldContainer">
                            <label>
                                <span className="material-icons-round">call</span>Telephone Number
                            </label>
                            <input type="tel" name="phone" value={editCompanyForm.phone} onChange={e => setEditCompanyForm(f => ({...f, phone: e.target.value}))} />
                        </div>
                    </div>
                    <div className="cancelAccept">
                        <button type="button" className="cancelButton" onClick={() => setOpenModal(null)}>Cancel</button>
                        <button type="submit" className="acceptButton">Accept</button>
                    </div>
                </form>
            </dialog>
            <dialog id="DeleteUserModal">
              <form className="userForm" id="DeleteUserForm">
                <h2>Are you sure you want to delete the user {userToDelete?.name}?</h2>
                <div className="cancelAccept">
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={() => { setUserToDelete(null); const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null; if (modal) modal.close(); }}>
                    Cancel
                  </button>
                  <button type="button" className="acceptButton" id="ConfirmDeleteUserButton" onClick={handleConfirmDeleteUser}>Delete</button>
                </div>
              </form>
            </dialog>
            <dialog id="DeleteCompanyModal">
              <form className="userForm" id="DeleteCompanyForm">
                <h2>Are you sure you want to delete the company {companyToDelete?.name}?</h2>
                <div className="cancelAccept">
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={() => { setCompanyToDelete(null); const modal = document.getElementById('DeleteCompanyModal') as HTMLDialogElement | null; if (modal) modal.close(); }}>
                    Cancel
                  </button>
                  <button type="button" className="acceptButton" id="ConfirmDeleteCompanyButton" onClick={handleConfirmDeleteCompany}>Delete</button>
                </div>
              </form>
            </dialog>
            <header>
              <h2>{activeTab === 'users' ? 'Users' : 'Companies'}</h2>
              <div style={{ display: 'flex', flexDirection: 'row', columnGap: 10 }}>
                <button
                  className={activeTab === 'users' ? 'buttonTertiary active' : 'buttonTertiary'}
                  onClick={() => setActiveTab('users')}
                  style={{ fontWeight: activeTab === 'users' ? 'bold' : 'normal' }}
                >
                  Users
                </button>
                <button
                  className={activeTab === 'companies' ? 'buttonTertiary active' : 'buttonTertiary'}
                  onClick={() => setActiveTab('companies')}
                  style={{ fontWeight: activeTab === 'companies' ? 'bold' : 'normal' }}
                >
                  Companies
                </button>
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
            <div style={{ display: 'flex', flexDirection: 'row', fontSize: 'var(--fontSizeStandard)', height: 40, columnGap: 100, paddingLeft: 30 }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <label style={{ paddingLeft: 10 }}>Total number of {activeTab === 'users' ? 'Users' : 'Companies'}:</label>
                <label style={{ paddingLeft: 15 }} id="userCount">
                  {activeTab === 'users' ? users.length : companies.length}
                </label>
              </div>
            </div>
            {activeTab === 'users' && (
              <div
                  style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                      paddingLeft: 30,
                      paddingRight: 30,
                      paddingTop: 30,
                      columnGap: 20,
                      alignItems: "center"
                  }}
              >
                  <label style={{ paddingLeft: 10 }}>User name</label>
                  <label>Access</label>
                  <label>Role</label>
                  <label>Company</label>
                  <label>Last active</label>
                  <label style={{ justifySelf: "end" }}>Edit</label>
              </div>
            )}
            <div></div>
            <div>
                {activeTab === 'users' && (
                  <div
                      id="usersList"
                      className="usersList"
                      style={{ display: 'flex', flexDirection: 'column', rowGap: 10, paddingLeft: 30, paddingRight: 30 }}
                  >
                      {users.map((user, idx) => (
                          <div
                              key={idx}
                              className="userCard"
                              style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center', background: '#222', padding: 10, borderRadius: 8, cursor: 'pointer' }}
                              onClick={() => user.id && window.openEditUserModal && window.openEditUserModal(user.id as string)}
                          >
                              <span className="material-icons-round">person</span>
                              <span>{user.name} {user.surname}</span>
                              <span>{user.access}</span>
                              <span>{user.role}</span>
                              <span>{user.company}</span>
                              <span>{user.email}</span>
                              <span>{user.phone}</span>
                              <button
                                  className="buttonTertiary"
                                  style={{marginLeft: 8, background: '#FC3140', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                  title="Delete user"
                                  onClick={e => {
                                      e.stopPropagation();
                                      setUserToDelete({ id: user.id as string, name: `${user.name} ${user.surname}` });
                                      const modal = document.getElementById('DeleteUserModal') as HTMLDialogElement | null;
                                      if (modal) modal.showModal();
                                  }}
                              >
                                  <span className="material-icons-round" style={{fontSize: 18}}>close</span>
                              </button>
                          </div>
                      ))}
                  </div>
                )}
                {activeTab === 'companies' && (
                  <div
                      id="companiesList"
                      className="usersList"
                      style={{ display: 'flex', flexDirection: 'column', rowGap: 10, paddingLeft: 30, paddingRight: 30 }}
                  >
                    {companies.map((company, idx) => (
                      <div
                        key={company.id}
                        className="userCard"
                        style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center', background: '#222', padding: 10, borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => openEditCompanyModal(company.id)}
                      >
                        <span className="material-icons-round">business</span>
                        <span>{company.name}</span>
                        <span>{company.address}</span>
                        <span>{company.email}</span>
                        <span>{company.phone}</span>
                        <button
                          className="buttonTertiary"
                          style={{marginLeft: 8, background: '#FC3140', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                          title="Delete company"
                          onClick={e => {
                              e.stopPropagation();
                              setCompanyToDelete({ id: company.id, name: company.name });
                              const modal = document.getElementById('DeleteCompanyModal') as HTMLDialogElement | null;
                              if (modal) modal.showModal();
                          }}
                        >
                          <span className="material-icons-round" style={{fontSize: 18}}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>
    );
}