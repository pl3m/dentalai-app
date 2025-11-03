import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/patient-list/patient-list.component').then(m => m.PatientListComponent)
  },
  {
    path: 'patients/:id',
    loadComponent: () => import('./components/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
