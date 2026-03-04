import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-unit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />

    @if (loading()) {
      <div class="flex justify-center items-center h-64">
        <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else if (unit()) {
      <!-- Photo Gallery -->
      <div class="grid grid-cols-4 grid-rows-2 gap-2 h-80 overflow-hidden">
        @for (p of getPhotos(); track p; let i = $index) {
          <div [class]="i === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'"
               class="overflow-hidden cursor-pointer" (click)="lightboxIdx.set(i)">
            <img [src]="p" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="Unit">
          </div>
        }
      </div>

      <!-- Lightbox -->
      @if (lightboxIdx() >= 0) {
        <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
             (click)="lightboxIdx.set(-1)">
          <button (click)="prevPhoto($event)" class="absolute left-4 text-white bg-black/40 rounded-full p-2">
            <span class="material-icons">chevron_left</span>
          </button>
          <img [src]="getPhotos()[lightboxIdx()]" class="max-h-screen max-w-4xl object-contain rounded-xl">
          <button (click)="nextPhoto($event)" class="absolute right-4 text-white bg-black/40 rounded-full p-2">
            <span class="material-icons">chevron_right</span>
          </button>
          <button (click)="lightboxIdx.set(-1)" class="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2">
            <span class="material-icons">close</span>
          </button>
        </div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left: Details -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Title bar -->
            <div class="flex items-start justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Unit {{unit()!.unit_number}}</h1>
                <p class="text-gray-500 flex items-center gap-1 mt-1">
                  <span class="material-icons text-sm">location_on</span>
                  {{unit()!.tower_name}}, Floor {{unit()!.floor}}
                </p>
              </div>
              <span [class]="'badge badge-' + unit()!.status + ' text-sm px-3 py-1'">{{unit()!.status}}</span>
            </div>

            <!-- Key specs -->
            <div class="grid grid-cols-3 gap-4">
              @for (spec of getSpecs(); track spec.label) {
                <div class="card p-4 text-center">
                  <span class="material-icons text-blue-600 text-2xl">{{spec.icon}}</span>
                  <div class="text-lg font-bold text-gray-900 mt-1">{{spec.value}}</div>
                  <div class="text-xs text-gray-400">{{spec.label}}</div>
                </div>
              }
            </div>

            <!-- About -->
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-3">About this unit</h2>
              <p class="text-gray-600">{{unit()!.description}}</p>
            </div>

            <!-- Amenities -->
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4">Amenities</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                @for (a of unit()!.amenities; track a.id) {
                  <div class="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span class="material-icons text-blue-600 text-base">{{a.icon || 'star'}}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-700">{{a.name}}</span>
                  </div>
                }
              </div>
            </div>

            <!-- What's nearby -->
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4">What's Nearby</h2>
              <div class="grid grid-cols-2 gap-3">
                @for (n of nearby; track n.label) {
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <span class="material-icons text-green-500 text-base">{{n.icon}}</span>
                    {{n.label}}
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Right: Booking panel -->
          <div>
            <div class="card p-6 sticky top-24">
              <div class="text-3xl font-bold text-gray-900 mb-1">
                ₹{{unit()!.rent_monthly | number}}
                <span class="text-base font-normal text-gray-400">/month</span>
              </div>
              <p class="text-sm text-gray-400 mb-6">+ maintenance charges</p>

              @if (!auth.isLoggedIn()) {
                <a routerLink="/login" class="btn-primary w-full text-center block">Login to Book</a>
              } @else if (bookingSuccess()) {
                <div class="text-center py-4">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span class="material-icons text-green-600 text-3xl">check_circle</span>
                  </div>
                  <p class="font-bold text-green-800">Booking Requested!</p>
                  <p class="text-sm text-gray-500 mt-1">Admin will confirm within 24 hours</p>
                  <a routerLink="/bookings" class="btn-primary mt-4 inline-block w-full text-center">View My Bookings</a>
                </div>
              } @else {
                @if (bookingError()) {
                  <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                    <span class="material-icons text-sm">error_outline</span> {{bookingError()}}
                  </div>
                }
                <div class="mb-4">
                  <label class="form-label">Preferred Visit Date</label>
                  <input type="date" [(ngModel)]="visitDate" [min]="today"
                         class="form-input">
                </div>
                <div class="mb-4">
                  <label class="form-label">Message to Admin <span class="text-gray-400 font-normal">(optional)</span></label>
                  <textarea [(ngModel)]="message" rows="3"
                    class="form-input resize-none"
                    placeholder="Any questions, special requirements..."></textarea>
                </div>
                <button (click)="submitBooking()" [disabled]="submitting() || unit()!.status === 'occupied'"
                  class="btn-primary w-full flex justify-center items-center gap-2 py-3">
                  @if (submitting()) {
                    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  } @else {
                    <span class="material-icons text-sm">event_available</span>
                  }
                  {{unit()!.status === 'occupied' ? 'Unit Occupied' : 'Request Viewing'}}
                </button>
                <p class="text-xs text-gray-400 text-center mt-3">Admin will review within 24 hours</p>
              }

              <div class="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <p class="text-xs text-gray-400 text-center">Or contact us directly</p>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="material-icons text-sm text-gray-400">phone</span>
                  +91 98765 43210
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="material-icons text-sm text-gray-400">email</span>
                  admin&#64;apartment.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class UnitDetailComponent implements OnInit {
  private api    = inject(ApiService);
  private route  = inject(ActivatedRoute);
  auth           = inject(AuthService);

  unit           = signal<any>(null);
  loading        = signal(true);
  lightboxIdx    = signal(-1);
  submitting     = signal(false);
  bookingSuccess = signal(false);
  bookingError   = signal('');
  visitDate      = '';
  message        = '';
  today          = new Date().toISOString().split('T')[0];

  nearby = [
    { icon: 'school',        label: 'Schools within 1km' },
    { icon: 'local_hospital',label: 'Hospital 2km away' },
    { icon: 'shopping_cart', label: 'Mall 500m away' },
    { icon: 'directions_bus',label: 'Bus stop nearby' },
    { icon: 'restaurant',    label: 'Restaurants nearby' },
    { icon: 'park',          label: 'Park 300m away' }
  ];

  getPhotos() {
    const beds = this.unit()?.bedrooms || 1;
    const maps: Record<number, string[]> = {
      1: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
          'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
          'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'],
      2: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
          'https://images.unsplash.com/photo-1502005229762-cf1b382d6239?w=600&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'],
      3: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80']
    };
    return maps[Math.min(beds, 3)] || maps[1];
  }

  getSpecs() {
    const u = this.unit();
    return [
      { icon: 'bed',         value: u?.bedrooms,    label: 'Bedrooms' },
      { icon: 'bathtub',     value: u?.bathrooms,   label: 'Bathrooms' },
      { icon: 'square_foot', value: u?.area_sqft + ' sqft', label: 'Area' }
    ];
  }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.api.getUnit(id).subscribe(r => {
      this.unit.set(r.unit || r);
      this.loading.set(false);
    });
  }

  prevPhoto(e: Event) { e.stopPropagation(); const l = this.getPhotos().length; this.lightboxIdx.set((this.lightboxIdx() - 1 + l) % l); }
  nextPhoto(e: Event) { e.stopPropagation(); const l = this.getPhotos().length; this.lightboxIdx.set((this.lightboxIdx() + 1) % l); }

  submitBooking() {
    this.submitting.set(true); this.bookingError.set('');
    this.api.createBooking({ unit_id: this.unit()!.id, visit_date: this.visitDate, message: this.message }).subscribe({
      next: () => { this.submitting.set(false); this.bookingSuccess.set(true); },
      error: err => { this.submitting.set(false); this.bookingError.set(err.error?.error || 'Booking failed. Please try again.'); }
    });
  }
}
