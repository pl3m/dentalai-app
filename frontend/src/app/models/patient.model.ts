export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  chiefComplaint?: string;
  symptoms?: string;
  toothNotation?: string;
  createdAt: string;
  updatedAt: string;
  referrals?: Referral[];
  notes?: Note[];
  appointments?: Appointment[];
}

export interface Referral {
  id: number;
  patientId: number;
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  referrerPracticeName: string;
  reason: string;
  referredDate: string;
  accessToken?: string;
  accessTokenExpiry?: string;
  createdAt: string;
}

export interface Note {
  id: number;
  patientId: number;
  content: string;
  summary?: string;
  letter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  appointmentDateTime: string;
  type: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

