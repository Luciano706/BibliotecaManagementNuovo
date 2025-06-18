import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon,
  IonItem, IonLabel, IonBadge, IonList, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { libraryOutline, locationOutline, bookOutline } from 'ionicons/icons';
import { LibraryService } from '../services/library.service';
import { Library } from '../models/library.model';

@Component({
  selector: 'app-libraries',
  templateUrl: './libraries.page.html',
  styleUrls: ['./libraries.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon,
    IonItem, IonLabel, IonBadge, IonList, IonText
  ]
})
export class LibrariesPage implements OnInit {
  libraries: Library[] = [];
  isLoading = true;

  constructor(private libraryService: LibraryService) {
    addIcons({ libraryOutline, locationOutline, bookOutline });
  }

  ngOnInit() {
    this.loadLibraries();
  }

  loadLibraries() {
    this.libraryService.getLibraries().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.libraries = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading libraries:', error);
        this.isLoading = false;
      }
    });
  }

  viewLibraryBooks(library: Library) {
    console.log('View books for library:', library);
    // TODO: Navigate to library books view
  }
}
