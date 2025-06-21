import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonBadge, IonIcon, IonButton, IonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  bookOutline, 
  timeOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline,
  hourglass,
  returnDownBack,
  analyticsOutline,
  personCircleOutline,
  libraryOutline,
  calendarOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LoanService } from '../services/loan.service';
import { Loan, Reservation } from '../models/loan.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonBadge, IonIcon, IonButton, IonSpinner
  ]
})
export class DashboardPage implements OnInit {
  selectedSegment = 'loans';
  
  memberLoans: Loan[] = [];
  memberReservations: Reservation[] = [];
  
  pendingLoans: Loan[] = [];
  pendingReservations: Reservation[] = [];
  
  isLoading = true;

  constructor(
    private authService: AuthService,
    private loanService: LoanService
  ) {    addIcons({ 
      bookOutline, 
      timeOutline, 
      checkmarkCircleOutline, 
      closeCircleOutline,
      hourglass,
      returnDownBack,
      analyticsOutline,
      personCircleOutline,
      libraryOutline,
      calendarOutline
    });
  }
  ngOnInit() {

    if (this.authService.isAutenticato()) {
      this.caricaDatiDashboard();
    }

  }

  caricaDatiDashboard() {
    if (!this.authService.isAutenticato()) return;

    if (this.authService.getRuoloRaw() === 'member') {
      this.caricaDatiMembro();
    } else {
      this.caricaDatiBibliotecario();
    }
  }

  caricaDatiMembro() {
    this.loanService.getMemberLoans().subscribe({
      next: (loans) => {
        this.memberLoans = loans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore:', error);
        this.isLoading = false;
      }
    });

    this.loanService.getMemberReservations().subscribe({
      next: (reservations) => {
        this.memberReservations = reservations;
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  caricaDatiBibliotecario() {
    this.loanService.getPendingLoans().subscribe({
      next: (loans) => {
        this.pendingLoans = loans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore:', error);
        this.isLoading = false;
      }
    });

    this.loanService.getPendingReservations().subscribe({
      next: (reservations) => {
        this.pendingReservations = reservations;
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  ottieniColorePerStato(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      case 'active': return 'primary';
      case 'completed': return 'medium';
      case 'expired': return 'danger';
      default: return 'medium';
    }
  }

  ottieniStato(status: string): string {
    switch (status) {
      case 'approved': return 'Approvato';
      case 'rejected': return 'Rifiutato';
      case 'pending': return 'In Attesa';
      case 'active': return 'Attivo';
      case 'completed': return 'Completato';
      case 'expired': return 'Scaduto';
      default: return status;
    }
  }

  accettaPrestito(loanId: number) {
    this.loanService.updateLoanStatus(loanId, { status: 'approved' }).subscribe({
      next: () => {
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  rifiutaPrestito(loanId: number) {
    this.loanService.updateLoanStatus(loanId, { status: 'rejected' }).subscribe({
      next: () => {
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  accettaPrenotazione(reservationId: number) {
    this.loanService.updateReservationStatus(reservationId, { status: 'approved' }).subscribe({
      next: () => {
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  rifiutaPrenotazione(reservationId: number) {
    this.loanService.updateReservationStatus(reservationId, { status: 'rejected' }).subscribe({
      next: () => {
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  restituisciLibro(loanId: number) {
    this.loanService.returnBook({ loan_id: loanId }).subscribe({
      next: () => {
        this.caricaDatiMembro();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  getRuolo(): string {
    return this.authService.getRuoloRaw();
  }

  isAutenticato(): boolean {
    return this.authService.isAutenticato();
  }

  getUsername(): string {
    return this.authService.getUsername();  
  }


}
