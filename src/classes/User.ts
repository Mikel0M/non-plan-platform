import { v4 as uuidv4 } from 'uuid';
import { openChangeUserModal } from "../index";

export type usersRole = "Architect" | "Engineer" | "Developer";
export type access = "Administrator" | "Editor" | "Guest";

export interface IUser {
    id?: string;
    icon: string;
    color: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    role: usersRole;
    access: access;
    company: string;
}

// Function to generate random color
function getRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Function to slice the first two characters of each word
function sliceTwoEachWord(input: string): string {
    const words = input.trim().split(" ").filter(word => word !== "");
    
    if (words.length === 0) {
        return ""; 
    } else if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }
    
    const firstTwoWords = words.slice(0, 2); 
    const result = firstTwoWords.map(word => word.slice(0, 1).toUpperCase());
    
    return result.join("");
}

export class User implements IUser {
    // To satisfy IUser
    name: string;
    surname: string;
    icon: string;
    color: string;
    email: string;
    phone: string;
    role: usersRole;
    access: access;
    company: string;
    id: string;

    // Class internals
    ui: HTMLDivElement;

    constructor(data: IUser) {
        // Allow existing id, otherwise generate a new one
        this.id = data.id || uuidv4();

        // User data definition
        this.name = data.name;
        this.surname = data.surname;
        this.email = data.email;
        this.phone = data.phone;
        this.role = data.role;
        this.access = data.access;
        this.company = data.company;

        // Generate icon and random color
        this.icon = sliceTwoEachWord(this.name);
        this.color = getRandomColor();
        console.log("testing colors");
        console.log(this.icon);
        console.log(this.color);

        this.setUI();
    }

    updateUI() {
        if (!this.ui) {
            console.warn(`UI not found for user: ${this.name}`);
            return;
        }
    
        const header = this.ui.querySelector(".cardHeader");
        if (header) {
            const icon = header.querySelector("p");
            if (icon) icon.style.backgroundColor = this.color;
    
            const name = header.querySelector("h5");
            if (name) name.textContent = this.name;
    
            const surname = header.querySelector("p + div p");
            if (surname) surname.textContent = this.surname;

            const email = header.querySelector("p + div p");
            if (email) email.textContent = this.email;
        }
    
        // Correct selectors for each property
        const statusElement = this.ui.querySelector(".cardProperty:nth-child(1) p:nth-child(2)");
        if (statusElement) statusElement.textContent = this.access;
    
        const userAccess = this.ui.querySelector(".cardProperty:nth-child(2) p:nth-child(2)");
        if (userAccess) userAccess.textContent = this.role;
    
        const userCompany = this.ui.querySelector(".cardProperty:nth-child(3) p:nth-child(2)");
        if (userCompany) userCompany.textContent = `${this.company}$`;

    }

    setUI() {
        if (this.ui) { return; }
        this.ui = document.createElement("div");
        this.ui.className = "userCard";
        this.ui.innerHTML = `
            <!-- User Card -->
            <div class="userCard" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr; column-gap: 20px; align-items: center; padding: 10px;">
                <!-- User Info -->
                <div style="display: flex; column-gap: 10px; align-items: center;">
                    <p style="font-size: 20px; display: flex; align-items: center; background-color: ${this.color}; padding: 10px; width: 40px; height: 40px; justify-content: center; border-radius: 8px; aspect-ratio: 1;">
                        ${this.icon}
                    </p>
                    <div>
                        <h5 class="fullName">${this.name} ${this.surname}</h5>
                        <p>${this.email}</p>
                    </div>
                </div>
                
                <!-- Card Properties -->
                <div class="userCardProperty"><p>${this.access}</p></div>
                <div class="userCardProperty"><p>${this.role}</p></div>
                <div class="userCardProperty"><p>${this.company}</p></div>
                <div class="userCardProperty"><p>2024-12-01</p></div>
                <button class="buttonTertiary" style="height: 40px;width: 40px;display: flex;justify-self: end;"><span class="material-icons-round">email</span></button>
                <button class="buttonTertiary changeUserButton" id="changeUserButton-${this.id}" style="height: 40px;width: 40px;display: flex;justify-self: end;"><span class="material-icons-round">edit</span></button>
            </div>
        `;

        // Attach event listener to the changeUserButton
        const changeUserButton = this.ui.querySelector(`#changeUserButton-${this.id}`);
        if (changeUserButton) {
            console.log(`Attaching event listener to button with id: changeUserButton-${this.id}`);
            changeUserButton.addEventListener("click", () => {
                console.log(`Button clicked for user: ${this.id}`);
                openChangeUserModal(this.id); // Pass the user's id to the modal
            });
        } else {
            console.warn(`Button with id changeUserButton-${this.id} not found`);
        }
    }

    deleteUI() {
        if (this.ui && this.ui.parentElement) {
            console.log(`Deleting UI for user: ${this.name} ${this.surname}`);
            this.ui.parentElement.removeChild(this.ui); // Remove the UI element from the DOM
        } else {
            console.warn(`UI not found for user: ${this.name} ${this.surname}`);
        }
    }

    updateUserCards(user: User) {
        const projectsPage = document.getElementById("projectsPage");
        if (!projectsPage) return;

        const setText = (selector: string, value: string | number) => {
            const element = projectsPage.querySelector(`[data-user-info='${selector}']`);
            if (element) element.textContent = value.toString();
        };

        setText("iconUD", user.icon);
        setText("nameUD", user.name);
        setText("surnameUD", user.surname);
        setText("emailUD", user.email);
        setText("phoneUD", user.phone);
        setText("roleUD", user.role);
        setText("accessUD", user.access);
        setText("companyUD", user.company);

        const setInputValue = (id: string, value: string | number) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) input.value = value.toString();
        };

        setInputValue("userNameInput", user.name);
        setInputValue("userSurnameInput", user.surname);
        setInputValue("userEmailInput", user.email);
        setInputValue("userPhoneInput", user.phone);
        setInputValue("userRoleInput", user.role);
        setInputValue("userAccessInput", user.access);
        setInputValue("userCompanyInput", user.company);

        const iconElement = document.getElementById("iconUD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = user.color;
        }
    }

    updateUserUI(user: User) {
        const detailsPage = document.getElementById("userDetails");
        if (!detailsPage) {
            console.warn("Details page not found");
            return;
        }

        const setText = (selector: string, value: string | number) => {
            const element = detailsPage.querySelector(`[data-user-info='${selector}']`);
            if (element) {
                element.textContent = value.toString();
                console.log(`Updated ${selector} to:`, value);
            } else {
                console.warn(`Element with selector [data-user-info='${selector}'] not found`);
            }
        };

        setText("iconUD", user.icon);
        setText("nameUD", user.name);
        setText("surnameUD", user.surname);
        setText("emailUD", user.email);
        setText("phoneUD", user.phone);
        setText("roleUD", user.role);
        setText("accessUD", user.access);
        setText("companyUD", user.company);

        const iconElement = document.getElementById("iconUD");
        if (iconElement) {
            (iconElement as HTMLElement).style.backgroundColor = user.color;
            console.log("Updated icon background color to:", user.color);
        } else {
            console.warn("Icon element not found");
        }
    }
}

