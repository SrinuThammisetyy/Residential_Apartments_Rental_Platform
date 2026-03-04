import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <!-- Left panel with photo -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=90"
             class="w-full h-full object-cover" alt="Apartment">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/85 to-indigo-900/70"></div>
        <div class="absolute inset-0 flex flex-col justify-between p-12">
          <div class="flex items-center gap-3">
            <div class="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <span class="material-icons text-white text-2xl">apartment</span>
            </div>
            <span class="text-white font-bold text-xl">ApartmentHub</span>
          </div>
          <div>
            <h2 class="text-white text-4xl font-bold leading-tight mb-4">
              Find Your Perfect<br>Home Today
            </h2>
            <p class="text-white/70 text-lg mb-8">Premium apartments across 3 towers with world-class amenities.</p>
            <div class="grid grid-cols-3 gap-4">
              @for (s of stats; track s.label) {
                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div class="text-white text-2xl font-bold">{{s.value}}</div>
                  <div class="text-white/60 text-xs mt-1">{{s.label}}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Right: login form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div class="w-full max-w-md">

          <div class="lg:hidden flex items-center gap-2 mb-8">
            <div class="bg-blue-600 p-2 rounded-xl">
              <span class="material-icons text-white">apartment</span>
            </div>
            <span class="font-bold text-xl text-gray-900">ApartmentHub</span>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p class="text-gray-500 mb-8">Sign in to your account to continue</p>

          @if (error) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span class="material-icons text-sm">error_outline</span> {{error}}
            </div>
          }

          <form (ngSubmit)="onLogin()">
            <div class="mb-4">
              <label class="form-label">Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" required
                     class="form-input" placeholder="you&#64;example.com">
            </div>
            <div class="mb-6">
              <label class="form-label">Password</label>
              <div class="relative">
                <input [type]="showPass?'text':'password'" [(ngModel)]="password"
                       name="password" required class="form-input pr-10" placeholder="••••••••">
                <button type="button" (click)="showPass=!showPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <span class="material-icons text-sm">{{showPass?'visibility_off':'visibility'}}</span>
                </button>
              </div>
            </div>
            <button type="submit" [disabled]="loading" class="btn-primary w-full flex justify-center items-center gap-2 py-3">
              @if (loading) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              }
              Sign In
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-blue-600 hover:underline font-semibold">Create account</a>
          </p>

          <!-- Demo credentials -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-xs text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">Quick Demo Login</p>
            <div class="grid grid-cols-2 gap-3">
              <button (click)="setDemo('user')"
                class="flex items-center gap-3 border-2 border-gray-200 hover:border-blue-300
                       hover:bg-blue-50 rounded-xl p-3 transition-all text-left group">
                <div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-blue-600 text-base">person</span>
                </div>
                <div>
                  <div class="text-xs font-bold text-gray-700">User Login</div>
                  <div class="text-xs text-gray-400">Resident portal</div>
                </div>
              </button>
              <button (click)="setDemo('admin')"
                class="flex items-center gap-3 border-2 border-gray-200 hover:border-purple-300
                       hover:bg-purple-50 rounded-xl p-3 transition-all text-left group">
                <div class="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-purple-600 text-base">admin_panel_settings</span>
                </div>
                <div>
                  <div class="text-xs font-bold text-gray-700">Admin Login</div>
                  <div class="text-xs text-gray-400">Management portal</div>
                </div>
              </button>
            </div>
            <p class="text-xs text-gray-400 text-center mt-2">
              Password: <code class="bg-gray-100 px-1.5 py-0.5 rounded">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; loading = false; error = ''; showPass = false;
  stats = [
    { value: '10+', label: 'Units Available' },
    { value: '3',   label: 'Premium Towers' },
    { value: '8+',  label: 'Amenities' }
  ];
  setDemo(role: string) {
    this.email    = role === 'admin' ? 'admin@apartment.com' : 'user@apartment.com';
    this.password = 'password123';
  }
  onLogin() {
    if (!this.email || !this.password) return;
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res:any) => { this.loading = false; this.router.navigate([res.user.role === 'admin' ? '/admin' : '/dashboard']); },
      error: (err:any) => { this.loading = false; this.error = err.error?.error || 'Login failed'; }
    });
  }
}
