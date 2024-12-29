import { IUser, User } from "./User"

export class UsersManager {
    list: User[] = []
    ui: HTMLElement

    constructor(container: HTMLElement) {
        this.ui = container
    }

    newUser(data: IUser) {
        const user = new User(data)
        this.ui.append(user.ui)
        this.list.push(user)
        return user
    }
}