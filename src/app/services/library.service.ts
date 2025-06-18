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

  // Get all libraries
  getLibraries(): Observable<ApiResponse<Library[]>> {
    return this.http.get<ApiResponse<Library[]>>('/api/libraries');
  }

  // Get library details
  getLibrary(libraryId: number): Observable<ApiResponse<Library>> {
    return this.http.get<ApiResponse<Library>>(`/api/libraries/${libraryId}`);
  }

  // Get books in a library
  getLibraryBooks(libraryId: number): Observable<ApiResponse<LibraryBook[]>> {
    return this.http.get<ApiResponse<LibraryBook[]>>(`/api/libraries/${libraryId}/books`);
  }

  // Get all books in catalog
  getAllBooks(): Observable<ApiResponse<Book[]>> {
    return this.http.get<ApiResponse<Book[]>>('/api/books');
  }

  // Add new book to catalog
  addBook(book: Partial<Book>): Observable<any> {
    return this.http.post('/api/books', book);
  }

  // Add existing book to library
  addBookToLibrary(libraryId: number, bookId: number, copies: number): Observable<any> {
    return this.http.post(`/api/libraries/${libraryId}/books`, {
      book_id: bookId,
      copies: copies
    });
  }

  // Add new book and copies to library
  addNewBookToLibrary(libraryId: number, bookData: any): Observable<any> {
    return this.http.post(`/api/libraries/${libraryId}/books/new`, bookData);
  }
}
