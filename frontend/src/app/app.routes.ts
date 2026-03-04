import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes (guests only)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
  },

  // User routes
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'units',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user/units/units.component').then(m => m.UnitsComponent)
  },
  {
    path: 'units/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user/unit-detail/unit-detail.component').then(m => m.UnitDetailComponent)
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user/bookings/bookings.component').then(m => m.BookingsComponent)
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/towers',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/towers/towers.component').then(m => m.TowersComponent)
  },
  {
    path: 'admin/units',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/units/admin-units.component').then(m => m.AdminUnitsComponent)
  },
  {
    path: 'admin/bookings',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent)
  },
  {
    path: 'admin/tenants',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/tenants/tenants.component').then(m => m.TenantsComponent)
  },
  {
    path: 'admin/leases',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/leases/leases.component').then(m => m.LeasesComponent)
  },
  {
    path: 'admin/payments',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/payments/payments.component').then(m => m.PaymentsComponent)
  },

  { path: '**', redirectTo: '/login' }
];
