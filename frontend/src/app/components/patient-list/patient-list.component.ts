import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h1>Patients</h1>
      
      <button (click)="showForm.set(!showForm())" class="btn-primary">
        {{ showForm() ? 'Cancel' : 'Add Patient' }}
      </button>

      @if (showForm()) {
        <div class="form-card">
          <h2>New Patient</h2>
          <form (ngSubmit)="onSubmit()" #patientForm="ngForm">
            <div class="form-group">
              <label>First Name *</label>
              <input [(ngModel)]="newPatient.firstName" name="firstName" required />
            </div>
            <div class="form-group">
              <label>Last Name *</label>
              <input [(ngModel)]="newPatient.lastName" name="lastName" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="newPatient.email" name="email" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input [(ngModel)]="newPatient.phone" name="phone" />
            </div>
            <div class="form-actions">
              <button type="submit" [disabled]="!patientForm.valid">Create</button>
              <button type="button" (click)="showForm.set(false)">Cancel</button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <p>Loading patients...</p>
      } @else if (error()) {
        <p class="error">Error: {{ error() }}</p>
      } @else {
        <div class="patient-grid">
          @for (patient of patients(); track patient.id) {
            <div class="patient-card" [routerLink]="['/patients', patient.id]">
              <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
              @if (patient.email) {
                <p>{{ patient.email }}</p>
              }
              @if (patient.phone) {
                <p>{{ patient.phone }}</p>
              }
              @if (patient.chiefComplaint) {
                <p class="complaint">{{ patient.chiefComplaint }}</p>
              }
            </div>
          } @empty {
            <p>No patients found. Add your first patient above.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 1.5rem;
      color: #2d3748;
      font-weight: 600;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 1.5rem;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .form-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .form-card h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #2d3748;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #4a5568;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .form-actions button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .form-actions button[type="submit"] {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .form-actions button[type="submit"]:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .form-actions button[type="button"] {
      background: #e2e8f0;
      color: #4a5568;
    }

    .form-actions button[type="button"]:hover {
      background: #cbd5e0;
    }

    .form-actions button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .patient-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .patient-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border-left: 4px solid #667eea;
    }

    .patient-card:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
      border-left-color: #764ba2;
    }

    .patient-card h3 {
      margin: 0 0 0.75rem 0;
      color: #2d3748;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .patient-card p {
      margin: 0.5rem 0;
      color: #718096;
      font-size: 0.9375rem;
    }

    .complaint {
      font-style: italic;
      color: #667eea;
      margin-top: 0.75rem;
      padding: 0.5rem;
      background: #f7fafc;
      border-radius: 6px;
      border-left: 3px solid #667eea;
    }

    .error {
      color: #e53e3e;
      padding: 1rem 1.5rem;
      background: #fed7d7;
      border-radius: 8px;
      border-left: 4px solid #e53e3e;
      margin: 1rem 0;
    }

    p {
      color: #718096;
      line-height: 1.6;
    }
  `]
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  
  patients = signal<Patient[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  
  newPatient: Partial<Patient> = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading.set(true);
    this.error.set(null);
    
    // First wake up the database, then load patients
    this.patientService.checkHealth().subscribe({
      next: () => {
        // Database is awake, now load patients
        this.patientService.getPatients().subscribe({
          next: (patients) => {
            this.patients.set(patients);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.message || 'Failed to load patients');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        // Health check failed, but try loading patients anyway
        this.patientService.getPatients().subscribe({
          next: (patients) => {
            this.patients.set(patients);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.message || 'Failed to load patients');
            this.loading.set(false);
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.patientService.createPatient(this.newPatient).subscribe({
      next: () => {
        this.showForm.set(false);
        this.newPatient = { firstName: '', lastName: '', email: '', phone: '' };
        this.loadPatients();
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to create patient');
      }
    });
  }
}

