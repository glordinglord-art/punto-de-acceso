export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  invitationCode: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'trainer' | 'client';
  };
}

export interface InvitationCode {
  id: string;
  code: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}
