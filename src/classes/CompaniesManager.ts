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

  /**
   * Update a company by id with new data (React-friendly)
   */
  editCompany(data: ICompany) {
    const company = this.companies.find(c => c.id === data.id);
    if (company) {
      company.name = data.name;
      company.backgroundColor = data.backgroundColor;
      company.bankAccount = data.bankAccount;
      company.billingAddress = data.billingAddress;
      company.createdAt = data.createdAt;
      company.email = data.email;
      company.features = data.features;
      company.phone = data.phone;
      company.primaryColor = data.primaryColor;
      company.settings = data.settings;
      company.subscription = data.subscription;
    }
  }

  importCompanies(companies: ICompany[]) {
    this.companies = companies.map(c => new Company(c));
  }

  exportCompanies(): ICompany[] {
    return this.companies.map(c => c.toJSON());
  }
}

export const companiesManagerInstance = new CompaniesManager();