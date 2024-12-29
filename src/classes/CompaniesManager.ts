import { ICompany, Company } from "./Companies"

export class CompanyManager {
    list: Company[] = []
    ui: HTMLElement

    constructor(container: HTMLElement) {
        this.ui = container
    }

    newCompany(data: ICompany) {
        const company = new Company(data)
        this.ui.append(company.ui)
        this.list.push(company)
        return company
    }
}