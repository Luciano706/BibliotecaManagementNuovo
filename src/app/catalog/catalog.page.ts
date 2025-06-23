import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonButton, IonIcon,
  IonItem, IonBadge, 
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
  alertCircleOutline
} from 'ionicons/icons';
import { LibraryService } from '../services/library.service';
import { LoanService } from '../services/loan.service';
import { Book, Library, LibraryBook } from '../models/library.model';
import { AuthService } from '../services/auth.service';
import { CreateLoanRequest, CreateReservationRequest } from '../models/loan.model';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonButton, IonIcon,
    IonItem, IonBadge,
    IonSpinner, IonSelect, IonSelectOption, IonToast
  ]
})
export class CatalogPage implements OnInit {
  libri: Book[] = [];
  biblioteche: Library[] = [];
  copieLibroPerBiblioteca: { [bookId: number]: { [libraryId: number]: number } } = {}; //È una doppia mappa, indentifica per libro e poi per biblioteca ottenendo il numero di copie disponibili
  bibliotecheSelezionate: { [bookId: number]: number } = {};
  isLoading = true;
  isProcessingAction: { [bookId: number]: boolean } = {};

  flagBibliotecheCaricate = false; //variabile di sicurezza per evitare che ci siano dati mancanti
  

  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor(
    private libraryService: LibraryService,
    private loanService: LoanService,
    private authService: AuthService
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
      alertCircleOutline
    });
  }  ngOnInit() {
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
  
  this.libri.forEach(libro => {
    this.copieLibroPerBiblioteca[libro.id] = {};
    
    this.biblioteche.forEach(library => {
      this.libraryService.ottieniLibriBiblioteca(library.id).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            const libraryBook = response.data.find((lb: LibraryBook) => lb.id === libro.id);
            this.copieLibroPerBiblioteca[libro.id][library.id] = libraryBook ? (libraryBook.copies || 0) : 0;
            
            console.log(`Libro "${libro.title}" in "${library.name}": ${this.copieLibroPerBiblioteca[libro.id][library.id]} copie`);
          } else {
            this.copieLibroPerBiblioteca[libro.id][library.id] = 0;
          }
        },
        error: (error: any) => {
          this.copieLibroPerBiblioteca[libro.id][library.id] = 0;
        }
      });
    });
  });
}  
ottieniBiblioteceDisponibiliPerLibro(idLibro: number): Library[] {
    return this.biblioteche;
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
    
    const availableCopies = this.ottieniNumeroCopieLibroDaBiblioteca(idLibro, idBibliotecaSelezionata);
    return availableCopies > 0;
  }

  abilitaPrenotazione(idLibro: number): boolean {
    const idBibliotecaSelezionata = this.bibliotecheSelezionate[idLibro];
    if (!idBibliotecaSelezionata) return false;
    
    const availableCopies = this.ottieniNumeroCopieLibroDaBiblioteca(idLibro, idBibliotecaSelezionata);
    return availableCopies === 0;
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
        if (response.status === 'success') {
          this.mostraToast('Prestito richiesto con successo!', 'success');
          // Update local copies count
          if (this.copieLibroPerBiblioteca[libro.id] && this.copieLibroPerBiblioteca[libro.id][idBibliotecaSelezionata] > 0) {
            this.copieLibroPerBiblioteca[libro.id][idBibliotecaSelezionata]--;
          }
        }
        this.isProcessingAction[libro.id] = false;
      },
      error: (error) => {
        console.error('Error creating loan:', error);
        this.mostraToast('Errore nella richiesta di prestito', 'danger');
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
        if (response.status === 'success') {
          this.mostraToast('Prenotazione effettuata con successo!', 'success');
        }
        this.isProcessingAction[libro.id] = false;
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.mostraToast('Errore nella prenotazione', 'danger');
        this.isProcessingAction[libro.id] = false;
      }
    });
  }

  private mostraToast(messaggio: string, colore: string = 'success') {
    this.toastMessage = messaggio;
    this.toastColor = colore;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
    window.location.reload();
  }
}
