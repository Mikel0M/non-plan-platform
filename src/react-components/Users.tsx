import * as React from 'react';
import * as Router from 'react-router-dom';
import { IUser, User, usersRole, access } from "../classes/User";
import { UsersManager } from '../classes/UsersManager';

export function Users() {
    <div className="page" id="usersPage" style={{ display: "none" }}>
  <dialog id="newUserModal">
    <form className="userForm" id="newUserForm">
      <h2>New User</h2>
      <div className="userCard">
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Name
          </label>
          <input name="name" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Surname
          </label>
          <input name="surname" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">email</span>Email Address
          </label>
          <input name="email" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">call</span>Telephone Number
          </label>
          <input name="phone" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">account_circle</span>Role
          </label>
          <select name="usersRole">
            <option>Architect</option>
            <option>Engineer</option>
            <option>Developer</option>
          </select>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">vpn_key</span>Access rights
          </label>
          <select name="access">
            <option>Administrator</option>
            <option>Editor</option>
            <option>Guest</option>
          </select>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">business</span>Company Name
          </label>
          <input name="company" type="text" />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => (document.getElementById('newUserModal') as HTMLDialogElement)?.close()}
        >
          Cancel
        </button>
        <button type="submit" className="acceptButton" id="UserCreateButton">
          Accept
        </button>
      </div>
    </form>
  </dialog>
  <dialog id="ChangeUserModal">
    <form className="userForm" id="newUserForm">
      <h2>Change User</h2>
      <div className="userCard">
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Name
          </label>
          <input name="CH_name" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Surname
          </label>
          <input name="CH_surname" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">email</span>Email Address
          </label>
          <input name="CH_email" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">call</span>Telephone Number
          </label>
          <input name="CH_phone" type="text" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">account_circle</span>Role
          </label>
          <select name="CH_usersRole">
            <option>Architect</option>
            <option>Engineer</option>
            <option>Developer</option>
          </select>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">vpn_key</span>Access rights
          </label>
          <select name="CH_access">
            <option>Administrator</option>
            <option>Editor</option>
            <option>Guest</option>
          </select>
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">business</span>Company Name
          </label>
          <input name="CH_company" type="text" />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => (document.getElementById('ChangeUserModal') as HTMLDialogElement)?.close()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="acceptButton"
          id="UserChangeAcceptButton"
        >
          Accept
        </button>
      </div>
    </form>
  </dialog>
  <dialog id="newCompanyModal">
    <form className="userForm" id="newCompanyForm">
      <h2>New Company</h2>
      <div className="userCard">
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Company Name
          </label>
          <input type="text" name="cName" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">subject</span>Company Address
          </label>
          <input type="text" name="cAddress" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">email</span>Contact Email
          </label>
          <input type="text" name="cEmail" />
        </div>
        <div className="formFieldContainer">
          <label>
            <span className="material-icons-round">call</span>Telephone Number
          </label>
          <input type="tel" name="cPhone" />
        </div>
      </div>
      <div className="cancelAccept">
        <button
          type="button"
          className="cancelButton"
          onClick={() => (document.getElementById('newCompanyModal') as HTMLDialogElement)?.close()}
        >
          Cancel
        </button>
        <button type="submit" className="acceptButton">
          Accept
        </button>
      </div>
    </form>
  </dialog>
  <header>
    <h2>Users</h2>
    <div style={{ display: "flex", flexDirection: "row", columnGap: 10 }}>
      <button id="newUserBtn" className="buttonTertiary">
        <span className="material-icons-round">add</span>
        <span className="material-icons-round">person</span>
      </button>
      <button id="newCompanyBtn" className="buttonTertiary">
        <span className="material-icons-round">add</span>
        <span className="material-icons-round">business</span>
      </button>
    </div>
  </header>
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      fontSize: "var(--fontSizeStandard)",
      height: 40,
      columnGap: 100,
      paddingLeft: 30
    }}
  >
    <div style={{ display: "flex", flexDirection: "row" }}>
      <label style={{ paddingLeft: 10 }}>Total number of Users:</label>
      <label style={{ paddingLeft: 15 }} id="userCount">
        3
      </label>
    </div>
    <div
      style={{
        position: "relative",
        display: "flex",
        columnGap: 20,
        alignItems: "start"
      }}
    >
      <span
        className="material-icons-round"
        style={{
          position: "absolute",
          left: 10,
          top: "calc(50% - 12px)",
          fontSize: 24,
          color: "#969696"
        }}
      >
        search
      </span>
      <input
        type="text"
        placeholder="Search"
        style={{
          paddingLeft: 40,
          height: 10,
          width: 200,
          fontSize: "var(--fontSizeStandard)",
          lineHeight: 10
        }}
      />
      <button
        className="buttonSecondary"
        style={{
          width: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <span className="material-icons-round">filter_list</span>
      </button>
    </div>
  </div>
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
  <div></div>
  <div>
    <div
      id="usersList"
      className="usersList"
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: 10,
        paddingLeft: 30,
        paddingRight: 30
      }}
    ></div>
  </div>
</div>


}