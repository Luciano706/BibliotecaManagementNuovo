import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonButton, IonIcon, IonBadge, 
  IonSpinner, IonSelect, IonSelectOption, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  bookOutline, 
  locationOutline, 
  libraryOutline,
  personOutline,
  barcodeOutline,
  copyOutline,
  downloadOutline,
  bookmarkOutline,
  chevronDownOutline,
  alertCircleOutline,
  arrowBackOutline 
} from 'ionicons/icons';
import { LibraryService } from '../services/library.service';
import { LoanService } from '../services/loan.service';
import { Book, Library, LibraryBook } from '../models/library.model';
import { AuthService } from '../services/auth.service';
import { CreateLoanRequest, CreateReservationRequest } from '../models/loan.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonButton, IonIcon,
    IonBadge, IonSpinner, IonSelect, IonSelectOption, IonToast
  ]
})
export class CatalogPage implements OnInit {
  libri: Book[] = [];
  biblioteche: Library[] = [];
  copieLibroPerBiblioteca: { [bookId: number]: { [libraryId: number]: number } } = {}; //È una doppia mappa, indentifica per libro e poi per biblioteca ottenendo il numero di copie disponibili
  bibliotecheSelezionate: { [bookId: number]: number } = {};
  isLoading = true;
  isProcessingAction: { [bookId: number]: boolean } = {};

  flagBibliotecheCaricate = false;
  

  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  libroEsisteInBiblioteca: { [bookId: number]: { [libraryId: number]: boolean } } = {};

  constructor(
    private libraryService: LibraryService,
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ 
      bookOutline, 
      locationOutline, 
      libraryOutline,
      personOutline,
      barcodeOutline,
      copyOutline,
      downloadOutline,
      bookmarkOutline,
      chevronDownOutline,
      alertCircleOutline,
      arrowBackOutline
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.pulisciERicarica();
  }

