import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ModalController, ToastController,
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
import { firstValueFrom } from 'rxjs';

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
  ricerca = '';
  libriFiltro: LibraryBook[] = [];
  elaborazionePrestito: { [bookId: number]: boolean } = {};  
  constructor(
    private modalController: ModalController,
    private libraryService: LibraryService,
    private loanService: LoanService,
    private authService: AuthService,
    private toastController: ToastController
  ) { 
    addIcons({ close, library, location, book, person, pricetag, barcode, search, addCircleOutline, banOutline });
  }

  ngOnInit() {
    this.caricaLibriBiblioteca();
  }

  async caricaLibriBiblioteca() {
    this.isLoading = true;
    
    try {
      const response = await firstValueFrom(this.libraryService.ottieniLibriBiblioteca(this.library.id));
      if (response && response.status === 'success') {
        this.books = response.data || [];
        this.libriFiltro = [...this.books]; //Nota per noi: i tre puntini servono per fare una copia dell'aray
      } else {
        this.showToast('Errore nel caricamento dei libri', 'danger');
      }
    } catch (error) {
      this.showToast('Errore nel caricamento dei libri', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  filtraLibri() {
    if (!this.ricerca.trim()) {
      this.libriFiltro = [...this.books];
      return;
    }

    const term = this.ricerca.toLowerCase();
    this.libriFiltro = this.books.filter(book => 
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.category?.toLowerCase().includes(term) ||
      book.isbn?.toLowerCase().includes(term)
    );
  }

  ottieniTipoDisponibilitaTipo(numCopie: number): string {
    if (numCopie === 0) return 'unavailable';
    if (numCopie <= 2) return 'low-availability';
    return 'available';
  }

  ottieniTipoDisponibilitaTesto(numCopie: number): string {
    if (numCopie === 0) return 'Non disponibile';
    if (numCopie === 1) return '1 copia disponibile';
    return `${numCopie} copie disponibili`;
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

  async richiediPrestito(libro: LibraryBook) {
    try {
      if (this.authService.getRuoloRaw() !== 'member') {
        this.showToast('Solo i membri possono richiedere prestiti', 'warning');
        return;
      }

      this.elaborazionePrestito[libro.id] = true;

      const loanData: CreateLoanRequest = {
        user_id: this.authService.getId(),
        library_id: this.library.id,
        book_id: libro.id
      };

      const response = await firstValueFrom(this.loanService.creaPrestito(loanData));
      
      if (response && response.status === 'success') {
        this.showToast(`Richiesta di prestito inviata con successo per "${libro.title}"`, 'success');
        
      } else {
        this.showToast('Errore durante la richiesta di prestito', 'danger');
      }
    } catch (error: any) {
      console.error('Errore durante la richiesta di prestito:', error);
      
      // Gestione errori del servr
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
      this.elaborazionePrestito[libro.id] = false;
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
