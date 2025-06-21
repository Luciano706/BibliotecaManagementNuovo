import { Routes } from '@angular/router';
import { ControlloAccesso, AreaPrivataControlloAccesso } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [ControlloAccesso]
  },
  {
    path: 'catalog',
    loadComponent: () => import('./catalog/catalog.page').then(m => m.CatalogPage),
    canActivate: [ControlloAccesso]
  },
  {
    path: 'libraries',
    loadComponent: () => import('./libraries/libraries.page').then(m => m.LibrariesPage),
    canActivate: [ControlloAccesso]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [ControlloAccesso]
  },
  {
    path: 'manage-books',
    loadComponent: () => import('./manage-books/manage-books.page').then(m => m.ManageBooksPage),
    canActivate: [ControlloAccesso, AreaPrivataControlloAccesso]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
