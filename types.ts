
export interface UserProfile {
  name: string;
  picture: string;
  email: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}
