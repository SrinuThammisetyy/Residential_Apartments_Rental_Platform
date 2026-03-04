import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />

    <!-- Hero -->
    <div class="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-10">
      <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div>
          <p class="text-blue-400 text-sm font-medium uppercase tracking-wide mb-1">Admin Portal</p>
          <h1 class="text-3xl font-bold text-white">Good {{timeOfDay}}, {{auth.currentUser()?.full_name}} 👋</h1>
          <p class="text-white/60 mt-1">Here's your property overview for today.</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/admin/bookings"
             class="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white
                    font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
            <span class="material-icons text-base">pending_actions</span>
            Review Bookings
            @if ((stats()?.pending_bookings || 0) > 0) {
              <span class="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {{stats()?.pending_bookings}}
              </span>
            }
          </a>
          <a routerLink="/admin/units"
             class="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white
                    font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm border border-white/20">
            <span class="material-icons text-base">add</span> Add Unit
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- KPI Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        @for (s of getStatCards(); track s.label) {
          <div class="card p-5" [class]="s.highlight ? 'ring-2 ring-yellow-300' : ''">
            <div class="flex items-center justify-between mb-3">
              <div [class]="'w-11 h-11 rounded-xl flex items-center justify-center ' + s.bg">
                <span class="material-icons" [class]="s.color">{{s.icon}}</span>
              </div>
              @if (s.badge) {
                <span [class]="s.badge">{{s.badgeText}}</span>
              }
            </div>
            <div class="text-3xl font-bold text-gray-900">{{s.value}}</div>
            <div class="text-sm text-gray-400 mt-1">{{s.label}}</div>
            @if (s.sub) { <div class="text-xs mt-2" [class]="s.subColor">{{s.sub}}</div> }
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">

          <!-- Pending bookings alert -->
          @if (pendingBookings().length > 0) {
            <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <div class="flex items-center justify-between mb-4">
                <h2 class="font-bold text-yellow-900 flex items-center gap-2">
                  <span class="material-icons text-yellow-600">pending_actions</span>
                  Pending Approval ({{pendingBookings().length}})
                </h2>
                <a routerLink="/admin/bookings" class="text-sm text-yellow-700 hover:underline font-medium">View all →</a>
              </div>
              <div class="space-y-3">
                @for (b of pendingBookings().slice(0,3); track b.id) {
                  <div class="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-yellow-100">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500
                                flex items-center justify-center text-white font-bold flex-shrink-0">
                      {{b.user_name?.charAt(0)?.toUpperCase()}}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-900 text-sm">{{b.user_name}}</p>
                      <p class="text-xs text-gray-500">Unit {{b.unit_number}} · {{b.tower_name}}</p>
                    </div>
                    <a routerLink="/admin/bookings"
                       class="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs
                              font-medium px-3 py-1.5 rounded-lg transition-colors">Review</a>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Management grid -->
          <div class="card p-6">
            <h2 class="font-bold text-gray-900 mb-4">Manage Property</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              @for (item of managementLinks; track item.route) {
                <a [routerLink]="item.route"
                   class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent
                          hover:border-blue-200 hover:bg-blue-50 transition-all text-center group">
                  <div [class]="'w-12 h-12 rounded-xl flex items-center justify-center ' + item.bg">
                    <span class="material-icons" [class]="item.color">{{item.icon}}</span>
                  </div>
                  <span class="text-sm font-medium text-gray-700 group-hover:text-blue-700">{{item.label}}</span>
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="space-y-6">
          <!-- Revenue card -->
          <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <div class="flex items-center gap-2 mb-3">
              <span class="material-icons text-blue-300">payments</span>
              <span class="text-blue-200 text-sm font-medium">Total Revenue</span>
            </div>
            <div class="text-4xl font-bold mb-1">₹{{(stats()?.total_revenue || 0) | number}}</div>
            <div class="text-blue-300 text-sm">From {{stats()?.active_leases || 0}} active leases</div>
            <a routerLink="/admin/payments" class="mt-4 inline-flex items-center gap-1 text-white/80 hover:text-white text-sm">
              View payments <span class="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          <!-- Towers -->
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-gray-900">Towers ({{stats()?.total_towers || 0}})</h3>
              <a routerLink="/admin/towers" class="text-sm text-blue-600 hover:underline">Manage →</a>
            </div>
            @for (t of towers(); track t.id) {
              <div class="mb-3 last:mb-0">
                <div class="flex justify-between text-sm mb-1.5">
                  <span class="font-medium text-gray-700 truncate">{{t.name}}</span>
                  <span class="text-gray-400 text-xs flex-shrink-0 ml-2">{{t.unit_count}} units</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                       [style.width]="(60 + t.id * 10) + '%'"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  stats           = signal<any>(null);
  pendingBookings = signal<any[]>([]);
  towers          = signal<any[]>([]);

  get timeOfDay() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  managementLinks = [
    { route: '/admin/towers',   label: 'Towers',   icon: 'business',        bg: 'bg-blue-100',   color: 'text-blue-600' },
    { route: '/admin/units',    label: 'Units',    icon: 'door_front',      bg: 'bg-indigo-100', color: 'text-indigo-600' },
    { route: '/admin/bookings', label: 'Bookings', icon: 'event',           bg: 'bg-yellow-100', color: 'text-yellow-600' },
    { route: '/admin/tenants',  label: 'Tenants',  icon: 'people',          bg: 'bg-purple-100', color: 'text-purple-600' },
    { route: '/admin/leases',   label: 'Leases',   icon: 'description',     bg: 'bg-green-100',  color: 'text-green-600' },
    { route: '/admin/payments', label: 'Payments', icon: 'account_balance', bg: 'bg-rose-100',   color: 'text-rose-600' }
  ];

  getStatCards() {
    const s = this.stats();
    return [
      { label: 'Total Units',     value: s?.total_units || 0,    icon: 'door_front',  bg: 'bg-blue-100',   color: 'text-blue-600',   badge: 'text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium', badgeText: (s?.occupancy_rate || 0) + '% occ', sub: s?.available_units + ' available', subColor: 'text-green-600' },
      { label: 'Available Now',   value: s?.available_units || 0, icon: 'check_circle', bg: 'bg-green-100',  color: 'text-green-600',  sub: s?.occupied_units + ' occupied', subColor: 'text-gray-400' },
      { label: 'Pending Bookings',value: s?.pending_bookings || 0,icon: 'pending',     bg: 'bg-yellow-100', color: 'text-yellow-600', highlight: (s?.pending_bookings || 0) > 0, sub: (s?.pending_bookings || 0) > 0 ? 'Needs review' : 'All clear', subColor: (s?.pending_bookings || 0) > 0 ? 'text-yellow-600 font-medium' : 'text-green-500' },
      { label: 'Total Tenants',   value: s?.total_tenants || 0,  icon: 'people',      bg: 'bg-purple-100', color: 'text-purple-600', sub: s?.active_leases + ' active leases', subColor: 'text-purple-500' }
    ];
  }

  ngOnInit() {
    this.api.getStats().subscribe(r => this.stats.set(r));
    this.api.adminGetBookings('pending').subscribe(r => this.pendingBookings.set(r.bookings || []));
    this.api.adminGetTowers().subscribe(r => this.towers.set((r.towers || []).slice(0, 3)));
  }
}
