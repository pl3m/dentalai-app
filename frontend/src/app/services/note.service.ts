import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../models/patient.model';
import { environment } from '../../environments/environment';

export interface SummarizeRequest {
  noteContent: string;
  noteId?: number;
}

export interface SummarizeResponse {
  summary: string;
}

export interface LetterRequest {
  soapSummary: string;
  referrerName: string;
  referrerAddress?: string;
  noteId?: number;
  patientName?: string;
}

export interface LetterResponse {
  letter: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getNotes(patientId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/patients/${patientId}/notes`);
  }

  getNote(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/notes/${id}`);
  }

  createNote(patientId: number, note: Partial<Note>): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/patients/${patientId}/notes`, note);
  }

  updateNote(id: number, note: Partial<Note>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notes/${id}`, note);
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notes/${id}`);
  }

  summarizeNotes(request: SummarizeRequest): Observable<SummarizeResponse> {
    return this.http.post<SummarizeResponse>(`${this.apiUrl}/ai/summarize`, request);
  }

  generateLetter(request: LetterRequest): Observable<LetterResponse> {
    return this.http.post<LetterResponse>(`${this.apiUrl}/ai/letter`, request);
  }
}

