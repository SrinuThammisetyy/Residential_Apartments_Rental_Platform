import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Angular 20 functional guard — protects user routes
export const authGuard: CanActivateFn = () => {
  if (localStorage.getItem('token')) return true;
  inject(Router).navigate(['/login']);
  return false;
};

// Angular 20 functional guard — protects admin routes
export const adminGuard: CanActivateFn = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.role === 'admin') return true;
  inject(Router).navigate(['/login']);
  return false;
};

// Prevent logged-in users from seeing login/register
export const guestGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return true;
  inject(Router).navigate([user?.role === 'admin' ? '/admin' : '/dashboard']);
  return false;
};
