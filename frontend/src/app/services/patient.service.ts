import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, Referral, Note, Appointment } from '../models/patient.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Health check to wake up paused SQL Serverless database
  checkHealth(): Observable<{ status: string; database: string }> {
    return this.http.get<{ status: string; database: string }>(`${this.apiUrl}/health`);
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/patients`);
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`);
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients`, patient);
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/patients/${id}`, patient);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/patients/${id}`);
  }

  getReferrals(patientId: number): Observable<Referral[]> {
    return this.http.get<Referral[]>(`${this.apiUrl}/patients/${patientId}/referrals`);
  }

  createReferral(patientId: number, referral: Partial<Referral>): Observable<Referral> {
    return this.http.post<Referral>(`${this.apiUrl}/patients/${patientId}/referrals`, referral);
  }

  getReferralByToken(token: string): Observable<Referral> {
    return this.http.get<Referral>(`${this.apiUrl}/referrals/${token}`);
  }

  getAppointments(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/patients/${patientId}/appointments`);
  }

  createAppointment(patientId: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/patients/${patientId}/appointments`, appointment);
  }
}

