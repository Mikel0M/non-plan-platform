import { IUser, User, usersRole, access } from "./User";

export let users: User[] = []; // Global users array

export class UsersManager {
    list: User[] = [];
    currentUser: User | null = null; // Add currentUser as a property of the class

    constructor() {
    }

    newUser(data: IUser) {
        const user = new User(data);
        this.list.push(user);
        users.push(user);
        console.log("New user added:", user); // Debugging statement
        console.log("Current users list:", users); // Debugging statement
        return user;
    }

    getUsers(): User[] {
        return users;
    }

    updateUserData(userId: string) {
        const user = users.find(u => u.id === userId);
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return;
        }

        // Get the form fields in the ChangeUserModal
        const nameInput = document.querySelector<HTMLInputElement>("input[name='CH_name']");
        const surnameInput = document.querySelector<HTMLInputElement>("input[name='CH_surname']");
        const emailInput = document.querySelector<HTMLInputElement>("input[name='CH_email']");
        const phoneInput = document.querySelector<HTMLInputElement>("input[name='CH_phone']");
        const roleSelect = document.querySelector<HTMLSelectElement>("select[name='CH_usersRole']");
        const accessSelect = document.querySelector<HTMLSelectElement>("select[name='CH_access']");
        const companyInput = document.querySelector<HTMLInputElement>("input[name='CH_company']");

        // Update the user's data
        if (nameInput) user.name = nameInput.value;
        if (surnameInput) user.surname = surnameInput.value;
        if (emailInput) user.email = emailInput.value;
        if (phoneInput) user.phone = phoneInput.value;
        if (roleSelect) user.role = roleSelect.value as usersRole; // Cast to usersRole
        if (accessSelect) user.access = accessSelect.value as access; // Cast to access
        if (companyInput) user.company = companyInput.value;

        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) {
                input.value = value.toString();
            } else {
                console.warn(`Input with ID '${id}' not found`);
            }
        };

        // Update user details in the form fields
        setInputValue("userNameInput", user.name);
        setInputValue("userSurnameInput", user.surname);
        setInputValue("userEmailInput", user.email);
        setInputValue("userPhoneInput", user.phone);
        setInputValue("userRoleInput", user.role);
        setInputValue("userAccessInput", user.access);
        setInputValue("userCompanyInput", user.company);

        console.log(`User data updated for user ID ${userId}:`, user);
    }

    updateUsersCards(user: User) {
        const userDetailsPage = document.getElementById("userDetails");
        if (!userDetailsPage) {
            console.warn("User details page not found");
            return;
        }

        // Helper function to set text content for elements
        const setText = (selector: string, value: string | number) => {
            const element = userDetailsPage.querySelector(`[data-user-info='${selector}']`);
            if (element) {
                element.textContent = value.toString();
            } else {
                console.warn(`Element with selector [data-user-info='${selector}'] not found`);
            }
        };

        // Update user details in the UI
        setText("iconUD", user.icon);
        setText("nameUD", user.name);
        setText("surnameUD", user.surname);
        setText("emailUD", user.email);
        setText("phoneUD", user.phone);
        setText("roleUD", user.role);
        setText("accessUD", user.access);
        setText("companyUD", user.company);

        // Helper function to set input values for form fields
        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) {
                input.value = value.toString();
            } else {
                console.warn(`Input with ID '${id}' not found`);
            }
        };

        // Update user details in the form fields
        setInputValue("userNameInput", user.name);
        setInputValue("userSurnameInput", user.surname);
        setInputValue("userEmailInput", user.email);
        setInputValue("userPhoneInput", user.phone);
        setInputValue("userRoleInput", user.role);
        setInputValue("userAccessInput", user.access);
        setInputValue("userCompanyInput", user.company);

        // Update the icon's background color
        const iconElement = document.getElementById("iconUD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = user.color;
        } else {
            console.warn("Icon element not found");
        }

        console.log(`User details updated for user ID ${user.id}`);
    }

    setUserChangeButton() {
        console.log("Setting up change button for user edit modal");
        const saveButton = document.getElementById("UserChangeAcceptButton") as HTMLButtonElement;
        if (saveButton) {
            saveButton.addEventListener("click", (event) => {
                event.preventDefault();
                console.log("Save button clicked for user edit modal");
                console.log("This is the current user:", this.currentUser);

                if (this.currentUser) {
                    this.updateUserData(this.currentUser.id); // Update user data
                    this.updateUsersCards(this.currentUser); // Update the user's card in the UI
                    this.refreshToDoList(); // Refresh the To-Do user list
                    const modal = document.getElementById("ChangeUserModal") as HTMLDialogElement;
                    if (modal) {
                        modal.close();
                    }
                } else {
                    console.warn("No user selected for editing.");
                }
            });
        }
    }

    refreshToDoList() {
        const toDoList = document.getElementById("toDoUserList");
        if (!toDoList) {
            console.warn("To-Do user list container not found");
            return;
        }

        // Clear the existing list
        toDoList.innerHTML = "";

        // Populate the list with updated user data
        users.forEach(user => {
            const option = document.createElement("option");
            option.value = user.id;
            option.textContent = `${user.name} ${user.surname}`;
            toDoList.appendChild(option);
        });

        console.log("To-Do user list refreshed");
    }

    /**
     * Update a user by id with new data (React-friendly, no DOM)
     */
    editUser(data: IUser) {
        const user = users.find(u => u.id === data.id);
        if (user) {
            user.name = data.name;
            user.surname = data.surname;
            user.email = data.email;
            user.phone = data.phone;
            user.role = data.role;
            user.access = data.access;
            user.company = data.company;
            // Optionally update icon/color if needed
            // user.icon = data.icon;
            // user.color = data.color;
        }
        const user2 = this.list.find(u => u.id === data.id);
        if (user2) {
            user2.name = data.name;
            user2.surname = data.surname;
            user2.email = data.email;
            user2.phone = data.phone;
            user2.role = data.role;
            user2.access = data.access;
            user2.company = data.company;
        }
    }

    /**
     * Delete a user by id from the users and list arrays
     */
    deleteUser(userId: string) {
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) users.splice(idx, 1);
        const idx2 = this.list.findIndex(u => u.id === userId);
        if (idx2 !== -1) this.list.splice(idx2, 1);
    }
}

// Create and export an instance of UsersManager
export const usersManagerInstance = new UsersManager();