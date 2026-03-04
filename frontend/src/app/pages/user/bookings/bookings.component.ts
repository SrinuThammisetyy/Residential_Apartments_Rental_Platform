import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">My Bookings</h1>
        <a routerLink="/units" class="btn-primary text-sm flex items-center gap-1">
          <span class="material-icons text-sm">add</span> New Booking
        </a>
      </div>

      @if (loading()) {
        <div class="text-center py-16">
          <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      } @else if (bookings().length === 0) {
        <div class="card p-12 text-center">
          <span class="material-icons text-gray-300 text-6xl">event_busy</span>
          <p class="text-gray-500 mt-4 font-medium text-lg">No bookings yet</p>
          <p class="text-gray-400 text-sm mt-1">Browse available flats and request a viewing</p>
          <a routerLink="/units" class="btn-primary mt-6 inline-block">Browse Flats</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (b of bookings(); track b.id) {
            <div class="card p-5" [class]="getCardBorder(b.status)">
              <!-- Status banner -->
              <div [class]="'flex items-center gap-2 rounded-xl px-4 py-2 mb-4 text-sm font-medium ' + getBannerClass(b.status)">
                <span class="material-icons text-base">{{getStatusIcon(b.status)}}</span>
                {{getStatusMsg(b.status)}}
              </div>

              <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&q=70"
                       class="w-full h-full object-cover" alt="Unit">
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-bold text-gray-900">Unit {{b.unit_number}}</h3>
                    <span [class]="'badge badge-' + b.status">{{b.status}}</span>
                  </div>
                  <p class="text-sm text-gray-500">{{b.tower_name}}</p>
                  <div class="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                    <div class="text-gray-500">Visit Date: <span class="text-gray-800 font-medium">{{b.visit_date || 'Not set'}}</span></div>
                    <div class="text-gray-500">Booked: <span class="text-gray-800 font-medium">{{b.created_at | date:'mediumDate'}}</span></div>
                    <div class="text-gray-500">Booking ID: <span class="text-gray-800 font-medium">#{{b.id}}</span></div>
                  </div>

                  @if (b.message) {
                    <div class="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-sm text-blue-800">
                      <span class="font-semibold">Your message:</span> {{b.message}}
                    </div>
                  }
                  @if (b.admin_note) {
                    <div class="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700">
                      <span class="font-semibold">Admin note:</span> {{b.admin_note}}
                    </div>
                  }
                </div>

                @if (b.status === 'pending') {
                  <button (click)="cancel(b.id)"
                    class="flex-shrink-0 text-sm text-red-600 border border-red-200 hover:bg-red-50
                           px-3 py-1.5 rounded-lg transition-colors">
                    Cancel
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class BookingsComponent implements OnInit {
  private api = inject(ApiService);
  bookings = signal<any[]>([]);
  loading  = signal(true);

  ngOnInit() {
    this.load();
  }
  load() {
    this.api.getMyBookings().subscribe(r => {
      this.bookings.set(r.bookings || []);
      this.loading.set(false);
    });
  }
  cancel(id: number) {
    if (!confirm('Cancel this booking?')) return;
    this.api.cancelBooking(id).subscribe(() => this.load());
  }
  getCardBorder(s: string) {
    return s === 'pending' ? 'border-l-4 border-l-yellow-400' :
           s === 'approved' ? 'border-l-4 border-l-green-500' :
           s === 'declined' ? 'border-l-4 border-l-red-400' : '';
  }
  getBannerClass(s: string) {
    return s === 'pending'  ? 'bg-yellow-50 text-yellow-800' :
           s === 'approved' ? 'bg-green-50 text-green-800'   :
           s === 'declined' ? 'bg-red-50 text-red-800'       : 'bg-gray-50 text-gray-600';
  }
  getStatusIcon(s: string) {
    return s === 'pending' ? 'hourglass_empty' : s === 'approved' ? 'check_circle' : s === 'declined' ? 'cancel' : 'block';
  }
  getStatusMsg(s: string) {
    return s === 'pending'  ? 'Under review — Admin will respond within 24 hours' :
           s === 'approved' ? 'Viewing approved! Please arrive on time.' :
           s === 'declined' ? 'Request declined. Browse other available units.' : 'You cancelled this request.';
  }
}
