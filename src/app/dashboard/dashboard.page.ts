import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonBadge, IonIcon, IonButton, IonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  bookOutline, 
  timeOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline,
  hourglass,
  returnDownBack,
  analyticsOutline,
  personCircleOutline,
  libraryOutline,
  calendarOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LoanService } from '../services/loan.service';
import { Loan, Reservation } from '../models/loan.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonBadge, IonIcon, IonButton, IonSpinner
  ]
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  selectedSegment = 'loans';
  
  // Member data
  memberLoans: Loan[] = [];
  memberReservations: Reservation[] = [];
  
  // Librarian/Admin data
  pendingLoans: Loan[] = [];
  pendingReservations: Reservation[] = [];
  
  isLoading = true;

  constructor(
    private authService: AuthService,
    private loanService: LoanService
  ) {    addIcons({ 
      bookOutline, 
      timeOutline, 
      checkmarkCircleOutline, 
      closeCircleOutline,
      hourglass,
      returnDownBack,
      analyticsOutline,
      personCircleOutline,
      libraryOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    if (!this.currentUser) return;

    if (this.currentUser.role === 'member') {
      this.loadMemberData();
    } else {
      this.loadLibrarianData();
    }
  }

  loadMemberData() {
    this.loanService.getMemberLoans().subscribe({
      next: (loans) => {
        this.memberLoans = loans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading member loans:', error);
        this.isLoading = false;
      }
    });

    this.loanService.getMemberReservations().subscribe({
      next: (reservations) => {
        this.memberReservations = reservations;
      },
      error: (error) => {
        console.error('Error loading member reservations:', error);
      }
    });
  }

  loadLibrarianData() {
    this.loanService.getPendingLoans().subscribe({
      next: (loans) => {
        this.pendingLoans = loans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending loans:', error);
        this.isLoading = false;
      }
    });

    this.loanService.getPendingReservations().subscribe({
      next: (reservations) => {
        this.pendingReservations = reservations;
      },
      error: (error) => {
        console.error('Error loading pending reservations:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      case 'active': return 'primary';
      case 'completed': return 'medium';
      case 'expired': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved': return 'Approvato';
      case 'rejected': return 'Rifiutato';
      case 'pending': return 'In Attesa';
      case 'active': return 'Attivo';
      case 'completed': return 'Completato';
      case 'expired': return 'Scaduto';
      default: return status;
    }
  }

  approveLoan(loanId: number) {
    this.loanService.updateLoanStatus(loanId, { status: 'approved' }).subscribe({
      next: () => {
        this.loadLibrarianData();
      },
      error: (error) => {
        console.error('Error approving loan:', error);
      }
    });
  }

  rejectLoan(loanId: number) {
    this.loanService.updateLoanStatus(loanId, { status: 'rejected' }).subscribe({
      next: () => {
        this.loadLibrarianData();
      },
      error: (error) => {
        console.error('Error rejecting loan:', error);
      }
    });
  }

  approveReservation(reservationId: number) {
    this.loanService.updateReservationStatus(reservationId, { status: 'approved' }).subscribe({
      next: () => {
        this.loadLibrarianData();
      },
      error: (error) => {
        console.error('Error approving reservation:', error);
      }
    });
  }

  rejectReservation(reservationId: number) {
    this.loanService.updateReservationStatus(reservationId, { status: 'rejected' }).subscribe({
      next: () => {
        this.loadLibrarianData();
      },
      error: (error) => {
        console.error('Error rejecting reservation:', error);
      }
    });
  }

  returnBook(loanId: number) {
    this.loanService.returnBook({ loan_id: loanId }).subscribe({
      next: () => {
        this.loadMemberData();
      },
      error: (error) => {
        console.error('Error returning book:', error);
      }
    });
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
