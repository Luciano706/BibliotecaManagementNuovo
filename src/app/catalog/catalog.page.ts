import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonButton, IonIcon,
  IonItem, IonLabel, IonBadge, 
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
    IonItem, IonLabel, IonBadge,
    IonSpinner, IonSelect, IonSelectOption, IonToast
  ]
})
export class CatalogPage implements OnInit {
  books: Book[] = [];
  libraries: Library[] = [];
  bookLibraryCopies: { [bookId: number]: { [libraryId: number]: number } } = {};
  selectedLibraries: { [bookId: number]: number } = {};
  isLoading = true;
  isProcessingAction: { [bookId: number]: boolean } = {};
  
  // Toast properties
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
    this.loadBooks();
    this.loadLibraries();
  }

  loadBooks() {
    this.libraryService.getAllBooks().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.books = response.data;
          this.loadBookLibraryCopies();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.isLoading = false;
        this.showToastMessage('Errore nel caricamento dei libri', 'danger');
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
        this.showToastMessage('Errore nel caricamento delle biblioteche', 'danger');
      }
    });
  }
  loadBookLibraryCopies() {
    // For each book, get available copies in each library
    this.books.forEach(book => {
      this.bookLibraryCopies[book.id] = {};
      
      // For each library, check if it has this book
      this.libraries.forEach(library => {
        this.libraryService.getLibraryBooks(library.id).subscribe({
          next: (response: any) => {
            if (response.status === 'success' && response.data) {
              const libraryBook = response.data.find((lb: LibraryBook) => lb.id === book.id);
              // Always set the copies count, even if it's 0 or the book doesn't exist
              this.bookLibraryCopies[book.id][library.id] = libraryBook ? (libraryBook.copies || 0) : 0;
            } else {
              // If no data or error, set to 0 copies
              this.bookLibraryCopies[book.id][library.id] = 0;
            }
          },
          error: (error: any) => {
            console.error(`Error loading books for library ${library.id}:`, error);
            // Set to 0 copies on error
            this.bookLibraryCopies[book.id][library.id] = 0;
          }
        });
      });
    });
  }  getAvailableLibrariesForBook(bookId: number): Library[] {
    // Return all libraries - users can borrow from libraries with copies > 0
    // and reserve from libraries with copies = 0 (or that don't have the book yet)
    return this.libraries;
  }

  getAvailableCopiesForBookInLibrary(bookId: number, libraryId: number): number {
    return this.bookLibraryCopies[bookId]?.[libraryId] || 0;
  }

  onLibrarySelectionChange(bookId: number, libraryId: number) {
    this.selectedLibraries[bookId] = libraryId;
  }

  canRequestLoan(bookId: number): boolean {
    const selectedLibraryId = this.selectedLibraries[bookId];
    if (!selectedLibraryId) return false;
    
    const availableCopies = this.getAvailableCopiesForBookInLibrary(bookId, selectedLibraryId);
    return availableCopies > 0;
  }

  canRequestReservation(bookId: number): boolean {
    const selectedLibraryId = this.selectedLibraries[bookId];
    if (!selectedLibraryId) return false;
    
    const availableCopies = this.getAvailableCopiesForBookInLibrary(bookId, selectedLibraryId);
    return availableCopies === 0;
  }

  async requestLoan(book: Book) {
    const selectedLibraryId = this.selectedLibraries[book.id];
    if (!selectedLibraryId) {
      this.showToastMessage('Seleziona una biblioteca', 'warning');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showToastMessage('Devi essere loggato per richiedere un prestito', 'warning');
      return;
    }

    this.isProcessingAction[book.id] = true;

    const loanData: CreateLoanRequest = {
      user_id: currentUser.id,
      library_id: selectedLibraryId,
      book_id: book.id
    };

    this.loanService.createLoan(loanData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.showToastMessage('Prestito richiesto con successo!', 'success');
          // Update local copies count
          if (this.bookLibraryCopies[book.id] && this.bookLibraryCopies[book.id][selectedLibraryId] > 0) {
            this.bookLibraryCopies[book.id][selectedLibraryId]--;
          }
        }
        this.isProcessingAction[book.id] = false;
      },
      error: (error) => {
        console.error('Error creating loan:', error);
        this.showToastMessage('Errore nella richiesta di prestito', 'danger');
        this.isProcessingAction[book.id] = false;
      }
    });
  }

  async requestReservation(book: Book) {
    const selectedLibraryId = this.selectedLibraries[book.id];
    if (!selectedLibraryId) {
      this.showToastMessage('Seleziona una biblioteca', 'warning');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showToastMessage('Devi essere loggato per prenotare un libro', 'warning');
      return;
    }

    this.isProcessingAction[book.id] = true;

    const reservationData: CreateReservationRequest = {
      user_id: currentUser.id,
      library_id: selectedLibraryId,
      book_id: book.id
    };

    this.loanService.createReservation(reservationData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.showToastMessage('Prenotazione effettuata con successo!', 'success');
        }
        this.isProcessingAction[book.id] = false;
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.showToastMessage('Errore nella prenotazione', 'danger');
        this.isProcessingAction[book.id] = false;
      }
    });
  }

  private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }
}
