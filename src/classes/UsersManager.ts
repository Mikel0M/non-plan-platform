import { IUser, User } from "./User";

export let users: User[] = []; // Global users array

export class UsersManager {
    list: User[] = [];
    ui: HTMLElement;

    constructor(container: HTMLElement) {
        this.ui = container;
    }

    newUser(data: IUser) {
        const user = new User(data);
        this.ui.append(user.ui);
        this.list.push(user);
        users.push(user);
        console.log("New user added:", user); // Debugging statement
        console.log("Current users list:", users); // Debugging statement
        return user;
    }

    getUsers(): User[] {
        return users;
    }

    refreshUsersUI() {
        const usersList = document.getElementById("usersList");
        if (!usersList) {
            console.error("Users list container not found");
            return;
        }
    
        // Clear the existing user list
        usersList.innerHTML = "";
    
        // Regenerate the user list from the global users array
        users.forEach(user => {
            user.setUI(); // Ensure the UI is created
            usersList.appendChild(user.ui); // Append the updated UI to the users list
            console.log("Appended UI for user:", user.name);
        });
    
        console.log("Users UI refreshed");
    }
}

// Create and export an instance of UsersManager
export const usersManagerInstance = new UsersManager(document.getElementById('usersList')!);