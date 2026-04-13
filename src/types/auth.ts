export interface UserPayload {
  id: string;
  email: string;
  fullName: string; 
  role: string;
  iat?: number;
  exp?: number;
}
