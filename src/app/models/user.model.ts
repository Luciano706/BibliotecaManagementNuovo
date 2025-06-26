export interface User {
  id: number;
  username: string;
  email: string;
  role: 'member' | 'librarian' | 'admin';
  password?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: 'member' | 'librarian' | 'admin';
  library_id?: number;
}

export interface ApiResponse<T> {
  status: string;
  code?: string;
  message: string;
  data?: T;
}
