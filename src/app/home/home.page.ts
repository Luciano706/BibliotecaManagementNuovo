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
      this.updateogettiMenu();
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateogettiMenu() {
    if (!this.authService.isAutenticato()) {
      this.ogettiMenu = [];
      return;
    }

    this.ogettiMenu = [
      { title: 'Catalogo Libri', icon: 'book-outline', path: '/catalog' },
      { title: 'Biblioteche', icon: 'library-outline', path: '/libraries' },
      { title: 'Dashboard', icon: 'stats-chart-outline', path: '/dashboard' }
    ];
    if (this.authService.getRuoloRaw() === 'librarian' || this.authService.getRuoloRaw() === 'admin') {
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
