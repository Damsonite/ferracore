/**
 * Types relacionados con autenticación
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number;
}

export interface AuthError {
  message: string;
  code?: string;
}
