import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Loan, 
  Reservation, 
  CreateLoanRequest, 
  CreateReservationRequest, 
  ReturnBookRequest, 
  UpdateStatusRequest 
} from '../models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  constructor(private http: HttpClient) { }

  // Create loan
  createLoan(loanData: CreateLoanRequest): Observable<any> {
    return this.http.post('/api/loan', loanData);
  }

  // Return book
  returnBook(returnData: ReturnBookRequest): Observable<any> {
    return this.http.post('/api/return', returnData);
  }

  // Create reservation
  createReservation(reservationData: CreateReservationRequest): Observable<any> {
    return this.http.post('/api/reserve', reservationData);
  }

  // Get all loans (librarian/admin)
  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>('/api/loans');
  }

  // Get all reservations (librarian/admin)
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/reservations');
  }

  // Get member loans
  getMemberLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>('/api/member/loans');
  }

  // Get member active loans
  getMemberActiveLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>('/api/member/loans/active');
  }

  // Get member reservations
  getMemberReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/member/reservations');
  }

  // Get member active reservations
  getMemberActiveReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/member/reservations/active');
  }

  // Update loan status
  updateLoanStatus(loanId: number, status: UpdateStatusRequest): Observable<any> {
    return this.http.put(`/api/loans/${loanId}/status`, status);
  }

  // Update reservation status
  updateReservationStatus(reservationId: number, status: UpdateStatusRequest): Observable<any> {
    return this.http.put(`/api/reservations/${reservationId}/status`, status);
  }

  // Get pending loans
  getPendingLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>('/api/loans/pending');
  }

  // Get pending reservations
  getPendingReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/reservations/pending');
  }
}
