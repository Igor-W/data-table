import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/data-table-observables', pathMatch: 'full' },
  {
    path: 'data-table-observables',
    loadComponent: () => import('./data-table-observables').then((m) => m.DataTableObservables),
  },
  {
    path: 'data-table-signals',
    loadComponent: () => import('./data-table-signals').then((m) => m.DataTableSignals),
  },
];
