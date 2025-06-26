export interface Loan {
  id: number;
  user_id: number;
  library_id: number;
  book_id: number;
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  title?: string; 
  library_name?: string; 
  username?: string; 
  days_remaining?: number;
}

export interface Reservation {
  id: number;
  user_id: number;
  library_id: number;
  book_id: number;
  reservation_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired' | 'completed';
  title?: string; 
  library_name?: string; 
  username?: string; 
  days_remaining?: number;
}

export interface CreateLoanRequest {
  user_id: number;
  library_id: number;
  book_id: number;
}

export interface CreateReservationRequest {
  user_id: number;
  library_id: number;
  book_id: number;
}

export interface ReturnBookRequest {
  loan_id: number;
}

export interface UpdateStatusRequest {
  status: 'approved' | 'rejected';
}
