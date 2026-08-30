export interface Branch {
  id: string;
  gymId: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
  };
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  branches?: Branch[];
  _count?: {
    users: number;
    branches: number;
  };
}
