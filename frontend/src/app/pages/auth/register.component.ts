import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=90"
             class="w-full h-full object-cover" alt="Modern Apartment">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/85 to-purple-900/70"></div>
        <div class="absolute inset-0 flex flex-col justify-between p-12">
          <div class="flex items-center gap-3">
            <div class="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <span class="material-icons text-white text-2xl">apartment</span>
            </div>
            <span class="text-white font-bold text-xl">ApartmentHub</span>
          </div>
          <div>
            <h2 class="text-white text-4xl font-bold leading-tight mb-4">Start Your Journey<br>to Dream Living</h2>
            <p class="text-white/70 text-lg mb-6">Join our community of happy residents.</p>
            <div class="space-y-3">
              @for (f of features; track f.icon) {
                <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <span class="material-icons text-white">{{f.icon}}</span>
                  <span class="text-white/90 text-sm">{{f.text}}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div class="w-full max-w-md">
          <div class="lg:hidden flex items-center gap-2 mb-8">
            <div class="bg-blue-600 p-2 rounded-xl">
              <span class="material-icons text-white">apartment</span>
            </div>
            <span class="font-bold text-xl">ApartmentHub</span>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
          <p class="text-gray-500 mb-8">Fill in your details to get started</p>

          @if (error) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span class="material-icons text-sm">error_outline</span> {{error}}
            </div>
          }

          <form (ngSubmit)="onRegister()">
            <div class="mb-4">
              <label class="form-label">Full Name</label>
              <input type="text" [(ngModel)]="form.full_name" name="full_name" required
                     class="form-input" placeholder="John Smith">
            </div>
            <div class="mb-4">
              <label class="form-label">Email Address</label>
              <input type="email" [(ngModel)]="form.email" name="email" required
                     class="form-input" placeholder="you&#64;example.com">
            </div>
            <div class="mb-4">
              <label class="form-label">Phone <span class="text-gray-400 font-normal">(optional)</span></label>
              <input type="tel" [(ngModel)]="form.phone" name="phone"
                     class="form-input" placeholder="+91 98765 43210">
            </div>
            <div class="mb-4">
              <label class="form-label">Password</label>
              <div class="relative">
                <input [type]="showPass?'text':'password'" [(ngModel)]="form.password"
                       name="password" required minlength="6" class="form-input pr-10" placeholder="Min 6 characters">
                <button type="button" (click)="showPass=!showPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <span class="material-icons text-sm">{{showPass?'visibility_off':'visibility'}}</span>
                </button>
              </div>
            </div>
            <div class="mb-6">
              <label class="form-label">Confirm Password</label>
              <input [type]="showPass?'text':'password'" [(ngModel)]="confirm" name="confirm"
                     required class="form-input" placeholder="Re-enter password">
              @if (confirm && form.password !== confirm) {
                <p class="text-red-500 text-xs mt-1">Passwords do not match</p>
              }
            </div>
            <button type="submit" [disabled]="loading || form.password !== confirm"
              class="btn-primary w-full flex justify-center items-center gap-2 py-3">
              @if (loading) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              }
              Create Account
            </button>
          </form>
          <p class="text-center text-sm text-gray-500 mt-6">
            Already have an account?
            <a routerLink="/login" class="text-blue-600 hover:underline font-semibold">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  form = { full_name: '', email: '', phone: '', password: '' };
  confirm = ''; loading = false; error = ''; showPass = false;
  features = [
    { icon: 'search',           text: 'Browse 10+ premium flats across 3 towers' },
    { icon: 'event_available',  text: 'Request viewings online instantly' },
    { icon: 'notifications',    text: 'Get real-time booking status updates' },
    { icon: 'security',         text: 'Secure JWT-protected account' }
  ];
  onRegister() {
    if (!this.form.full_name || !this.form.email || !this.form.password) return;
    if (this.form.password !== this.confirm) return;
    this.loading = true; this.error = '';
    this.auth.register(this.form).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: (err:any) => { this.loading = false; this.error = err.error?.error || 'Registration failed'; }
    });
  }
}