  private pulisciERicarica() {
    //cancella tutto quello che c'era
    this.isLoading = true;
    this.flagBibliotecheCaricate = false;
    this.libri = [];
    this.biblioteche = [];
    this.copieLibroPerBiblioteca = {};
    this.libroEsisteInBiblioteca = {};
    this.bibliotecheSelezionate = {};
    this.isProcessingAction = {};

    // Ricarica i dati
    this.caricaBiblioteche();
    this.caricaLibri();
  }

caricaLibri() {
  this.libraryService.ottieniTuttiLibri().subscribe({
    next: (response) => {
      if (response.status === 'success' && response.data) {
        this.libri = response.data;
        this.caricaNumeroCopiePerBiblioteca();
      }
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading books:', error);
      this.isLoading = false;
      this.mostraToast('Errore nel caricamento dei libri', 'danger');
    }
  });
}

caricaBiblioteche() {
  this.libraryService.ottieniBiblioteche().subscribe({
    next: (response) => {
      if (response.status === 'success' && response.data) {
        this.biblioteche = response.data;
        this.flagBibliotecheCaricate = true;
        this.caricaNumeroCopiePerBiblioteca();
      }
    },
    error: (error) => {
      this.mostraToast('Errore nel caricamento delle biblioteche', 'danger');
    }
  });
}


private caricaNumeroCopiePerBiblioteca() {
  if (!(this.flagBibliotecheCaricate && this.libri.length > 0 && this.biblioteche.length > 0))
    return;
  
  this.copieLibroPerBiblioteca = {};
  this.libroEsisteInBiblioteca = {}; // Inizializza la nuova mappa
  
  this.libri.forEach(libro => {
    this.copieLibroPerBiblioteca[libro.id] = {};
    this.libroEsisteInBiblioteca[libro.id] = {}; // Inizializza per ogni libro
    
    this.biblioteche.forEach(library => {
      this.libraryService.ottieniLibriBiblioteca(library.id).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            const libraryBook = response.data.find((lb: LibraryBook) => lb.id === libro.id);
            
            if (libraryBook) {
              // Il libro esiste nella biblioteca
              this.libroEsisteInBiblioteca[libro.id][library.id] = true;
              this.copieLibroPerBiblioteca[libro.id][library.id] = libraryBook.copies || 0;
            } else {
              // Il libro NON esiste nella biblioteca
              this.libroEsisteInBiblioteca[libro.id][library.id] = false;
              this.copieLibroPerBiblioteca[libro.id][library.id] = 0;
            }
            
            console.log(`Libro "${libro.title}" in "${library.name}": ${this.copieLibroPerBiblioteca[libro.id][library.id]} copie, esiste: ${this.libroEsisteInBiblioteca[libro.id][library.id]}`);
          } else {
            this.libroEsisteInBiblioteca[libro.id][library.id] = false;
            this.copieLibroPerBiblioteca[libro.id][library.id] = 0;
          }
        },
        error: (error: any) => {
          this.libroEsisteInBiblioteca[libro.id][library.id] = false;
          this.copieLibroPerBiblioteca[libro.id][library.id] = 0;
        }
      });
    });
  });
}  
private libroEsisteNellaBiblioteca(idLibro: number, idBiblioteca: number): boolean {
    return this.libroEsisteInBiblioteca[idLibro]?.[idBiblioteca] || false;
  }

  ottieniBiblioteceDisponibiliPerLibro(idLibro: number): Library[] {
    return this.biblioteche.filter(biblioteca => 
      this.libroEsisteNellaBiblioteca(idLibro, biblioteca.id)
    );
  }

  ottieniNumeroCopieLibroDaBiblioteca(idLibro: number, idBiblioteca: number): number {
    return this.copieLibroPerBiblioteca[idLibro]?.[idBiblioteca] || 0;
  }

  cambiaBiblioteca(idLibro: number, idBiblioteca: number) {
    this.bibliotecheSelezionate[idLibro] = idBiblioteca;
  }

  abilitaPrestito(idLibro: number): boolean {
    const idBibliotecaSelezionata = this.bibliotecheSelezionate[idLibro];
    if (!idBibliotecaSelezionata) return false;
    
    // Verifica che il libro esista nella biblioteca
    if (!this.libroEsisteNellaBiblioteca(idLibro, idBibliotecaSelezionata)) return false;
    
    const availableCopies = this.ottieniNumeroCopieLibroDaBiblioteca(idLibro, idBibliotecaSelezionata);
    return availableCopies > 0;
  }

  abilitaPrenotazione(idLibro: number): boolean {
    const idBibliotecaSelezionata = this.bibliotecheSelezionate[idLibro];
    if (!idBibliotecaSelezionata) return false;
    
    // Verifica che il libro esista nella biblioteca
    if (!this.libroEsisteNellaBiblioteca(idLibro, idBibliotecaSelezionata)) return false;
    
    const availableCopies = this.ottieniNumeroCopieLibroDaBiblioteca(idLibro, idBibliotecaSelezionata);
    return availableCopies === 0; // Prenotabile solo se esiste ma ha 0 copie disponibili
  }

  // Nuovo metodo per verificare se mostrare un messaggio di "non disponibile"
  libroNonDisponibileInBiblioteca(idLibro: number): boolean {
    const idBibliotecaSelezionata = this.bibliotecheSelezionate[idLibro];
    if (!idBibliotecaSelezionata) return false;
    
    return !this.libroEsisteNellaBiblioteca(idLibro, idBibliotecaSelezionata);
  }

  async richiediPrestito(libro: Book) {
    const idBibliotecaSelezionata = this.bibliotecheSelezionate[libro.id];
    if (!idBibliotecaSelezionata) {
      this.mostraToast('Seleziona una biblioteca', 'warning');
      return;
    }

    this.isProcessingAction[libro.id] = true;

    const loanData: CreateLoanRequest = {
      user_id: this.authService.getId(),
      library_id: idBibliotecaSelezionata,
      book_id: libro.id
    };

    this.loanService.creaPrestito(loanData).subscribe({
      next: (response) => {
        console.log('✅ Risposta prestito:', response);
        
        // Gestisci diversi formati di risposta
        if (response && (response.status === 'success' || response.success === true || response.message === 'Loan created successfully')) {
          console.log('🎉 Prestito creato con successo');
          this.mostraToast('Prestito richiesto con successo!', 'success');
          if (this.copieLibroPerBiblioteca[libro.id] && this.copieLibroPerBiblioteca[libro.id][idBibliotecaSelezionata] > 0) {
            this.copieLibroPerBiblioteca[libro.id][idBibliotecaSelezionata]--;
          }
        } else if (response && !response.error) {
          // Se non c'è un errore esplicito, considera come successo
          console.log('✅ Prestito presumibilmente creato (nessun errore)');
          this.mostraToast('Prestito richiesto con successo!', 'success');
          if (this.copieLibroPerBiblioteca[libro.id] && this.copieLibroPerBiblioteca[libro.id][idBibliotecaSelezionata] > 0) {
            this.copieLibroPerBiblioteca[libro.id][idBibliotecaSelezionata]--;
          }
        } else {
          console.log('❌ Errore nel prestito:', response);
          this.mostraToast(response.message || response.error || 'Errore nella richiesta di prestito', 'danger');
        }
        this.isProcessingAction[libro.id] = false;
      },
      error: (error) => {
        console.error('Error creating loan:', error);
        
        // Gestisci errori specifici
        if (error.error && error.error.error) {
          this.mostraToast(error.error.error, 'danger');
        } else if (error.status === 400) {
          this.mostraToast('Libro non disponibile per il prestito', 'warning');
        } else if (error.status === 403) {
          this.mostraToast('Non hai i permessi per richiedere questo prestito', 'danger');
        } else {
          this.mostraToast('Errore nella richiesta di prestito', 'danger');
        }
        this.isProcessingAction[libro.id] = false;
      }
    });
  }

  async richiediPrenotazione(libro: Book) {
    const idBibliotecaSelezionata = this.bibliotecheSelezionate[libro.id];
    if (!idBibliotecaSelezionata) {
      this.mostraToast('Seleziona una biblioteca', 'warning');
      return;
    }

    this.isProcessingAction[libro.id] = true;

    const datiPrenotazione: CreateReservationRequest = {
      user_id: this.authService.getId(),
      library_id: idBibliotecaSelezionata,
      book_id: libro.id
    };

    this.loanService.creaPrenotazione(datiPrenotazione).subscribe({
      next: (response) => {
        console.log('✅ Risposta prenotazione:', response);
        
        // Gestisci diversi formati di risposta
        if (response && (response.status === 'success' || response.success === true || response.message === 'Reservation created successfully')) {
          console.log('🎉 Prenotazione creata con successo');
          this.mostraToast('Prenotazione richiesta con successo!', 'success');
        } else if (response && !response.error) {
          // Se non c'è un errore esplicito, considera come successo
          console.log('✅ Prenotazione presumibilmente creata (nessun errore)');
          this.mostraToast('Prenotazione richiesta con successo!', 'success');
        } else {
          console.log('❌ Errore nella prenotazione:', response);
          this.mostraToast(response.message || response.error || 'Errore nella prenotazione', 'danger');
        }
        this.isProcessingAction[libro.id] = false;
      },
      error: (error) => {
        
        // Gestisci errori specifici
        if (error.error && error.error.error) {
          this.mostraToast(error.error.error, 'danger');
        } else if (error.status === 400) {
          this.mostraToast('Libro non disponibile per la prenotazione', 'warning');
        } else if (error.status === 403) {
          this.mostraToast('Non hai i permessi per effettuare questa prenotazione', 'danger');
        } else {
          this.mostraToast('Errore nella prenotazione', 'danger');
        }
        this.isProcessingAction[libro.id] = false;
      }
    });
  }

  private mostraToast(messaggio: string, colore: string = 'success') {
    console.log('🔧 Toast - Messaggio:', messaggio);
    console.log('🎨 Toast - Colore impostato:', colore);
    console.log('🎨 Toast - Colore precedente:', this.toastColor);
    
    this.toastMessage = messaggio;
    this.toastColor = colore;
    this.showToast = true;
    
    console.log('📱 Toast - Stato finale:', {
      message: this.toastMessage,
      color: this.toastColor,
      show: this.showToast
    });
  }

  onToastDismiss() {
    console.log('🚫 Toast dismisso');
    this.showToast = false;
    this.toastMessage = '';
    this.toastColor = 'success'; // Reset al colore default
    this.bibliotecheSelezionate = {};
  }

  tornaAllaHome() {
    this.router.navigate(['/home']);
  }
}
