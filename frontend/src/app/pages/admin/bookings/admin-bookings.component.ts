import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <div class="flex gap-2">
          @for (f of statusFilters; track f.value) {
            <button (click)="filterStatus.set(f.value); load()"
              [class]="filterStatus() === f.value
                ? 'bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold'
                : 'bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200'">
              {{f.label}}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="text-center py-16">
          <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      } @else if (bookings().length === 0) {
        <div class="card p-12 text-center">
          <span class="material-icons text-gray-300 text-5xl">event_busy</span>
          <p class="text-gray-500 mt-4 font-medium">No bookings found</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (b of bookings(); track b.id) {
            <div class="card p-5">
              <div class="flex items-start gap-4 flex-wrap">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600
                            flex items-center justify-center text-white font-bold flex-shrink-0 text-lg">
                  {{b.user_name?.charAt(0)?.toUpperCase()}}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 flex-wrap mb-1">
                    <h3 class="font-bold text-gray-900">{{b.user_name}}</h3>
                    <span class="text-gray-400 text-sm">{{b.user_email}}</span>
                    <span [class]="'badge badge-' + b.status">{{b.status}}</span>
                  </div>
                  <p class="text-sm text-gray-600">
                    Unit <strong>{{b.unit_number}}</strong> · {{b.tower_name}}
                    @if (b.visit_date) { · Visit: <strong>{{b.visit_date}}</strong> }
                  </p>
                  @if (b.message) {
                    <div class="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-sm text-blue-800">
                      <span class="font-semibold">Message:</span> {{b.message}}
                    </div>
                  }
                  @if (b.admin_note) {
                    <div class="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700">
                      <span class="font-semibold">Your note:</span> {{b.admin_note}}
                    </div>
                  }
                </div>
                @if (b.status === 'pending') {
                  <div class="flex gap-2 flex-shrink-0">
                    <button (click)="action(b, 'approve')"
                      class="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white
                             text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                      <span class="material-icons text-sm">check</span> Approve
                    </button>
                    <button (click)="action(b, 'decline')"
                      class="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white
                             text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                      <span class="material-icons text-sm">close</span> Decline
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Note modal -->
    @if (noteModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h2 class="font-bold text-gray-900 text-lg mb-1">
            {{noteAction === 'approve' ? 'Approve Booking' : 'Decline Booking'}}
          </h2>
          <p class="text-sm text-gray-500 mb-4">
            Unit {{noteModal()?.unit_number}} · {{noteModal()?.user_name}}
          </p>
          <label class="form-label">Note to tenant <span class="text-gray-400 font-normal">(optional)</span></label>
          <textarea [(ngModel)]="noteText" class="form-input" rows="3"
            [placeholder]="noteAction === 'approve'
              ? 'e.g. Please arrive at 10 AM for the viewing.'
              : 'e.g. Unit is currently under maintenance.'">
          </textarea>
          <div class="flex gap-3 mt-4">
            <button (click)="confirmAction()"
              [class]="'flex-1 font-semibold py-2.5 rounded-xl text-white ' +
                       (noteAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600')">
              Confirm {{noteAction | titlecase}}
            </button>
            <button (click)="noteModal.set(null)" class="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminBookingsComponent implements OnInit {
  private api  = inject(ApiService);
  bookings     = signal<any[]>([]);
  loading      = signal(true);
  filterStatus = signal('pending');
  noteModal    = signal<any>(null);
  noteAction   = '';
  noteText     = '';

  statusFilters = [
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
    { value: '',         label: 'All' }
  ];

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.adminGetBookings(this.filterStatus() || undefined).subscribe(r => {
      this.bookings.set(r.bookings || []);
      this.loading.set(false);
    });
  }
  action(b: any, act: string) {
    this.noteAction = act; this.noteText = ''; this.noteModal.set(b);
  }
  confirmAction() {
    const b = this.noteModal()!;
    const obs = this.noteAction === 'approve'
      ? this.api.adminApproveBooking(b.id, this.noteText)
      : this.api.adminDeclineBooking(b.id, this.noteText);
    obs.subscribe(() => { this.noteModal.set(null); this.load(); });
  }
}
