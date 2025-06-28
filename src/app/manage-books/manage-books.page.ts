import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonItem, IonLabel, IonInput, IonButton,
  IonSelect, IonSelectOption, IonToast, IonSegment,
  IonSegmentButton, IonSpinner, IonIcon, IonGrid,
  IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  settingsOutline, 
  libraryOutline, 
  bookOutline, 
  addOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  textOutline,
  personOutline,
  barcodeOutline,
  pricetagOutline,
  optionsOutline,
  copyOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LibraryService } from '../services/library.service';
import { Library } from '../models/library.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-books',
  templateUrl: './manage-books.page.html',
  styleUrls: ['./manage-books.page.scss'],  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonItem, IonLabel, IonInput, IonButton,
    IonSelect, IonSelectOption, IonToast, IonSegment,
    IonSegmentButton, IonSpinner, IonIcon, IonGrid,
    IonRow, IonCol
  ]
})
export class ManageBooksPage implements OnInit {
  utenteAttuale: User | null = null;
  sezioneSelezionata = 'add-book';
  biblioteche: Library[] = [];
  libri: any[] = [];
  
  aggiungiLibroForm: FormGroup;
  aggiungiLibroABibliotecaForm: FormGroup;
  
  richiestaInCorso = false;
  caricamentoLibri = false;
  messaggioToast = '';
  showToast = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private libraryService: LibraryService,
    private router: Router
  ) {
    addIcons({ 
      settingsOutline, 
      libraryOutline, 
      bookOutline, 
      addOutline,
      addCircleOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      textOutline,
      personOutline,
      barcodeOutline,
      pricetagOutline,
      optionsOutline,
      copyOutline,
      arrowBackOutline
    });
    
    this.aggiungiLibroForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      isbn: ['', [Validators.required]], //Valutare lunghezza ISBM
      category: ['', [Validators.required]]
    });

    this.aggiungiLibroABibliotecaForm = this.formBuilder.group({
      action: ['existing', [Validators.required]],
      library_id: ['', [Validators.required]],
      book_id: [''],
      copies: [1, [Validators.required, Validators.min(1)]],
      title: [''],
      author: [''],
      isbn: [''],
      category: ['']
    });

    this.aggiungiLibroABibliotecaForm.get('action')?.valueChanges.subscribe(action => {
      const bookIdControl = this.aggiungiLibroABibliotecaForm.get('book_id');
      const titleControl = this.aggiungiLibroABibliotecaForm.get('title');
      const authorControl = this.aggiungiLibroABibliotecaForm.get('author');
      const isbnControl = this.aggiungiLibroABibliotecaForm.get('isbn');
      const categoryControl = this.aggiungiLibroABibliotecaForm.get('category');

      if (action === 'existing') {
        bookIdControl?.setValidators([Validators.required]);
        titleControl?.clearValidators();
        authorControl?.clearValidators();
        isbnControl?.clearValidators();
        categoryControl?.clearValidators();
      } else {
        bookIdControl?.clearValidators();
        titleControl?.setValidators([Validators.required]);
        authorControl?.setValidators([Validators.required]);
        isbnControl?.setValidators([Validators.required, Validators.minLength(13)]); //limite reale ISBN
        categoryControl?.setValidators([Validators.required]);
      }

      bookIdControl?.updateValueAndValidity();
      titleControl?.updateValueAndValidity();
      authorControl?.updateValueAndValidity();
      isbnControl?.updateValueAndValidity();
      categoryControl?.updateValueAndValidity();
    });
  }  ngOnInit() {
    this.authService.ottieniUtenteSubject$().subscribe(user => {
      this.utenteAttuale = user;
      this.impostaAccessoBiblioteca();
    });
    
    this.caricaBiblioteche();
    this.caricaLibri();
  }
  
  impostaAccessoBiblioteca() {
    if (!this.authService.isAutenticato) return;

    const libraryControl = this.aggiungiLibroABibliotecaForm.get('library_id');
    
    if (this.authService.getRuoloRaw() === 'librarian') {
      const managedLibrary = this.biblioteche.find(lib => lib.manager_id === this.utenteAttuale!.id);
      if (managedLibrary) {
        libraryControl?.setValue(managedLibrary.id);
        libraryControl?.disable();
      }
    } else if (this.authService.getRuoloRaw() === 'admin') {
      libraryControl?.enable();
    }
  }

  isBibliotecario(): boolean {
    return this.authService.getRuoloRaw() === 'librarian';
  }

  ottieniBibliotecaAssegnata(): string {
    if (this.utenteAttuale?.role === 'librarian') {
      const managedLibrary = this.biblioteche.find(lib => lib.manager_id === this.utenteAttuale!.id);
      return managedLibrary ? managedLibrary.name : 'Biblioteca non assegnata';
    }
    return '';
  }
  caricaBiblioteche() {
    this.libraryService.ottieniBiblioteche().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.biblioteche = response.data;
          this.impostaAccessoBiblioteca(); 
        }
      },
      error: (error) => {
        console.error('Error loading libraries:', error);
      }
    });
  }

  caricaLibri() {
    this.caricamentoLibri = true;
    this.libraryService.ottieniTuttiLibri().subscribe({
      next: (response) => {
        this.caricamentoLibri = false;
        if (response.status === 'success' && response.data) {
          this.libri = response.data;
        }
      },
      error: (error) => {
        this.caricamentoLibri = false;
        this.mostraMessaggioToast('Errore nel caricamento dei libri del catalogo');
      }
    });
  }
  aggiungiLibro() {
    if (this.aggiungiLibroForm.valid) {
      this.richiestaInCorso = true;
      
      this.libraryService.aggiungiLibro(this.aggiungiLibroForm.value).subscribe({
        next: (response) => {
          this.richiestaInCorso = false;
          this.mostraMessaggioToast('Libro aggiunto al catalogo con successo!', 'success');
          this.aggiungiLibroForm.reset();
          this.caricaLibri();
        },
        error: (error) => {
          this.richiestaInCorso = false;
          this.mostraMessaggioToast(error.error?.error || 'Errore durante l\'aggiunta del libro');
        }
      });
    }
  }  
  aggiungiLibroBiblioteca() {
    if (this.isFormValid()) {
      this.richiestaInCorso = true;
      const formValue = this.aggiungiLibroABibliotecaForm.getRawValue();
      
      if (formValue.action === 'existing') {
        this.libraryService.aggiungiLibroBiblioteca(
          formValue.library_id,
          formValue.book_id,
          formValue.copies
        ).subscribe({
          next: (response) => {
            this.richiestaInCorso = false;
            this.mostraMessaggioToast('Copie aggiunte alla biblioteca con successo!', 'success');
            this.aggiungiLibroABibliotecaForm.patchValue({ book_id: '', copies: 1 });
          },
          error: (error) => {
            this.richiestaInCorso = false;
            this.mostraMessaggioToast(error.error?.error || 'Errore durante l\'aggiunta delle copie');
          }
        });
      } else {
        const bookData = {
          title: formValue.title,
          author: formValue.author,
          isbn: formValue.isbn,
          category: formValue.category,
          copies: formValue.copies
        };
        
        this.libraryService.aggiungiNuovoLibroBiblioteca(formValue.library_id, bookData).subscribe({
          next: (response) => {
            this.richiestaInCorso = false;
            this.mostraMessaggioToast('Nuovo libro aggiunto alla biblioteca con successo!', 'success');
            this.aggiungiLibroABibliotecaForm.patchValue({
              title: '',
              author: '',
              isbn: '',
              category: '',
              copies: 1
            });
          },
          error: (error) => {
            this.richiestaInCorso = false;
            this.mostraMessaggioToast(error.error?.error || 'Errore durante l\'aggiunta del nuovo libro');
          }
        });
      }
    }
  }

  ottieniDettagliLibroSelezionato(): any {
    const selectedBookId = this.aggiungiLibroABibliotecaForm.get('book_id')?.value;
    if (selectedBookId) {
      return this.libri.find(book => book.id === selectedBookId);
    }
    return null;
  }

  private mostraMessaggioToast(message: string, color: string = 'danger') {
    this.messaggioToast = message;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }

  isFormValid(): boolean {
    const formValue = this.aggiungiLibroABibliotecaForm.getRawValue();
    
    // Validazioni comuni
    if (!formValue.action || !formValue.copies || formValue.copies < 1) {
      return false;
    }

    if (this.isBibliotecario()) {
      // Assegnazione della biblioteca per i librarian, aflse in caso di mancata biblioteca assegnata (caso impossibile)
      const managedLibrary = this.biblioteche.find(lib => lib.manager_id === this.utenteAttuale!.id);
      if (!managedLibrary) {
        return false;
      }
    } else {
      // Verifica della biblioteca selezionata
      if (!formValue.library_id) {
        return false;
      }
    }
    return ((formValue.action === 'existing' && formValue.book_id) ||
            (formValue.action === 'new' && formValue.title && formValue.author && formValue.isbn && formValue.category));
  }

  tornaAllaHome() {
    this.router.navigate(['/home']);
  }
}
