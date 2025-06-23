import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Library, Book, LibraryBook } from '../models/library.model';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  constructor(private http: HttpClient) { }

  ottieniBiblioteche(): Observable<ApiResponse<Library[]>> {
    return this.http.get<ApiResponse<Library[]>>('/api/libraries');
  }

  // NON USATA ANCORA
  ottieniBiblioteca(idBiblioteca: number): Observable<ApiResponse<Library>> {
    return this.http.get<ApiResponse<Library>>(`/api/libraries/${idBiblioteca}`);
  }

  ottieniLibriBiblioteca(idBiblioteca: number): Observable<ApiResponse<LibraryBook[]>> {
    return this.http.get<ApiResponse<LibraryBook[]>>(`/api/libraries/${idBiblioteca}/books`);
  }

  ottieniTuttiLibri(): Observable<ApiResponse<Book[]>> {
    return this.http.get<ApiResponse<Book[]>>('/api/books');
  }

  aggiungiLibro(book: Partial<Book>): Observable<any> {
    return this.http.post('/api/books', book);
  }

  aggiungiLibroBiblioteca(idBiblioteca: number, idLibro: number, copie: number): Observable<any> {
    return this.http.post(`/api/libraries/${idBiblioteca}/books`, {
      book_id: idLibro,
      copies: copie
    });
  }

  aggiungiNuovoLibroBiblioteca(idBiblioteca: number, datiLibro: any): Observable<any> {
    return this.http.post(`/api/libraries/${idBiblioteca}/books/new`, datiLibro);
  }
}
