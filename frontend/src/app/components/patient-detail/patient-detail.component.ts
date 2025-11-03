import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { NoteService } from '../../services/note.service';
import { Patient, Note } from '../../models/patient.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <div class="header-actions">
        <a routerLink="/" class="back-link">← Back to Patients</a>
      </div>

      @if (loading()) {
        <p>Loading patient...</p>
      } @else if (error()) {
        <p class="error">Error: {{ error() }}</p>
      } @else if (patient()) {
        <div class="patient-detail">
          <div class="section">
            <h2>Patient Information</h2>
            <div class="info-grid">
              <div>
                <strong>Name:</strong> {{ patient()!.firstName }} {{ patient()!.lastName }}
              </div>
              @if (patient()!.email) {
                <div><strong>Email:</strong> {{ patient()!.email }}</div>
              }
              @if (patient()!.phone) {
                <div><strong>Phone:</strong> {{ patient()!.phone }}</div>
              }
              @if (patient()!.dateOfBirth) {
                <div><strong>Date of Birth:</strong> {{ patient()!.dateOfBirth }}</div>
              }
              @if (patient()!.chiefComplaint) {
                <div><strong>Chief Complaint:</strong> {{ patient()!.chiefComplaint }}</div>
              }
              @if (patient()!.toothNotation) {
                <div><strong>Affected Teeth:</strong> {{ patient()!.toothNotation }}</div>
              }
            </div>
          </div>

          <!-- Notes Section -->
          <div class="section">
            <div class="section-header">
              <h2>Clinical Notes</h2>
              <button (click)="showCreateNote = !showCreateNote" class="btn btn-primary">
                {{ showCreateNote ? 'Cancel' : '+ New Note' }}
              </button>
            </div>

            @if (showCreateNote) {
              <div class="note-form">
                <form [formGroup]="noteForm" (ngSubmit)="createNote()">
                  <div class="form-group">
                    <label for="content">Clinical Notes *</label>
                    <textarea
                      id="content"
                      formControlName="content"
                      rows="6"
                      placeholder="Enter clinical notes here..."
                      class="form-control"
                    ></textarea>
                    @if (noteForm.get('content')?.hasError('required') && noteForm.get('content')?.touched) {
                      <span class="error-text">Content is required</span>
                    }
                  </div>
                  <div class="form-actions">
                    <button type="submit" [disabled]="noteForm.invalid || creatingNote()" class="btn btn-primary">
                      {{ creatingNote() ? 'Creating...' : 'Create Note' }}
                    </button>
                    @if (noteForm.get('content')?.value && noteForm.get('content')!.value.trim().length > 50) {
                      <button type="button" (click)="createAndSummarize()" [disabled]="noteForm.invalid || creatingNote() || summarizing()" class="btn btn-secondary">
                        {{ summarizing() ? 'Summarizing...' : 'Create & Summarize with AI' }}
                      </button>
                    }
                  </div>
                </form>
              </div>
            }

            @if (loadingNotes()) {
              <p>Loading notes...</p>
            } @else if (notesError()) {
              <p class="error">{{ notesError() }}</p>
            } @else if (notes().length === 0) {
              <p class="empty-state">No notes found. Create your first note above.</p>
            } @else {
              @for (note of notes(); track note.id) {
                <div class="note-card">
                  <div class="note-header">
                    <div>
                      <span class="note-date">{{ note.createdAt | date:'short' }}</span>
                      @if (note.updatedAt !== note.createdAt) {
                        <span class="note-updated">Updated: {{ note.updatedAt | date:'short' }}</span>
                      }
                    </div>
                    @if (editingNoteId() !== note.id) {
                      <div class="note-header-actions">
                        <button
                          (click)="startEditNote(note)"
                          class="btn btn-sm"
                          style="background: #28a745; color: white; margin-right: 0.5rem;"
                        >
                          Edit
                        </button>
                        <button
                          (click)="deleteNote(note)"
                          [disabled]="deletingNote()"
                          class="btn btn-sm"
                          style="background: #dc3545; color: white;"
                        >
                          {{ deletingNote() ? 'Deleting...' : 'Delete' }}
                        </button>
                      </div>
                    }
                  </div>
                  
                  @if (editingNoteId() === note.id) {
                    <div class="note-edit-form">
                      <div class="form-group">
                        <label>Original Notes:</label>
                        <textarea
                          [(ngModel)]="editForms[note.id].content"
                          rows="6"
                          class="form-control"
                        ></textarea>
                      </div>
                      
                      @if (editForms[note.id].summary) {
                        <div class="form-group">
                          <label>SOAP Summary:</label>
                          <textarea
                            [(ngModel)]="editForms[note.id].summary"
                            rows="8"
                            class="form-control"
                          ></textarea>
                        </div>
                      }
                      
                      @if (editForms[note.id].letter) {
                        <div class="form-group">
                          <label>Referrer Letter:</label>
                          <textarea
                            [(ngModel)]="editForms[note.id].letter"
                            rows="10"
                            class="form-control"
                          ></textarea>
                        </div>
                      }
                      
                      <div class="form-actions">
                        <button
                          (click)="updateNote(note)"
                          [disabled]="updatingNote()"
                          class="btn btn-primary"
                        >
                          {{ updatingNote() ? 'Saving...' : 'Save Changes' }}
                        </button>
                        <button
                          (click)="cancelEditNote()"
                          [disabled]="updatingNote()"
                          class="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="note-content">
                      <h4>Original Notes:</h4>
                      <pre class="note-text">{{ note.content }}</pre>
                    </div>
                  }

                  @if (editingNoteId() !== note.id) {
                    @if (note.summary) {
                      <div class="note-summary">
                        <h4>SOAP Summary:</h4>
                        <pre class="note-text">{{ note.summary }}</pre>
                      </div>
                    } @else {
                      <div class="note-actions">
                        <button
                          (click)="summarizeNote(note)"
                          [disabled]="summarizing()"
                          class="btn btn-sm btn-secondary"
                        >
                          {{ summarizing() ? 'Summarizing...' : 'Generate SOAP Summary (AI)' }}
                        </button>
                      </div>
                    }

                    @if (note.summary && !note.letter) {
                    <div class="letter-section">
                      <div class="form-group">
                        <label for="referrerName{{ note.id }}">Referrer Name *</label>
                        <input
                          type="text"
                          id="referrerName{{ note.id }}"
                          [(ngModel)]="letterForms[note.id].referrerName"
                          placeholder="Dr. John Smith"
                          class="form-control"
                        />
                      </div>
                      <div class="form-group">
                        <label for="referrerAddress{{ note.id }}">Referrer Address</label>
                        <textarea
                          id="referrerAddress{{ note.id }}"
                          [(ngModel)]="letterForms[note.id].referrerAddress"
                          rows="2"
                          placeholder="123 Main St, City, State ZIP"
                          class="form-control"
                        ></textarea>
                      </div>
                      <button
                        (click)="generateLetter(note)"
                        [disabled]="generatingLetter() || !letterForms[note.id].referrerName"
                        class="btn btn-sm btn-secondary"
                      >
                        {{ generatingLetter() ? 'Generating...' : 'Generate Referrer Letter (AI)' }}
                      </button>
                    </div>
                  }

                    @if (note.letter) {
                      <div class="note-letter">
                        <h4>Referrer Letter:</h4>
                        <pre class="note-text">{{ note.letter }}</pre>
                      </div>
                    }
                  }
                </div>
              }
            }
          </div>

          @if (patient()!.referrals && patient()!.referrals!.length > 0) {
            <div class="section">
              <h2>Referrals</h2>
              @for (referral of patient()!.referrals!; track referral.id) {
                <div class="referral-card">
                  <p><strong>{{ referral.referrerName }}</strong> - {{ referral.referrerPracticeName }}</p>
                  <p>{{ referral.reason }}</p>
                  @if (referral.accessToken) {
                    <p class="token">Access Token: <code>{{ referral.accessToken }}</code></p>
                  }
                </div>
              }
            </div>
          }

          @if (patient()!.appointments && patient()!.appointments!.length > 0) {
            <div class="section">
              <h2>Appointments</h2>
              @for (appt of patient()!.appointments!; track appt.id) {
                <div class="appointment-card">
                  <p><strong>{{ appt.type }}</strong> - {{ appt.appointmentDateTime | date:'short' }}</p>
                  <p>Status: {{ appt.status }}</p>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-actions {
      margin-bottom: 1.5rem;
    }

    .back-link {
      color: #007bff;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .patient-detail {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      h2 {
        margin-top: 0;
        color: #333;
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;

      div {
        padding: 0.5rem 0;
      }
    }

    .note-form {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
      }

      textarea.form-control {
        resize: vertical;
        min-height: 100px;
      }

      .error-text {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .note-card {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border-left: 4px solid #007bff;
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #666;
    }

    .note-header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .note-edit-form {
      background: #fff;
      padding: 1.5rem;
      border-radius: 4px;
      border: 2px solid #007bff;
      margin-bottom: 1rem;
    }

    .note-content,
    .note-summary,
    .note-letter {
      margin-bottom: 1rem;

      h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .note-text {
      background: white;
      padding: 1rem;
      border-radius: 4px;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
      font-family: inherit;
      font-size: 0.9375rem;
      line-height: 1.6;
      border: 1px solid #e0e0e0;
    }

    .note-actions,
    .letter-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .letter-section {
      background: #fff;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    }

    .btn-primary {
      background: #007bff;
      color: white;

      &:not(:disabled):hover {
        background: #0056b3;
      }
    }

    .btn-secondary {
      background: #6c757d;
      color: white;

      &:not(:disabled):hover {
        background: #5a6268;
      }
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .referral-card,
    .appointment-card {
      background: #f9f9f9;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;

      p {
        margin: 0.5rem 0;
      }

      .token {
        font-size: 0.875rem;
        color: #666;

        code {
          background: #e9ecef;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-family: monospace;
        }
      }
    }

    .error {
      color: #dc3545;
      padding: 1rem;
      background: #f8d7da;
      border-radius: 4px;
    }

    .empty-state {
      color: #666;
      font-style: italic;
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  private patientService = inject(PatientService);
  private noteService = inject(NoteService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  patient = signal<Patient | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  
  notes = signal<Note[]>([]);
  loadingNotes = signal(false);
  notesError = signal<string | null>(null);
  
  creatingNote = signal(false);
  summarizing = signal(false);
  generatingLetter = signal(false);
  deletingNote = signal(false);
  updatingNote = signal(false);
  
  showCreateNote = false;
  editingNoteId = signal<number | null>(null);
  letterForms: { [noteId: number]: { referrerName: string; referrerAddress: string } } = {};
  editForms: { [noteId: number]: { content: string; summary: string; letter: string } } = {};
  
  noteForm: FormGroup;

  constructor() {
    this.noteForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPatient(+id);
      this.loadNotes(+id);
    }
  }

  loadPatient(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.patientService.getPatient(id).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load patient');
        this.loading.set(false);
      }
    });
  }

  loadNotes(patientId: number): void {
    this.loadingNotes.set(true);
    this.notesError.set(null);
    
    this.noteService.getNotes(patientId).subscribe({
      next: (notes) => {
        this.notes.set(notes);
        // Initialize letter forms for notes without letters
        notes.forEach(note => {
          if (!this.letterForms[note.id]) {
            this.letterForms[note.id] = { referrerName: '', referrerAddress: '' };
          }
          // Initialize edit forms
          if (!this.editForms[note.id]) {
            this.editForms[note.id] = {
              content: note.content || '',
              summary: note.summary || '',
              letter: note.letter || ''
            };
          }
        });
        this.loadingNotes.set(false);
      },
      error: (err) => {
        this.notesError.set(err.message || 'Failed to load notes');
        this.loadingNotes.set(false);
      }
    });
  }

  createNote(): void {
    if (this.noteForm.invalid || !this.patient()) return;
    
    this.creatingNote.set(true);
    const content = this.noteForm.get('content')?.value;
    
    this.noteService.createNote(this.patient()!.id, { content }).subscribe({
      next: (note) => {
        this.notes.update(notes => [note, ...notes]);
        this.noteForm.reset();
        this.showCreateNote = false;
        this.creatingNote.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to create note';
        this.notesError.set(errorMessage);
        this.creatingNote.set(false);
      }
    });
  }

  createAndSummarize(): void {
    if (this.noteForm.invalid || !this.patient()) return;
    
    this.creatingNote.set(true);
    this.summarizing.set(true);
    const content = this.noteForm.get('content')?.value;
    
    this.noteService.createNote(this.patient()!.id, { content }).subscribe({
      next: (note) => {
        this.notes.update(notes => [note, ...notes]);
        
        // Now summarize
        this.noteService.summarizeNotes({ noteContent: content, noteId: note.id }).subscribe({
          next: (response) => {
            // Reload notes to get updated summary
            this.loadNotes(this.patient()!.id);
            this.noteForm.reset();
            this.showCreateNote = false;
            this.summarizing.set(false);
            this.creatingNote.set(false);
          },
          error: (err) => {
            const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to summarize note';
            this.notesError.set(errorMessage);
            this.summarizing.set(false);
            this.creatingNote.set(false);
          }
        });
      },
      error: (err) => {
        this.notesError.set(err.message || 'Failed to create note');
        this.creatingNote.set(false);
        this.summarizing.set(false);
      }
    });
  }

  summarizeNote(note: Note): void {
    this.summarizing.set(true);
    this.notesError.set(null);
    
    this.noteService.summarizeNotes({ noteContent: note.content, noteId: note.id }).subscribe({
      next: () => {
        // Reload notes to get updated summary
        this.loadNotes(this.patient()!.id);
        this.summarizing.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to summarize note';
        this.notesError.set(errorMessage);
        this.summarizing.set(false);
      }
    });
  }

  generateLetter(note: Note): void {
    if (!this.letterForms[note.id]?.referrerName || !note.summary) return;
    
    this.generatingLetter.set(true);
    this.notesError.set(null);
    const form = this.letterForms[note.id];
    
    this.noteService.generateLetter({
      soapSummary: note.summary,
      referrerName: form.referrerName,
      referrerAddress: form.referrerAddress || undefined,
      noteId: note.id
    }).subscribe({
      next: () => {
        // Reload notes to get updated letter
        this.loadNotes(this.patient()!.id);
        this.generatingLetter.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to generate letter';
        this.notesError.set(errorMessage);
        this.generatingLetter.set(false);
      }
    });
  }

  startEditNote(note: Note): void {
    this.editingNoteId.set(note.id);
    // Initialize edit form with current note values
    this.editForms[note.id] = {
      content: note.content || '',
      summary: note.summary || '',
      letter: note.letter || ''
    };
  }

  cancelEditNote(): void {
    this.editingNoteId.set(null);
  }

  updateNote(note: Note): void {
    if (!this.editForms[note.id]) return;
    
    this.updatingNote.set(true);
    this.notesError.set(null);
    
    const updatedNote = {
      content: this.editForms[note.id].content,
      summary: this.editForms[note.id].summary,
      letter: this.editForms[note.id].letter
    };
    
    this.noteService.updateNote(note.id, updatedNote).subscribe({
      next: () => {
        this.loadNotes(this.patient()!.id);
        this.editingNoteId.set(null);
        this.updatingNote.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to update note';
        this.notesError.set(errorMessage);
        this.updatingNote.set(false);
      }
    });
  }

  deleteNote(note: Note): void {
    if (!confirm(`Are you sure you want to delete this note? This action cannot be undone.`)) {
      return;
    }
    
    this.deletingNote.set(true);
    this.notesError.set(null);
    
    this.noteService.deleteNote(note.id).subscribe({
      next: () => {
        this.notes.update(notes => notes.filter(n => n.id !== note.id));
        delete this.editForms[note.id];
        delete this.letterForms[note.id];
        this.deletingNote.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.error || err.error?.message || err.message || 'Failed to delete note';
        this.notesError.set(errorMessage);
        this.deletingNote.set(false);
      }
    });
  }
}
