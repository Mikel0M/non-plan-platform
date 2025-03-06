

export interface ICompany {
    cName: string
    cAddress: string
    cEmail: string
    cPhone: string
}

export class Company implements ICompany{
    //To satisfy IProject
    cName: string
    cAddress: string
    cEmail: string
    cPhone: string


    //Class internals
    ui: HTMLDivElement

    constructor (data: ICompany) {
        //Project data definition
        this.cName = data.cName
        this.cAddress = data.cAddress
        this.cEmail = data.cEmail
        this.cPhone = data.cPhone
        this.setUI()
    }

    setUI() {
        if (!this.ui) { // Ensure ui is created if null
            this.ui = document.createElement("div");
        }
        this.ui.className = "companyCard";
        this.ui.innerHTML = `
            <div class="userCard" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr; column-gap: 20px; align-items: center; padding: 10px;">
                <div style="display: flex; column-gap: 10px; align-items: center;">
                    <p style="font-size: 20px; display: flex; align-items: center; background-color: #6491F9; padding: 2px; border-radius: 8px; width: 35px; height: 35px; justify-content: center;">MM</p>
                    <div>
                        <h5>${this.cName}</h5>
                    </div>
                </div>
                
                <div class="userCardProperty"><p>${this.cAddress}</p></div>
                <div class="userCardProperty"><p>${this.cEmail}</p></div>
                <div class="userCardProperty"><p>${this.cPhone}</p></div>
                <div class="userCardProperty"><p>2024-12-01</p></div>
                <button class="buttonTertiary" style="height: 40px;width: 40px;display: flex;justify-self: end;">
                    <span class="material-icons-round">email</span>
                </button>
            </div>
        `;
    }
}