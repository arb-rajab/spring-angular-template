export type RoleName = 'ROLE_ADMIN' | 'ROLE_USER';

export interface UserSummary {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  roles: RoleName[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  refreshToken: string;
  user: UserSummary;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
