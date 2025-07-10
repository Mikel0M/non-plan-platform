export interface ICompany {
  id?: string;
  backgroundColor: string;
  bankAccount?: string;
  billingAddress: {
    city: string;
    country: string;
    state: string;
    street: string;
    zipCode: string;
  };
  createdAt?: string | Date;
  email?: string;
  features?: string[];
  name: string;
  phone?: string;
  primaryColor: string;
  settings?: {
    allowExternalCollaboration?: boolean;
    allowUserInvites?: boolean;
    customRoles?: string[];
    defaultProjectRole: string;
    defaultUserPermissions: string;
    language: string;
    requireInviteApproval?: boolean;
    timezone: string;
  };
  subscription?: {
    isActive: boolean;
    maxProjects: number;
    maxUsers: number;
    plan: string;
    planExpiresAt: string | Date;
  };
}

export class Company implements ICompany {
  id?: string;
  backgroundColor: string;
  bankAccount?: string;
  billingAddress: {
    city: string;
    country: string;
    state: string;
    street: string;
    zipCode: string;
  };
  createdAt?: string | Date;
  email?: string;
  features?: string[];
  name: string;
  phone?: string;
  primaryColor: string;
  settings?: {
    allowExternalCollaboration?: boolean;
    allowUserInvites?: boolean;
    customRoles?: string[];
    defaultProjectRole: string;
    defaultUserPermissions: string;
    language: string;
    requireInviteApproval?: boolean;
    timezone: string;
  };
  subscription?: {
    isActive: boolean;
    maxProjects: number;
    maxUsers: number;
    plan: string;
    planExpiresAt: string | Date;
  };

  constructor(data: ICompany) {
    this.id = data.id || Math.random().toString(36).slice(2);
    this.backgroundColor = data.backgroundColor;
    this.bankAccount = data.bankAccount;
    this.billingAddress = data.billingAddress;
    this.createdAt = data.createdAt;
    this.email = data.email;
    this.features = data.features;
    this.name = data.name;
    this.phone = data.phone;
    this.primaryColor = data.primaryColor;
    this.settings = data.settings;
    this.subscription = data.subscription;
  }

  // Convert to JSON for serialization
  toJSON(): ICompany {
    return {
      id: this.id,
      backgroundColor: this.backgroundColor,
      bankAccount: this.bankAccount,
      billingAddress: this.billingAddress,
      createdAt: this.createdAt,
      email: this.email,
      features: this.features,
      name: this.name,
      phone: this.phone,
      primaryColor: this.primaryColor,
      settings: this.settings,
      subscription: this.subscription
    };
  }
}
