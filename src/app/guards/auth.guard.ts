import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ControlloAccesso implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAutenticato()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}


@Injectable({
  providedIn: 'root'
})
export class AreaPrivataControlloAccesso implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const ruolo=this.authService.getRuoloRaw();

    if (ruolo === 'admin' || ruolo === 'librarian') {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}
