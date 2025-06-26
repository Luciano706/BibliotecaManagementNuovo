import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  libraryOutline, 
  bookOutline, 
  personOutline, 
  logOutOutline, 
  homeOutline,
  addOutline,
  statsChartOutline,
  listOutline,
  personCircleOutline,
  timeOutline,
  arrowForwardOutline,
  searchOutline,
  analyticsOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonSpinner,
    IonButton
  ],
})
export class HomePage implements OnInit, OnDestroy {
  ogettiMenu: any[] = [];
  utenteAttuale: User | null = null; // Volevamo usare le funzioni del service, ma abbiamo un pobrlema di timing
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ 
      libraryOutline, 
      bookOutline, 
      personOutline, 
      logOutOutline, 
      homeOutline,
      addOutline,
      statsChartOutline,
      listOutline,
      personCircleOutline,
      timeOutline,
      arrowForwardOutline,
      searchOutline,
      analyticsOutline
    });
  }

  ngOnInit() {
    this.authService.checkValiditaSessione();
    this.userSubscription = this.authService.ottieniUtenteSubject$().subscribe(user => {
      this.utenteAttuale = user;
      this.aggiornaOgettiMenu(user);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private aggiornaOgettiMenu(user: User | null = null) {
    const currentUser = user || this.utenteAttuale;
    
    
    if (!currentUser) {
      this.ogettiMenu = [];
      return;
    }

    this.ogettiMenu = [
      { title: 'Catalogo Libri', icon: 'book-outline', path: '/catalog' },
      { title: 'Biblioteche', icon: 'library-outline', path: '/libraries' },
      { title: 'Dashboard', icon: 'stats-chart-outline', path: '/dashboard' }
    ];

    
    if (currentUser.role === 'librarian' || currentUser.role === 'admin') {
        this.ogettiMenu.push({ 
          title: 'Gestione Libri', 
          icon: 'add-outline', 
          path: '/manage-books' 
        });
    }
    
  }

  vai(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRuolo(): string {
    return this.authService.getRuolo();
  }

  getUsername(): string {
    return this.authService.getUsername();
  }

  isAutenticato(): boolean {
    return this.authService.isAutenticato();
  }


}
