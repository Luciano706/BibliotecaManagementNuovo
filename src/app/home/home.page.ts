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
  currentUser: User | null = null;
  menuItems: any[] = [];
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
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateMenuItems(); // Aggiorna gli elementi del menu quando cambia l'utente
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateMenuItems() {
    if (!this.currentUser) {
      this.menuItems = [];
      return;
    }

    // Rimuoviamo "Home" dal menu per evitare loop infiniti
    this.menuItems = [
      { title: 'Catalogo Libri', icon: 'book-outline', path: '/catalog' },
      { title: 'Biblioteche', icon: 'library-outline', path: '/libraries' },
      { title: 'Dashboard', icon: 'stats-chart-outline', path: '/dashboard' }
    ];

    if (this.currentUser.role === 'librarian' || this.currentUser.role === 'admin') {
      this.menuItems.push({ title: 'Gestione Libri', icon: 'add-outline', path: '/manage-books' });
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'member': return 'Membro';
      case 'librarian': return 'Bibliotecario';
      case 'admin': return 'Amministratore';
      default: return role;
    }
  }
}
