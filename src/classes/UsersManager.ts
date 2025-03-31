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
        this.ui.innerHTML = "";
        users.forEach(user => {
            this.ui.append(user.ui);
        });
    }
}

// Create and export an instance of UsersManager
export const usersManagerInstance = new UsersManager(document.getElementById('usersList')!);