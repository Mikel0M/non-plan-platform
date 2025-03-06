import { ICompany, Company } from "./Companies"

export class CompanyManager {
    list: Company[] = []
    ui: HTMLElement

    constructor(container: HTMLElement) {
        this.ui = container
    }

    newCompany(data: ICompany) {
        console.log("newCompany() called!", data); // Debugging log
    
        const company = new Company(data);
        console.log("Company created:", company);
        
        /*
        if (!this.ui) {
            console.error("CompanyManager UI is not set!");
            return null; // Prevent further execution
        }
    
        if (!company.ui) {
            console.error("Company UI is null!");
            return null;
        }
    
        this.ui.append(company.ui);*/
        this.list.push(company);
        console.log("Company added to list. Current list:", this.list);
    
        return company;
    }
}