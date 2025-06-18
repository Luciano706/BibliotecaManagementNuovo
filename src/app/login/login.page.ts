import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonInput, IonButton, IonSpinner, IonIcon, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  logInOutline, personOutline, eyeOutline, eyeOffOutline, 
  libraryOutline, lockClosedOutline, shieldCheckmarkOutline 
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, IonInput, IonButton, IonSpinner, IonIcon, IonToast
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  toastMessage = '';
  showToast = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ 
      logInOutline, personOutline, eyeOutline, eyeOffOutline, 
      libraryOutline, lockClosedOutline, shieldCheckmarkOutline 
    });
    
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login response received:', response); // Debug log
          this.isLoading = false;
          
          if (response.status === 'success') {
            console.log('Login successful, navigating to home'); // Debug log
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 100); // Small delay to ensure state is updated
          } else {
            this.showToastMessage(response.message || 'Errore durante il login');
          }
        },
        error: (error) => {
          console.error('Login error:', error); // Debug log
          this.isLoading = false;
          
          // Handle different error scenarios
          let errorMessage = 'Errore durante il login';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage = 'Errore di connessione al server';
          } else if (error.status === 401) {
            errorMessage = 'Credenziali non valide';
          }
          
          this.showToastMessage(errorMessage);
        }
      });
    } else {
      this.showToastMessage('Per favore, compila tutti i campi correttamente');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }
}
