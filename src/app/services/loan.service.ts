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

  creaPrestito(datiPrestito: CreateLoanRequest): Observable<any> {
    return this.http.post('/api/loan', datiPrestito);
  }

  restituisciLibro(datiRestituzione: ReturnBookRequest): Observable<any> {
    return this.http.post('/api/return', datiRestituzione);
  }

  creaPrenotazione(datiPrenotazione: CreateReservationRequest): Observable<any> {
    return this.http.post('/api/reserve', datiPrenotazione);
  }

  
  ottieniTuttiPrestiti(): Observable<Loan[]> { //LIBRARIAN/ADMIN
    return this.http.get<Loan[]>('/api/loans');
  }

  ottieniTuttePrenotazioni(): Observable<Reservation[]> { //LIBRARIAN/ADMIN
    return this.http.get<Reservation[]>('/api/reservations');
  }

  ottieniPrestitiMembro(): Observable<Loan[]> { //MEMBER
    return this.http.get<Loan[]>('/api/member/loans');
  }

  ottieniPrestitiAttiviMembro(): Observable<Loan[]> { //MEMBER
    return this.http.get<Loan[]>('/api/member/loans/active');
  }

  ottieniPrenotazioniMembro(): Observable<Reservation[]> { //MEMBER
    return this.http.get<Reservation[]>('/api/member/reservations');
  }

  ottieniPrenotazioniAttiveMembro(): Observable<Reservation[]> { //MEMBER
    return this.http.get<Reservation[]>('/api/member/reservations/active');
  }

  aggiornaStatoPrestito(idPrestito: number, status: UpdateStatusRequest): Observable<any> { //LIBRARIAN/ADMIN
    return this.http.put(`/api/loans/${idPrestito}/status`, status);
  }

  aggiornaStatoPrenotazione(idPrenotazione: number, status: UpdateStatusRequest): Observable<any> { //LIBRARIAN/ADMIN
    return this.http.put(`/api/reservations/${idPrenotazione}/status`, status);
  }

  ottieniPrestitiAttesa(): Observable<Loan[]> { 
    return this.http.get<Loan[]>('/api/loans/pending');
  }

  ottieniPrenotazioniAttesa(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/reservations/pending');
  }
}
