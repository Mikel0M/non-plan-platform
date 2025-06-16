import { ICompany, Company } from "./Company";

export class CompaniesManager {
  companies: Company[] = [];

  addCompany(data: ICompany) {
    const company = new Company(data);
    this.companies.push(company);
    return company;
  }

  getCompanies() {
    return this.companies;
  }

  deleteCompany(id: string) {
    this.companies = this.companies.filter(c => c.id !== id);
  }

  importCompanies(companies: ICompany[]) {
    this.companies = companies.map(c => new Company(c));
  }

  exportCompanies(): ICompany[] {
    return this.companies.map(c => ({
      id: c.id,
      name: c.name,
      address: c.address,
      email: c.email,
      phone: c.phone,
    }));
  }
}

export const companiesManagerInstance = new CompaniesManager();