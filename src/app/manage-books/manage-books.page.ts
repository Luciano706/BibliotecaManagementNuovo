import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonItem, IonLabel, IonInput, IonButton,
  IonSelect, IonSelectOption, IonText, IonToast, IonSegment,
  IonSegmentButton, IonList, IonSpinner
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { LibraryService } from '../services/library.service';
import { Library } from '../models/library.model';
import { User } from '../models/user.model';

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
    IonSelect, IonSelectOption, IonText, IonToast, IonSegment,
    IonSegmentButton, IonList, IonSpinner
  ]
})
export class ManageBooksPage implements OnInit {
  currentUser: User | null = null;
  selectedSegment = 'add-book';
  libraries: Library[] = [];
  books: any[] = []; // Lista di tutti i libri del catalogo
  
  addBookForm: FormGroup;
  addToLibraryForm: FormGroup;
  
  isSubmitting = false;
  isLoadingBooks = false;
  toastMessage = '';
  showToast = false;
  hasLibraryAccess = true; // Track if librarian has library access

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private libraryService: LibraryService
  ) {
    this.addBookForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      isbn: ['', [Validators.required]],
      category: ['', [Validators.required]]
    });

    this.addToLibraryForm = this.formBuilder.group({
      action: ['existing', [Validators.required]],
      library_id: ['', [Validators.required]],
      book_id: [''],
      copies: [1, [Validators.required, Validators.min(1)]],
      // New book fields
      title: [''],
      author: [''],
      isbn: [''],
      category: ['']
    });

    // Monitor action changes to set validation
    this.addToLibraryForm.get('action')?.valueChanges.subscribe(action => {
      const bookIdControl = this.addToLibraryForm.get('book_id');
      const titleControl = this.addToLibraryForm.get('title');
      const authorControl = this.addToLibraryForm.get('author');
      const isbnControl = this.addToLibraryForm.get('isbn');
      const categoryControl = this.addToLibraryForm.get('category');

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
        isbnControl?.setValidators([Validators.required]);
        categoryControl?.setValidators([Validators.required]);
      }

      bookIdControl?.updateValueAndValidity();
      titleControl?.updateValueAndValidity();
      authorControl?.updateValueAndValidity();
      isbnControl?.updateValueAndValidity();
      categoryControl?.updateValueAndValidity();
    });
  }  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupLibraryAccess();
    });
    
    this.loadLibraries();
    this.loadBooks();
  }  setupLibraryAccess() {
    if (!this.currentUser) return;

    const libraryControl = this.addToLibraryForm.get('library_id');
    
    if (this.currentUser.role === 'librarian') {
      // Librarian: find their managed library and preselect it
      const managedLibrary = this.libraries.find(lib => lib.manager_id === this.currentUser!.id);
      if (managedLibrary) {
        libraryControl?.setValue(managedLibrary.id);
        libraryControl?.disable();
        this.hasLibraryAccess = true;
      } else {
        // Librarian has no assigned library
        libraryControl?.disable();
        this.hasLibraryAccess = false;
      }
    } else if (this.currentUser.role === 'admin') {
      // Admin: enable library selection
      libraryControl?.enable();
      this.hasLibraryAccess = true;
    }
  }

  isLibrarySelectionDisabled(): boolean {
    return this.currentUser?.role === 'librarian';
  }

  getAssignedLibraryName(): string {
    if (this.currentUser?.role === 'librarian') {
      const managedLibrary = this.libraries.find(lib => lib.manager_id === this.currentUser!.id);
      return managedLibrary ? managedLibrary.name : 'Biblioteca non assegnata';
    }
    return '';
  }
  loadLibraries() {
    this.libraryService.getLibraries().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.libraries = response.data;
          this.setupLibraryAccess(); // Setup access after libraries are loaded
        }
      },
      error: (error) => {
        console.error('Error loading libraries:', error);
      }
    });
  }

  loadBooks() {
    this.isLoadingBooks = true;
    this.libraryService.getAllBooks().subscribe({
      next: (response) => {
        this.isLoadingBooks = false;
        if (response.status === 'success' && response.data) {
          this.books = response.data;
        }
      },
      error: (error) => {
        this.isLoadingBooks = false;
        console.error('Error loading books:', error);
        this.showToastMessage('Errore nel caricamento dei libri del catalogo');
      }
    });
  }
  onAddBook() {
    if (this.addBookForm.valid) {
      this.isSubmitting = true;
      
      this.libraryService.addBook(this.addBookForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showToastMessage('Libro aggiunto al catalogo con successo!', 'success');
          this.addBookForm.reset();
          // Ricarica la lista dei libri per aggiornare il dropdown
          this.loadBooks();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.showToastMessage(error.error?.error || 'Errore durante l\'aggiunta del libro');
        }
      });
    }
  }  onAddToLibrary() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      const formValue = this.addToLibraryForm.getRawValue(); // getRawValue() includes disabled controls
      
      if (formValue.action === 'existing') {
        // Add existing book to library
        this.libraryService.addBookToLibrary(
          formValue.library_id,
          formValue.book_id,
          formValue.copies
        ).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.showToastMessage('Copie aggiunte alla biblioteca con successo!', 'success');
            this.addToLibraryForm.patchValue({ book_id: '', copies: 1 });
          },
          error: (error) => {
            this.isSubmitting = false;
            this.showToastMessage(error.error?.error || 'Errore durante l\'aggiunta delle copie');
          }
        });
      } else {
        // Add new book and copies to library
        const bookData = {
          title: formValue.title,
          author: formValue.author,
          isbn: formValue.isbn,
          category: formValue.category,
          copies: formValue.copies
        };
        
        this.libraryService.addNewBookToLibrary(formValue.library_id, bookData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.showToastMessage('Nuovo libro aggiunto alla biblioteca con successo!', 'success');
            this.addToLibraryForm.patchValue({
              title: '',
              author: '',
              isbn: '',
              category: '',
              copies: 1
            });
          },
          error: (error) => {
            this.isSubmitting = false;
            this.showToastMessage(error.error?.error || 'Errore durante l\'aggiunta del nuovo libro');
          }
        });
      }
    }
  }

  // Get selected book details for display
  getSelectedBookDetails(): any {
    const selectedBookId = this.addToLibraryForm.get('book_id')?.value;
    if (selectedBookId) {
      return this.books.find(book => book.id === selectedBookId);
    }
    return null;
  }

  private showToastMessage(message: string, color: string = 'danger') {
    this.toastMessage = message;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }
  isFormValid(): boolean {
    if (this.isLibrarySelectionDisabled()) {
      // For librarians, check if they have a managed library and other form fields are valid
      const formValue = this.addToLibraryForm.getRawValue();
      const managedLibrary = this.libraries.find(lib => lib.manager_id === this.currentUser!.id);
      
      return managedLibrary && 
             formValue.action && 
             formValue.copies >= 1 &&
             ((formValue.action === 'existing' && formValue.book_id) ||
              (formValue.action === 'new' && formValue.title && formValue.author && formValue.isbn && formValue.category));
    }
    return this.addToLibraryForm.valid;
  }

  hasLibraryManagementAccess(): boolean {
    return this.hasLibraryAccess;
  }
}
