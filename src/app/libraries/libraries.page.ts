import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon,
  IonItem, IonLabel, IonBadge, IonList, IonText, ModalController,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { libraryOutline, locationOutline, bookOutline } from 'ionicons/icons';
import { LibraryService } from '../services/library.service';
import { Library } from '../models/library.model';
import { LibraryBooksModalComponent } from '../library-books-modal/library-books-modal.component';

@Component({
  selector: 'app-libraries',
  templateUrl: './libraries.page.html',
  styleUrls: ['./libraries.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon,
    IonItem, IonLabel, IonList
  ]
})
export class LibrariesPage implements OnInit {
  libraries: Library[] = [];
  isLoading = true;

  constructor(
    private libraryService: LibraryService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ libraryOutline, locationOutline, bookOutline });
  }

  ngOnInit() {
    this.loadLibraries();
  }

  loadLibraries() {
    this.libraryService.ottieniBiblioteche().subscribe({
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
  async viewLibraryBooks(library: Library) {
    const modal = await this.modalController.create({
      component: LibraryBooksModalComponent,
      componentProps: {
        library: library
      },
      cssClass: 'library-books-modal'
    });

    return await modal.present();
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
}
