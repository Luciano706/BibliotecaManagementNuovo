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
  creaPrestito(datiPrestito: CreateLoanRequest): Observable<any> {
    return this.http.post('/api/loan', datiPrestito);
  }

  // Return book
  restituisciLibro(datiRestituzione: ReturnBookRequest): Observable<any> {
    return this.http.post('/api/return', datiRestituzione);
  }

  // Create reservation
  creaPrenotazione(datiPrenotazione: CreateReservationRequest): Observable<any> {
    return this.http.post('/api/reserve', datiPrenotazione);
  }

  
  ottieniTuttiPrestiti(): Observable<Loan[]> { //LIBRARIAN/ADMIN
    return this.http.get<Loan[]>('/api/loans');
  }

  // Get all reservations (librarian/admin)
  ottieniTuttePrenotazioni(): Observable<Reservation[]> { //LIBRARIAN/ADMIN
    return this.http.get<Reservation[]>('/api/reservations');
  }

  // Get member loans
  ottieniPrestitiMembro(): Observable<Loan[]> { //MEMBER
    return this.http.get<Loan[]>('/api/member/loans');
  }

  // Get member active loans
  ottieniPrestitiAttiviMembro(): Observable<Loan[]> { //MEMBER
    return this.http.get<Loan[]>('/api/member/loans/active');
  }

  // Get member reservations
  ottieniPrenotazioniMembro(): Observable<Reservation[]> { //MEMBER
    return this.http.get<Reservation[]>('/api/member/reservations');
  }

  // Get member active reservations
  ottieniPrenotazioniAttiveMembro(): Observable<Reservation[]> { //MEMBER
    return this.http.get<Reservation[]>('/api/member/reservations/active');
  }

  // Update loan status
  aggiornaStatoPrestito(idPrestito: number, status: UpdateStatusRequest): Observable<any> { //LIBRARIAN/ADMIN
    return this.http.put(`/api/loans/${idPrestito}/status`, status);
  }

  // Update reservation status
  aggiornaStatoPrenotazione(idPrenotazione: number, status: UpdateStatusRequest): Observable<any> { //LIBRARIAN/ADMIN
    return this.http.put(`/api/reservations/${idPrenotazione}/status`, status);
  }

  // Get pending loans
  ottieniPrestitiAttesa(): Observable<Loan[]> { 
    return this.http.get<Loan[]>('/api/loans/pending');
  }

  // Get pending reservations
  ottieniPrenotazioniAttesa(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/reservations/pending');
  }
}
