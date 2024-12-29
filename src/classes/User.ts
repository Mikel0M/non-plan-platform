export type usersRole = "Architect" | "Engineer" | "Developer"
export type access = "Administrator" | "Editor" | "Guest"


export interface IUser {
    name: string
    surname: string
    email: string
    phone: string
    role: usersRole
    access: access
    company: string
}

export class User implements IUser{
    //To satisfy IProject
    name: string
    surname: string
    email: string
    phone: string
    role: "Architect" | "Engineer" | "Developer"
    access: "Administrator" | "Editor" | "Guest"
    company: string

    //Class internals
    ui: HTMLDivElement

    constructor (data: IUser) {
        //Project data definition
        this.name = data.name
        this.surname = data.surname
        this.email = data.email
        this.phone = data.phone
        this.role = data.role
        this.access = data.access
        this.company = data.company
        this.setUI()
    }

    setUI() {
        if (this.ui) {return}
        this.ui = document.createElement("div")
        this.ui.className = "userCard"
        this.ui.innerHTML = `
         <!-- User Card -->
            <div class="userCard" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr; column-gap: 20px; align-items: center; padding: 10px;">
                <!-- User Info -->
                <div style="display: flex; column-gap: 10px; align-items: center;">
                    <p style="font-size: 20px; display: flex; align-items: center; background-color: #6491F9; padding: 2px; border-radius: 8px; width: 35px; height: 35px;justify-content: center;">MM</p>
                    <div>
                        <h5>${this.name} ${this.surname}</h5>
                        <p>${this.email}</p>
                    </div>
                </div>
                
                <!-- Card Properties -->
                <div class="userCardProperty"><p>${this.access}</p></div>
                <div class="userCardProperty"><p>${this.role}</p></div>
                <div class="userCardProperty"><p>${this.company}</p></div>
                <div class="userCardProperty"><p>2024-12-01</p></div>
                <button class = "buttonTertiary" style="height: 40px;width: 40px;display: flex;justify-self: end;"><span class="material-icons-round">email</span></button>

            </div>
        `}
}

//end of file