export interface Loan {
  id: number;
  user_id: number;
  library_id: number;
  book_id: number;
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  title?: string; // book title for display
  library_name?: string; // library name for display
  username?: string; // user name for display
  days_remaining?: number;
}

export interface Reservation {
  id: number;
  user_id: number;
  library_id: number;
  book_id: number;
  reservation_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired' | 'completed';
  title?: string; // book title for display
  library_name?: string; // library name for display
  username?: string; // user name for display
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
