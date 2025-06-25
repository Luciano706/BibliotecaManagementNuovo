import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        if (error.status === 0) {
          console.error('Network error or CORS issue');
        } else if (error.status >= 400 && error.status < 500) {
          console.error('Client error:', error.error);
        } else if (error.status >= 500) {
          console.error('Server error:', error.error);
        }
        
        return throwError(() => error);
      })
    );
  }
}
