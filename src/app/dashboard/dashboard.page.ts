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
import { LibraryService } from '../services/library.service';
import { Loan, Reservation } from '../models/loan.model';
import { Library } from '../models/library.model';

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
  
  // Proprietà per gestire il filtraggio per librarian
  biblioteche: Library[] = [];
  bibliotecaDelLibrarian: string = '';
  
  isLoading = true;

  constructor(
    private authService: AuthService,
    private loanService: LoanService,
    private libraryService: LibraryService,
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

  // Metodo per ottenere il nome della biblioteca del librarian
  private async ottieniNomeBibliotecaLibrarian(): Promise<string> {
    if (this.authService.getRuoloRaw() !== 'librarian') {
      console.log('❌ Utente non è un librarian');
      return '';
    }

    // Debug: verifica dati utente in localStorage
    const utenteAttuale = localStorage.getItem('utenteAttuale');
    console.log('👤 Utente attuale in localStorage:', utenteAttuale);
    if (utenteAttuale) {
      const userData = JSON.parse(utenteAttuale);
      console.log('📋 Dati utente parsati:', userData);
      console.log('🔑 ID utente:', userData.id, 'Tipo:', typeof userData.id);
      console.log('👔 Ruolo utente:', userData.role);
    }

    try {
      const userId = this.authService.getId();
      console.log('🔍 User ID del librarian:', userId);
      
      if (userId === -1 || userId === null || userId === undefined) {
        console.log('❌ ID utente non valido:', userId);
        return '';
      }
      
      // Proviamo prima con il metodo che restituisce ApiResponse
      const response = await this.libraryService.ottieniBiblioteche().toPromise();
      console.log('📡 Risposta API biblioteche:', response);
      
      // Estraiamo l'array dalle biblioteche
      let biblioteche: Library[] = [];
      if (response && response.data) {
        biblioteche = response.data;
        console.log('📚 Biblioteche estratte da response.data:', biblioteche);
      } else if (Array.isArray(response)) {
        biblioteche = response as any;
        console.log('📚 Biblioteche come array diretto:', biblioteche);
      } else {
        console.log('❌ Formato risposta non riconosciuto, provo metodo alternativo');
        // Fallback: proviamo il metodo diretto
        try {
          const directResponse = await this.libraryService.ottieniTutteBiblioteche().toPromise();
          console.log('📡 Risposta API diretta:', directResponse);
          if (Array.isArray(directResponse)) {
            biblioteche = directResponse;
            console.log('📚 Biblioteche da API diretta:', biblioteche);
          } else {
            console.log('❌ Entrambi i metodi falliti');
            return '';
          }
        } catch (directError) {
          console.error('💥 Errore anche con metodo diretto:', directError);
          return '';
        }
      }

      this.biblioteche = biblioteche;
      
      // Debug: mostra tutte le biblioteche e i loro manager_id
      biblioteche.forEach((biblioteca, index) => {
        console.log(`📖 Biblioteca ${index}: ${biblioteca.name}, Manager ID: ${biblioteca.manager_id}`);
      });
      
      const bibliotecaDelManager = biblioteche.find(biblioteca => {
        console.log(`🔍 Confronto: ${biblioteca.manager_id} (tipo: ${typeof biblioteca.manager_id}) === ${userId} (tipo: ${typeof userId}) ?`);
        // Confronto sicuro gestendo i tipi
        const managerId = biblioteca.manager_id;
        if (managerId === undefined || managerId === null) return false;
        
        return Number(managerId) === Number(userId) || String(managerId) === String(userId);
      });
      
      console.log('🎯 Biblioteca trovata per il manager:', bibliotecaDelManager);
      
      const nomeBiblioteca = bibliotecaDelManager ? bibliotecaDelManager.name : '';
      console.log('📝 Nome biblioteca risultante:', nomeBiblioteca);
      
      return nomeBiblioteca;
    } catch (error) {
      console.error('💥 Errore nel caricamento delle biblioteche:', error);
      return '';
    }
  }

  // Metodo per filtrare i prestiti per la biblioteca del librarian
  private filtraPrestitiPerBiblioteca(prestiti: Loan[]): Loan[] {
    console.log('Filtraggio prestiti - Biblioteca del librarian:', this.bibliotecaDelLibrarian);
    console.log('Prestiti originali:', prestiti.length);
    
    if (this.authService.getRuoloRaw() === 'admin' || !this.bibliotecaDelLibrarian) {
      console.log('Admin o biblioteca non trovata - restituisco tutti i prestiti');
      return prestiti;
    }
    
    const prestitiFiltrati = prestiti.filter(prestito => prestito.library_name === this.bibliotecaDelLibrarian);
    console.log('Prestiti filtrati:', prestitiFiltrati.length);
    return prestitiFiltrati;
  }

  // Metodo per filtrare le prenotazioni per la biblioteca del librarian
  private filtraPrenotazioniPerBiblioteca(prenotazioni: Reservation[]): Reservation[] {
    console.log('Filtraggio prenotazioni - Biblioteca del librarian:', this.bibliotecaDelLibrarian);
    console.log('Prenotazioni originali:', prenotazioni.length);
    
    if (this.authService.getRuoloRaw() === 'admin' || !this.bibliotecaDelLibrarian) {
      console.log('Admin o biblioteca non trovata - restituisco tutte le prenotazioni');
      return prenotazioni;
    }
    
    const prenotazioniFiltrate = prenotazioni.filter(prenotazione => prenotazione.library_name === this.bibliotecaDelLibrarian);
    console.log('Prenotazioni filtrate:', prenotazioniFiltrate.length);
    return prenotazioniFiltrate;
  }

  async caricaDatiDashboard() {
    if (!this.authService.isAutenticato()) return;
    
    // Se è un librarian, ottieni prima il nome della sua biblioteca
    if (this.authService.getRuoloRaw() === 'librarian') {
      this.bibliotecaDelLibrarian = await this.ottieniNomeBibliotecaLibrarian();
      console.log('✅ Biblioteca del librarian impostata:', this.bibliotecaDelLibrarian);
      console.log('📚 Il librarian vedrà solo i dati per:', this.bibliotecaDelLibrarian);
    }
    
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
        this.prestitiAttesa = this.filtraPrestitiPerBiblioteca(loans);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore:', error);
        this.isLoading = false;
      }
    });

    this.loanService.ottieniPrenotazioniAttesa().subscribe({
      next: (reservations) => {
        this.prenotazioniAttesa = this.filtraPrenotazioniPerBiblioteca(reservations);
      },
      error: (error) => {
        console.error('Errore:', error);
      }
    });

    
    this.loanService.ottieniTuttiPrestiti().subscribe({
      next: (loans) => {
        this.tuttiPrestiti = this.filtraPrestitiPerBiblioteca(loans);
      },
      error: (error) => {
        console.error('Errore nel caricamento di tutti i prestiti:', error);
      }
    });

    
    this.loanService.ottieniTuttePrenotazioni().subscribe({
      next: (reservations) => {
        this.tuttePrenotazioni = this.filtraPrenotazioniPerBiblioteca(reservations);
      },
      error: (error) => {
        console.error('Errore nel caricamento di tutte le prenotazioni:', error);
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
    console.log(stato);
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

  // Metodo per ottenere il nome della biblioteca del librarian corrente
  getBibliotecaLibrarian(): string {
    return this.bibliotecaDelLibrarian;
  }

  // Metodo per verificare se l'utente può vedere tutti i dati (admin)
  puoVedereTuttiDati(): boolean {
    return this.authService.getRuoloRaw() === 'admin';
  }

  ottieniIconaPerStato(stato: string): string {
    switch (stato) {
      case 'approved': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      case 'pending': return 'hourglass-outline';
      case 'active': return 'play-circle-outline';
      case 'completed': return 'checkmark-done-circle-outline';
      case 'expired': return 'warning-outline';
      default: return 'help-circle-outline';
    }
  }

  ottieniColoreTestoPerStato(stato: string): string {
    switch (stato) {
      case 'approved': return '#10b981';  // Verde
      case 'rejected': return '#ef4444';  // Rosso
      case 'pending': return '#f59e0b';   // Arancione
      case 'active': return '#3b82f6';    // Blu
      case 'completed': return '#6b7280'; // Grigio
      case 'expired': return '#ef4444';   // Rosso
      default: return '#6b7280';          // Grigio default
    }
  }

}
