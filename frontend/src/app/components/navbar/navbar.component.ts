import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <div class="flex items-center gap-8">
            <a [routerLink]="auth.isAdmin() ? '/admin' : '/dashboard'"
               class="flex items-center gap-2.5">
              <div class="bg-blue-600 p-1.5 rounded-lg">
                <span class="material-icons text-white" style="font-size:20px">apartment</span>
              </div>
              <span class="font-bold text-lg text-gray-900">ApartmentHub</span>
              @if (auth.isAdmin()) {
                <span class="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
              }
            </a>

            <!-- Desktop nav links -->
            <div class="hidden md:flex items-center gap-1">
              @if (auth.isAdmin()) {
                @for (link of adminLinks; track link.route) {
                  <a [routerLink]="link.route"
                     routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                     [routerLinkActiveOptions]="{exact: !!link.exact}"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600
                            hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    <span class="material-icons" style="font-size:16px">{{link.icon}}</span>
                    {{link.label}}
                  </a>
                }
              } @else {
                @for (link of userLinks; track link.route) {
                  <a [routerLink]="link.route"
                     routerLinkActive="bg-blue-50 text-blue-700 font-semibold"
                     [routerLinkActiveOptions]="{exact: !!link.exact}"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600
                            hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    <span class="material-icons" style="font-size:16px">{{link.icon}}</span>
                    {{link.label}}
                  </a>
                }
              }
            </div>
          </div>

          <!-- User info + logout -->
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                          flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {{auth.currentUser()?.full_name?.charAt(0)?.toUpperCase()}}
              </div>
              <div class="text-sm leading-tight">
                <div class="font-semibold text-gray-800">{{auth.currentUser()?.full_name}}</div>
                <div class="text-gray-400 text-xs">{{auth.currentUser()?.email}}</div>
              </div>
            </div>
            <button (click)="auth.logout()"
              class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600
                     hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
              <span class="material-icons" style="font-size:16px">logout</span>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);

  userLinks = [
    { route: '/dashboard', label: 'Home',          icon: 'home',       exact: true },
    { route: '/units',     label: 'Browse Flats',  icon: 'search' },
    { route: '/bookings',  label: 'My Bookings',   icon: 'event_note' }
  ];
  adminLinks = [
    { route: '/admin',          label: 'Dashboard', icon: 'dashboard',       exact: true },
    { route: '/admin/towers',   label: 'Towers',    icon: 'business' },
    { route: '/admin/units',    label: 'Units',     icon: 'door_front' },
    { route: '/admin/bookings', label: 'Bookings',  icon: 'event' },
    { route: '/admin/tenants',  label: 'Tenants',   icon: 'people' },
    { route: '/admin/leases',   label: 'Leases',    icon: 'description' },
    { route: '/admin/payments', label: 'Payments',  icon: 'payments' }
  ];
}
