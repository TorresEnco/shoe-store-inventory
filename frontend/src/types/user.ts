export interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  role: 'ADMIN' | 'CASHIER';
}
