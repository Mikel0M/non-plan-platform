export interface ICompany {
  id?: string;
  name: string;
  address?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}

export class Company implements ICompany {
  id: string;
  name: string;
  address?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;

  constructor(data: ICompany) {
    this.id = data.id || Math.random().toString(36).slice(2);
    this.name = data.name;
    this.address = data.address;
    this.email = data.email;
    this.phone = data.phone;
  }
}
