import { v4 as uuidv4 } from 'uuid';

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
            </div>
        `;
    }
}