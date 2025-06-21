import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ModalController, LoadingController, ToastController,
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonSearchbar, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  close, library, location, book, person, pricetag, barcode, search, addCircleOutline, banOutline 
} from 'ionicons/icons';
import { LibraryService } from '../services/library.service';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
import { Library, LibraryBook } from '../models/library.model';
import { CreateLoanRequest } from '../models/loan.model';

@Component({
  selector: 'app-library-books-modal',
  templateUrl: './library-books-modal.component.html',
  styleUrls: ['./library-books-modal.component.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonSearchbar, IonSpinner
  ]
})
export class LibraryBooksModalComponent implements OnInit {
  @Input() library!: Library;
    books: LibraryBook[] = [];
  isLoading = false;
  searchTerm = '';
  filteredBooks: LibraryBook[] = [];
  isProcessingLoan: { [bookId: number]: boolean } = {};  constructor(
    private modalController: ModalController,
    private libraryService: LibraryService,
    private loanService: LoanService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { 
    addIcons({ close, library, location, book, person, pricetag, barcode, search, addCircleOutline, banOutline });
  }

  ngOnInit() {
    this.loadLibraryBooks();
  }

  async loadLibraryBooks() {
    this.isLoading = true;
    
    try {
      const response = await this.libraryService.getLibraryBooks(this.library.id).toPromise();
      if (response && response.status === 'success') {
        this.books = response.data || [];
        this.filteredBooks = [...this.books];
      } else {
        this.showToast('Errore nel caricamento dei libri', 'danger');
      }
    } catch (error) {
      console.error('Errore durante il caricamento dei libri:', error);
      this.showToast('Errore nel caricamento dei libri', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  filterBooks() {
    if (!this.searchTerm.trim()) {
      this.filteredBooks = [...this.books];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredBooks = this.books.filter(book => 
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.category?.toLowerCase().includes(term) ||
      book.isbn?.toLowerCase().includes(term)
    );
  }

  getAvailabilityClass(copies: number): string {
    if (copies === 0) return 'unavailable';
    if (copies <= 2) return 'low-availability';
    return 'available';
  }

  getAvailabilityText(copies: number): string {
    if (copies === 0) return 'Non disponibile';
    if (copies === 1) return '1 copia disponibile';
    return `${copies} copie disponibili`;
  }
  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  async requestLoan(book: LibraryBook) {
    try {
      // Verifica se l'utente è autenticato
      const utenteAttuale = this.authService.ottieniUtenteAttuale();
      if (!utenteAttuale || !utenteAttuale.id) {
        this.showToast('Devi essere autenticato per richiedere un prestito', 'danger');
        return;
      }

      // Verifica se l'utente ha il role member
      if (utenteAttuale.role !== 'member') {
        this.showToast('Solo i membri possono richiedere prestiti', 'warning');
        return;
      }

      // Imposta lo stato di caricamento per questo libro
      this.isProcessingLoan[book.id] = true;      // Prepara i dati per la richiesta di prestito
      const loanData: CreateLoanRequest = {
        user_id: utenteAttuale.id,
        library_id: this.library.id,
        book_id: book.id
      };

      // Effettua la richiesta di prestito
      const response = await this.loanService.createLoan(loanData).toPromise();
      
      if (response && response.status === 'success') {
        this.showToast(`Prestito richiesto con successo per "${book.title}"`, 'success');
        
        // Aggiorna la disponibilità del libro localmente
        const bookIndex = this.books.findIndex(b => b.id === book.id);
        if (bookIndex !== -1) {
          this.books[bookIndex].copies = Math.max(0, this.books[bookIndex].copies - 1);
        }
        
        const filteredIndex = this.filteredBooks.findIndex(b => b.id === book.id);
        if (filteredIndex !== -1) {
          this.filteredBooks[filteredIndex].copies = Math.max(0, this.filteredBooks[filteredIndex].copies - 1);
        }
      } else {
        this.showToast('Errore durante la richiesta di prestito', 'danger');
      }
    } catch (error: any) {
      console.error('Errore durante la richiesta di prestito:', error);
      
      // Gestisci errori specifici
      if (error.error && error.error.error) {
        this.showToast(error.error.error, 'danger');
      } else if (error.status === 400) {
        this.showToast('Libro non disponibile per il prestito', 'warning');
      } else if (error.status === 403) {
        this.showToast('Non hai i permessi per richiedere questo prestito', 'danger');
      } else {
        this.showToast('Errore durante la richiesta di prestito', 'danger');
      }
    } finally {
      // Rimuovi lo stato di caricamento
      this.isProcessingLoan[book.id] = false;
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
