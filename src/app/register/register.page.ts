import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonInput, IonButton, IonSpinner, IonIcon, IonToast, 
  IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personAddOutline, eyeOutline, eyeOffOutline, arrowBackOutline,
  personOutline, mailOutline, lockClosedOutline, peopleOutline,
  libraryOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LibraryService } from '../services/library.service';
import { Library } from '../models/library.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, IonInput, IonButton, IonSpinner, IonIcon, IonToast, 
    IonSelect, IonSelectOption
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  mostraPassword = false;
  toastMessage = '';
  showToast = false;
  libraries: Library[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private libraryService: LibraryService,
    private router: Router
  ) {
    addIcons({ 
      personAddOutline, eyeOutline, eyeOffOutline, arrowBackOutline,
      personOutline, mailOutline, lockClosedOutline, peopleOutline,
      libraryOutline, checkmarkCircleOutline
    });
    
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/)
      ]],
      role: ['member', [Validators.required]],
      library_id: ['']
    });

    
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const libraryControl = this.registerForm.get('library_id');
      if (role === 'librarian') {
        libraryControl?.setValidators([Validators.required]);
      } else {
        libraryControl?.clearValidators();
      }
      libraryControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.caricaBiblioteche();
  }

  caricaBiblioteche() {
    this.libraryService.ottieniBiblioteche().subscribe({
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

  mostraNascondiPassword() {
    this.mostraPassword = !this.mostraPassword;
  }

  registrati() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const formData = { ...this.registerForm.value };
      if (formData.role !== 'librarian') {
        delete formData.library_id;
      }

      this.authService.registrati(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'success') {
            this.showToastMessage('Registrazione completata con successo!', 'success');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.showToastMessage(response.message || 'Errore durante la registrazione');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.showToastMessage(error.error?.message || 'Errore durante la registrazione');
          console.error('Registration error:', error);
        }
      });
    } else {
      this.showToastMessage('Per favore, compila tutti i campi correttamente');
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  private showToastMessage(message: string, color: string = 'danger') {
    this.toastMessage = message;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }
}
