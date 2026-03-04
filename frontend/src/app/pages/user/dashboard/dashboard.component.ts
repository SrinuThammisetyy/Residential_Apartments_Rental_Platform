import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />

    <!-- Hero Banner -->
    <div class="relative h-56 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80"
           class="w-full h-full object-cover" alt="Towers">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/60 flex items-center">
        <div class="max-w-7xl mx-auto px-6 w-full">
          <p class="text-blue-300 text-sm font-medium uppercase tracking-wide mb-1">Welcome back 👋</p>
          <h1 class="text-3xl font-bold text-white mb-2">{{auth.currentUser()?.full_name}}</h1>
          <p class="text-white/70 mb-4">Find your perfect apartment and track your bookings.</p>
          <a routerLink="/units"
             class="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold
                    px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
            <span class="material-icons text-base">search</span> Browse Available Flats
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Stats row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        @for (s of statCards; track s.label) {
          <div class="card p-5 flex items-center gap-4">
            <div [class]="'w-12 h-12 rounded-xl flex items-center justify-center ' + s.bg">
              <span class="material-icons" [class]="s.color">{{s.icon}}</span>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{s.value}}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{s.label}}</div>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Recent bookings -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">My Recent Bookings</h2>
            <a routerLink="/bookings" class="text-sm text-blue-600 hover:underline">View all →</a>
          </div>
          @if (bookingsLoading()) {
            <div class="card p-8 text-center">
              <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          } @else if (recentBookings().length === 0) {
            <div class="card p-10 text-center">
              <span class="material-icons text-gray-300 text-5xl">event_busy</span>
              <p class="text-gray-500 mt-3 font-medium">No bookings yet</p>
              <p class="text-gray-400 text-sm mt-1">Browse flats and request a viewing</p>
              <a routerLink="/units" class="btn-primary mt-4 inline-block">Browse Flats</a>
            </div>
          } @else {
            <div class="space-y-3">
              @for (b of recentBookings(); track b.id) {
                <div class="card p-4 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&q=70"
                         class="w-full h-full object-cover" alt="Unit">
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-semibold text-gray-900">Unit {{b.unit_number}}</p>
                      <span [class]="'badge badge-' + b.status">{{b.status}}</span>
                    </div>
                    <p class="text-sm text-gray-500 truncate">{{b.tower_name}} · {{b.visit_date || 'No visit date'}}</p>
                  </div>
                  <a routerLink="/bookings" class="text-blue-600">
                    <span class="material-icons text-sm">chevron_right</span>
                  </a>
                </div>
              }
            </div>
          }
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick actions -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-2">
              <a routerLink="/units"
                 class="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                <span class="material-icons text-blue-600">search</span>
                <div>
                  <div class="text-sm font-semibold text-blue-800">Browse Flats</div>
                  <div class="text-xs text-blue-500">{{availableCount()}} units available</div>
                </div>
                <span class="material-icons text-blue-400 text-sm ml-auto">arrow_forward</span>
              </a>
              <a routerLink="/bookings"
                 class="flex items-center gap-3 p-3 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors">
                <span class="material-icons text-yellow-600">event_note</span>
                <div>
                  <div class="text-sm font-semibold text-yellow-800">My Bookings</div>
                  <div class="text-xs text-yellow-500">{{pendingCount()}} pending</div>
                </div>
                <span class="material-icons text-yellow-400 text-sm ml-auto">arrow_forward</span>
              </a>
            </div>
          </div>

          <!-- Featured units -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Featured Units</h3>
            <div class="space-y-3">
              @for (u of featuredUnits(); track u.id; let i = $index) {
                <a [routerLink]="['/units', u.id]"
                   class="flex gap-3 hover:bg-gray-50 rounded-xl p-1 transition-colors group">
                  <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img [src]="photos[i % photos.length]"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                         alt="Unit">
                  </div>
                  <div class="flex-1 min-w-0 py-1">
                    <p class="font-semibold text-gray-900 text-sm">Unit {{u.unit_number}}</p>
                    <p class="text-xs text-gray-500 truncate">{{u.tower_name}} · {{u.bedrooms}} bed</p>
                    <p class="text-sm font-bold text-blue-600 mt-0.5">₹{{u.rent_monthly | number}}/mo</p>
                  </div>
                </a>
              }
              <a routerLink="/units" class="block text-center text-blue-600 text-sm hover:underline mt-2">View all →</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Amenities -->
      <div class="mt-8 card p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">World-Class Amenities</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (a of amenities(); track a.id) {
            <div class="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="material-icons text-blue-600 text-base">{{a.icon || 'star'}}</span>
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-800">{{a.name}}</div>
                <div class="text-xs text-gray-400 truncate">{{a.description}}</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  // Angular 20 Signals for reactive state
  availableCount  = signal(0);
  pendingCount    = signal(0);
  approvedCount   = signal(0);
  towerCount      = signal(0);
  recentBookings  = signal<any[]>([]);
  featuredUnits   = signal<any[]>([]);
  amenities       = signal<any[]>([]);
  bookingsLoading = signal(true);

  photos = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=70',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=70',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=200&q=70'
  ];

  get statCards() {
    return [
      { label: 'Units Available', value: this.availableCount(), icon: 'door_front',    bg: 'bg-blue-100',   color: 'text-blue-600' },
      { label: 'Pending Bookings', value: this.pendingCount(),  icon: 'pending',        bg: 'bg-yellow-100', color: 'text-yellow-600' },
      { label: 'Approved',         value: this.approvedCount(), icon: 'check_circle',   bg: 'bg-green-100',  color: 'text-green-600' },
      { label: 'Towers',           value: this.towerCount(),    icon: 'business',       bg: 'bg-purple-100', color: 'text-purple-600' }
    ];
  }

  ngOnInit() {
    this.api.getUnits({ status: 'available' }).subscribe(r => {
      const units = r.units || [];
      this.availableCount.set(units.length);
      this.featuredUnits.set(units.slice(0, 3));
    });
    this.api.getTowers().subscribe(r => this.towerCount.set((r.towers || []).length));
    this.api.getMyBookings().subscribe(r => {
      const bookings = r.bookings || [];
      this.recentBookings.set(bookings.slice(0, 4));
      this.pendingCount.set(bookings.filter((b: any) => b.status === 'pending').length);
      this.approvedCount.set(bookings.filter((b: any) => b.status === 'approved').length);
      this.bookingsLoading.set(false);
    });
    this.api.getAmenities().subscribe(r => this.amenities.set(r.amenities || []));
  }
}
