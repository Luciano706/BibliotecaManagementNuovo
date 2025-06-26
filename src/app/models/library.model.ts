export interface Library {
  id: number;
  name: string;
  address: string;
  manager_id?: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies?: number;
  available_in_libraries?: number;
  copies?: number;
}

export interface LibraryBook extends Book {
  copies: number;
}
