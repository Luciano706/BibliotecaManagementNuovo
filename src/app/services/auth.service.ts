import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private utenteAttualeSubject = new BehaviorSubject<User | null>(null);
  private loggatoSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.verificaUtenteLoggato();
  }

  private verificaUtenteLoggato() {
    const storedUser = localStorage.getItem('utenteAttuale');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.utenteAttualeSubject.next(user);
      this.loggatoSubject.next(true);
    }
  }


  ottieniUtenteSubject$(): Observable<User | null> {
    return this.utenteAttualeSubject.asObservable();
  }

  ottieniLoggatoSubject$(): Observable<boolean> {
    return this.loggatoSubject.asObservable();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>('/api/login', credentials).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
          this.utenteAttualeSubject.next(response.data);
          this.loggatoSubject.next(true);
          localStorage.setItem('utenteAttuale', JSON.stringify(response.data));
          localStorage.setItem('timeLogin', Date.now().toString());
        }
      })
    );
  }

  registrati(userData: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('/api/register', userData);
  }

  logout() {
    localStorage.removeItem('utenteAttuale');
    localStorage.removeItem('timeLogin');
    this.utenteAttualeSubject.next(null);
    this.loggatoSubject.next(false);
    this.cancellaCookie('session');
  }

  private cancellaCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
  }

  private getCookie(name: string): string | null{
	const nameLenPlus = (name.length + 1);
	return document.cookie
		.split(';')
		.map(c => c.trim())
		.filter(cookie => {
			return cookie.substring(0, nameLenPlus) === `${name}=`;
		})
		.map(cookie => {
			return decodeURIComponent(cookie.substring(nameLenPlus));
		})[0] || null;
  }



  checkValiditaSessione(): boolean { //RIVEDERE
    const timeLogin = localStorage.getItem('timeLogin');
    if (timeLogin) {
      const loginTime = parseInt(timeLogin, 10);
      const durataSessione = Date.now() - loginTime;
      const timeOut = 3 * 60 * 60 * 1000; // 3 ore in millisecondi

      if (durataSessione > timeOut) {
        this.logout();
        return false;
      }
      if((this.getCookie('session')=== undefined || this.getCookie('session')=== null || this.getCookie('session')==="") && localStorage.getItem('utenteAttuale')!==null)
      {
        let user = this.getUsername();
        let password= JSON.parse(localStorage.getItem('utenteAttuale') || "").password;
        const loginRequest: LoginRequest  ={ username: this.getUsername(), password: password };
        this.login(loginRequest).subscribe({
          next: (response) => {
            if (response.status === 'success' && response.data) {
              this.utenteAttualeSubject.next(response.data);
              this.loggatoSubject.next(true);
              localStorage.setItem('utenteAttuale', JSON.stringify(response.data));
              localStorage.setItem('timeLogin', Date.now().toString());
            }
          },
          error: (error) => {
            console.error('Errore durante il rinnovo della sessione:', error);
            this.logout();
          }
        });

      }
    }
    return true;
  }

  ottieniUtenteAttuale(): User | null {
    return this.utenteAttualeSubject.value;
  }

  isAutenticato(): boolean {
    return this.utenteAttualeSubject.value !== null;
  }

  haRuolo(ruolos: string[]): boolean {
    const user = this.ottieniUtenteAttuale();
    return user ? ruolos.includes(user.role) : false;
  }

  public getRuoloRaw(): string {
    const jsonUser = localStorage.getItem('utenteAttuale');
    if (jsonUser) {
      return JSON.parse(jsonUser).role || '';
    } else {
      return '';
    }
  }

  public getRuolo(): string {
    const jsonUser = localStorage.getItem('utenteAttuale');
    if(jsonUser)
    {
      switch (JSON.parse(jsonUser).role) {
      case 'member': return 'Membro';
      case 'librarian': return 'Bibliotecario';
      case 'admin': return 'Amministratore';
      default: return "";
      }
    }
      
    else
      return "";
  }

  public getUsername(): string {
    const jsonUser = localStorage.getItem('utenteAttuale');
    if (jsonUser) {
      return JSON.parse(jsonUser).username || '';
    } else {
      return '';
    }
  }

  public getId(): number{
    const jsonUser = localStorage.getItem('utenteAttuale');
    
    if (jsonUser) {
      return parseInt(JSON.parse(jsonUser).id, 10);
    } else {
      return -1;
    } 
  }
}
