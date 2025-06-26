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
  calendarOutline,
  arrowBackOutline 
} from 'ionicons/icons';
import { Router } from '@angular/router';
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
  selezione = 'loans';
  
  prestitiMembro: Loan[] = [];
  prenotazioniMembro: Reservation[] = [];
  
  prestitiAttesa: Loan[] = [];
  prenotazioniAttesa: Reservation[] = [];
  
  tuttiPrestiti: Loan[] = [];
  tuttePrenotazioni: Reservation[] = [];
  
  isLoading = true;

  constructor(
    private authService: AuthService,
    private loanService: LoanService,
    private router: Router  
  ) {    
    addIcons({ 
      bookOutline, 
      timeOutline, 
      checkmarkCircleOutline, 
      closeCircleOutline,
      hourglass,
      returnDownBack,
      analyticsOutline,
      personCircleOutline,
      libraryOutline,
      calendarOutline,
      arrowBackOutline 
    });
  }
  ngOnInit() {
    this.caricaDatiDashboard();
  }

  caricaDatiDashboard() {
    if (!this.authService.isAutenticato()) return;
    console.log(this.authService.getRuoloRaw());
    if (this.authService.getRuoloRaw() === 'member') {
      this.caricaDatiMembro();
    } else {
      this.caricaDatiBibliotecario();
    }
  }

  caricaDatiMembro() {
    this.loanService.ottieniPrestitiMembro().subscribe({
      next: (loans) => {
        this.prestitiMembro = loans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore:', error);
        this.isLoading = false;
      }
    });

    this.loanService.ottieniPrenotazioniMembro().subscribe({
      next: (reservations) => {
        this.prenotazioniMembro = reservations;
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  caricaDatiBibliotecario() {
    this.loanService.ottieniPrestitiAttesa().subscribe({
      next: (loans) => {
        this.prestitiAttesa = loans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore:', error);
        this.isLoading = false;
      }
    });

    this.loanService.ottieniPrenotazioniAttesa().subscribe({
      next: (reservations) => {
        this.prenotazioniAttesa = reservations;
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });

    
    this.loanService.ottieniTuttiPrestiti().subscribe({
      next: (loans) => {
        this.tuttiPrestiti = loans;
      },
      error: (error) => {
        
      }
    });

    
    this.loanService.ottieniTuttePrenotazioni().subscribe({
      next: (reservations) => {
        this.tuttePrenotazioni = reservations;
      },
      error: (error) => {
        
      }
    });
  }

  ottieniColorePerStato(stato: string): string {
    switch (stato) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      case 'active': return 'primary';
      case 'completed': return 'medium';
      case 'expired': return 'danger';
      default: return 'medium';
    }
  }

  ottieniStato(stato: string): string {
    switch (stato) {
      case 'approved': return 'Approvato';
      case 'rejected': return 'Rifiutato';
      case 'pending': return 'In Attesa';
      case 'active': return 'Attivo';
      case 'completed': return 'Completato';
      case 'expired': return 'Scaduto';
      default: return stato;
    }
  }

  accettaPrestito(idPrestito: number) {
    this.loanService.aggiornaStatoPrestito(idPrestito, { status: 'approved' }).subscribe({
      next: () => {
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  rifiutaPrestito(idPrestito: number) {
    this.loanService.aggiornaStatoPrestito(idPrestito, { status: 'rejected' }).subscribe({
      next: () => {
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  accettaPrenotazione(idPrenotazione: number) {
    this.loanService.aggiornaStatoPrenotazione(idPrenotazione, { status: 'approved' }).subscribe({
      next: () => {
        console.log("HELLO, prenotazione accettata");
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  rifiutaPrenotazione(idPrenotazione: number) {
    this.loanService.aggiornaStatoPrenotazione(idPrenotazione, { status: 'rejected' }).subscribe({
      next: () => {
        this.caricaDatiBibliotecario();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  restituisciLibro(idPrestito: number) {
    this.loanService.restituisciLibro({ loan_id: idPrestito }).subscribe({
      next: () => {
        this.caricaDatiMembro();
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });
  }

  tornaAllaHome() {
    this.router.navigate(['/home']);
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
