import { ICompany, Company } from "./Company";

export class CompaniesManager {
  companies: Company[] = [];
  private hasLoadedFromFirebase = false; // Track if companies have been loaded
  private isLoading = false; // Prevent multiple simultaneous loads

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

  // Add method to ensure companies are loaded once at app startup
  async ensureCompaniesLoaded(): Promise<void> {
    if (this.hasLoadedFromFirebase || this.isLoading) {
      return;
    }
    
    try {
      this.isLoading = true;
      console.log('[CompaniesManager] Loading companies from Firebase at app startup...');
      
      const { getCollection } = await import("../firebase/index");
      const companiesCollection = getCollection<ICompany>("/companies");
      const { getDocs } = await import("firebase/firestore");
      
      const firebaseCompanies = await getDocs(companiesCollection);
      console.log(`[CompaniesManager] Found ${firebaseCompanies.docs.length} companies in Firebase`);
      
      // Clear existing companies
      this.companies = [];
      
      for (const doc of firebaseCompanies.docs) {
        const data = doc.data();
        
        // Convert Firestore timestamps
        const convertTimestampToDate = (timestamp: any): string | Date | undefined => {
          if (timestamp && timestamp.toDate) {
            return timestamp.toDate();
          }
          return timestamp || undefined;
        };
        
        const companyData: ICompany = {
          id: doc.id,
          backgroundColor: data.backgroundColor || "#FFFFFF",
          bankAccount: data.bankAccount || "",
          billingAddress: data.billingAddress || {
            city: "",
            country: "",
            state: "",
            street: "",
            zipCode: ""
          },
          createdAt: convertTimestampToDate(data.createdAt),
          email: data.email || "",
          features: data.features || [],
          name: data.name || "Untitled Company",
          phone: data.phone || "",
          primaryColor: data.primaryColor || "#3F51B5",
          settings: data.settings || {
            allowExternalCollaboration: false,
            allowUserInvites: true,
            customRoles: [],
            defaultProjectRole: "contributor",
            defaultUserPermissions: "create_projects",
            language: "english",
            requireInviteApproval: true,
            timezone: "europe"
          },
          subscription: data.subscription || {
            isActive: true,
            maxProjects: 5,
            maxUsers: 5,
            plan: "free",
            planExpiresAt: convertTimestampToDate(data.subscription?.planExpiresAt) || new Date()
          }
        };
        
        const company = new Company(companyData);
        this.companies.push(company);
      }
      
      this.hasLoadedFromFirebase = true;
      console.log(`[CompaniesManager] Companies loaded successfully at app startup. Total: ${this.companies.length}`);
      
    } catch (error) {
      console.error("[CompaniesManager] Failed to load companies at app startup:", error);
    } finally {
      this.isLoading = false;
    }
  }

  // Manual refresh method - force reload companies from Firebase
  async refreshCompaniesFromFirebase(): Promise<void> {
    try {
      this.isLoading = true;
      this.hasLoadedFromFirebase = false; // Reset flag to force reload
      console.log('[CompaniesManager] Manually refreshing companies from Firebase...');
      
      const { getCollection } = await import("../firebase/index");
      const companiesCollection = getCollection<ICompany>("/companies");
      const { getDocs } = await import("firebase/firestore");
      
      const firebaseCompanies = await getDocs(companiesCollection);
      console.log(`[CompaniesManager] Found ${firebaseCompanies.docs.length} companies in Firebase (refresh)`);
      
      // Clear existing companies
      this.companies = [];
      
      for (const doc of firebaseCompanies.docs) {
        const data = doc.data();
        
        // Convert Firestore timestamps
        const convertTimestampToDate = (timestamp: any): string | Date | undefined => {
          if (timestamp && timestamp.toDate) {
            return timestamp.toDate();
          }
          return timestamp || undefined;
        };
        
        const companyData: ICompany = {
          id: doc.id,
          backgroundColor: data.backgroundColor || "#FFFFFF",
          bankAccount: data.bankAccount || "",
          billingAddress: data.billingAddress || {
            city: "",
            country: "",
            state: "",
            street: "",
            zipCode: ""
          },
          createdAt: convertTimestampToDate(data.createdAt),
          email: data.email || "",
          features: data.features || [],
          name: data.name || "Untitled Company",
          phone: data.phone || "",
          primaryColor: data.primaryColor || "#3F51B5",
          settings: data.settings || {
            allowExternalCollaboration: false,
            allowUserInvites: true,
            customRoles: [],
            defaultProjectRole: "contributor",
            defaultUserPermissions: "create_projects",
            language: "english",
            requireInviteApproval: true,
            timezone: "europe"
          },
          subscription: data.subscription || {
            isActive: true,
            maxProjects: 5,
            maxUsers: 5,
            plan: "free",
            planExpiresAt: convertTimestampToDate(data.subscription?.planExpiresAt) || new Date()
          }
        };
        
        const company = new Company(companyData);
        this.companies.push(company);
      }
      
      this.hasLoadedFromFirebase = true;
      console.log(`[CompaniesManager] Companies refreshed successfully. Total: ${this.companies.length}`);
      
    } catch (error) {
      console.error("[CompaniesManager] Failed to refresh companies from Firebase:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Check if companies have been loaded
  isCompaniesLoaded(): boolean {
    return this.hasLoadedFromFirebase;
  }
}

export const companiesManagerInstance = new CompaniesManager();