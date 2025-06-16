import { v4 as uuidv4 } from 'uuid';import { UsersManager, usersManagerInstance } from "./UsersManager";

const usersListUI = document.getElementById("usersList") as HTMLElement;

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

        const fullNameElement = this.ui.querySelector(".fullName");
        if (fullNameElement) fullNameElement.textContent = `${this.name} ${this.surname}`;

        const emailElement = this.ui.querySelector(".userCardProperty:nth-child(2) p");
        if (emailElement) emailElement.textContent = this.email;

        const roleElement = this.ui.querySelector(".userCardProperty:nth-child(3) p");
        if (roleElement) roleElement.textContent = this.role;

        const accessElement = this.ui.querySelector(".userCardProperty:nth-child(4) p");
        if (accessElement) accessElement.textContent = this.access;

        const companyElement = this.ui.querySelector(".userCardProperty:nth-child(5) p");
        if (companyElement) companyElement.textContent = this.company;

        console.log(`UI updated for user: ${this.name}`);

        // Update ToDo fields
        this.updateToDoFields();
    }

    setUI() {
        if (this.ui) return; // Prevent creating duplicate UI

        this.ui = document.createElement("div");
        this.ui.className = "userCard";
        this.ui.innerHTML = `
            <div class="userCard" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr; column-gap: 20px; align-items: center; padding: 10px;">
                <div style="display: flex; column-gap: 10px; align-items: center;">
                    <p style="font-size: 20px; display: flex; align-items: center; background-color: ${this.color}; padding: 10px; width: 40px; height: 40px; justify-content: center; border-radius: 8px; aspect-ratio: 1;">
                        ${this.icon}
                    </p>
                    <div>
                        <h5 class="fullName">${this.name} ${this.surname}</h5>
                        <p>${this.email}</p>
                    </div>
                </div>
                <div class="userCardProperty"><p>${this.access}</p></div>
                <div class="userCardProperty"><p>${this.role}</p></div>
                <div class="userCardProperty"><p>${this.company}</p></div>
                <div class="userCardProperty"><p>2024-12-01</p></div>
                <button class="buttonTertiary changeUserButton" id="changeUserButton-${this.id}" style="height: 40px;width: 40px;display: flex;justify-self: end;">
                    <span class="material-icons-round">edit</span>
                </button>
            </div>
        `;

        // Add event listener to the "Edit" button
        const editButton = this.ui.querySelector(`#changeUserButton-${this.id}`);
        if (editButton) {
            editButton.addEventListener("click", () => {
                console.log(`Edit button clicked for user: ${this.name}`);
                usersManagerInstance.currentUser = this; // Set the current user

                const modal = document.getElementById("ChangeUserModal") as HTMLDialogElement;
                if (modal) {
                    modal.dataset.userId = this.id; // Store the user ID in the modal

                    // Populate the form fields with the user's data
                    const nameInput = document.querySelector<HTMLInputElement>("input[name='CH_name']");
                    const surnameInput = document.querySelector<HTMLInputElement>("input[name='CH_surname']");
                    const emailInput = document.querySelector<HTMLInputElement>("input[name='CH_email']");
                    const phoneInput = document.querySelector<HTMLInputElement>("input[name='CH_phone']");
                    const roleSelect = document.querySelector<HTMLSelectElement>("select[name='CH_usersRole']");
                    const accessSelect = document.querySelector<HTMLSelectElement>("select[name='CH_access']");
                    const companyInput = document.querySelector<HTMLInputElement>("input[name='CH_company']");

                    if (nameInput) nameInput.value = this.name;
                    if (surnameInput) surnameInput.value = this.surname;
                    if (emailInput) emailInput.value = this.email;
                    if (phoneInput) phoneInput.value = this.phone;
                    if (roleSelect) roleSelect.value = this.role;
                    if (accessSelect) accessSelect.value = this.access;
                    if (companyInput) companyInput.value = this.company;

                    modal.showModal(); // Open the modal
                }
            });
        }
    }

    deleteUI() {
        if (this.ui && this.ui.parentElement) {
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

    updateToDoFields() {
        // Update "responsible person" fields
        const responsiblePersonElements = document.querySelectorAll(`[data-responsible-id='${this.id}']`);
        responsiblePersonElements.forEach(element => {
            element.textContent = `${this.name} ${this.surname}`;
            console.log(`Updated responsible person to: ${this.name} ${this.surname}`);
        });

        // Update "created by" fields
        const createdByElements = document.querySelectorAll(`[data-created-by-id='${this.id}']`);
        createdByElements.forEach(element => {
            element.textContent = `${this.name} ${this.surname}`;
            console.log(`Updated created by to: ${this.name} ${this.surname}`);
        });
    }
}

