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
  close, library, location, book, person, pricetag, barcode, search 
} from 'ionicons/icons';
import { LibraryService } from '../services/library.service';
import { Library, LibraryBook } from '../models/library.model';

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
  constructor(
    private modalController: ModalController,
    private libraryService: LibraryService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { 
    addIcons({ close, library, location, book, person, pricetag, barcode, search });
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

  dismiss() {
    this.modalController.dismiss();
  }
}
