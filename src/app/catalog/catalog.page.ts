import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon,
  IonItem, IonLabel, IonBadge, IonList, IonChip, IonText,
  IonSpinner, IonModal, IonSelect, IonSelectOption, IonToast
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
  bookmarkOutline
} from 'ionicons/icons';
import { LibraryService } from '../services/library.service';
import { LoanService } from '../services/loan.service';
import { Book, Library } from '../models/library.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonButton, IonIcon,
    IonItem, IonLabel, 
    IonSpinner, IonModal, IonSelect, IonSelectOption, IonToast
  ]
})
export class CatalogPage implements OnInit {
  books: Book[] = [];
  libraries: Library[] = [];
  isLoading = true;
  
  // Modal properties
  showLoanModal = false;
  showReservationModal = false;
  selectedBook: Book | null = null;
  selectedLibraryId: number | null = null;
  
  // Toast properties
  showToast = false;
  toastMessage = '';

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
      bookmarkOutline
    });
  }
  ngOnInit() {
    this.loadBooks();
    this.loadLibraries();
  }

  loadBooks() {
    this.libraryService.getAllBooks().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.books = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.isLoading = false;
      }
    });
  }

  loadLibraries() {
    this.libraryService.getLibraries().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.libraries = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading libraries:', error);
      }
    });
  }

  requestLoan(book: Book) {
    this.selectedBook = book;
    this.selectedLibraryId = null;
    this.showLoanModal = true;
  }

  requestReservation(book: Book) {
    this.selectedBook = book;
    this.selectedLibraryId = null;
    this.showReservationModal = true;
  }

  confirmLoan() {
    if (!this.selectedBook || !this.selectedLibraryId) {
      this.showToastMessage('Seleziona una biblioteca');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showToastMessage('Devi essere loggato per richiedere un prestito');
      return;
    }

    const loanData = {
      user_id: currentUser.id,
      library_id: this.selectedLibraryId,
      book_id: this.selectedBook.id
    };

    this.loanService.createLoan(loanData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.showToastMessage('Prestito richiesto con successo!');
          this.cancelModal();
        }
      },
      error: (error) => {
        console.error('Error creating loan:', error);
        this.showToastMessage('Errore nella richiesta di prestito');
      }
    });
  }

  confirmReservation() {
    if (!this.selectedBook || !this.selectedLibraryId) {
      this.showToastMessage('Seleziona una biblioteca');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showToastMessage('Devi essere loggato per prenotare un libro');
      return;
    }

    const reservationData = {
      user_id: currentUser.id,
      library_id: this.selectedLibraryId,
      book_id: this.selectedBook.id
    };

    this.loanService.createReservation(reservationData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.showToastMessage('Prenotazione effettuata con successo!');
          this.cancelModal();
        }
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.showToastMessage('Errore nella prenotazione');
      }
    });
  }

  cancelModal() {
    this.showLoanModal = false;
    this.showReservationModal = false;
    this.selectedBook = null;
    this.selectedLibraryId = null;
  }

  getAvailabilityClass(book: Book): string {
    if (!book.total_copies || book.total_copies === 0) {
      return 'unavailable';
    }
    return 'available';
  }

  getAvailabilityText(book: Book): string {
    if (!book.total_copies || book.total_copies === 0) {
      return 'Non Disponibile';
    }
    return 'Disponibile';
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }
}
