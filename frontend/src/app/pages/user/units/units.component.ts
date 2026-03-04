import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

const UNIT_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  2: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
  3: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  4: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80'
};

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  template: `
    <app-navbar />

    <!-- Hero -->
    <div class="relative h-40 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80"
           class="w-full h-full object-cover" alt="Buildings">
      <div class="absolute inset-0 bg-blue-900/75 flex items-center">
        <div class="max-w-7xl mx-auto px-6 w-full">
          <h1 class="text-2xl font-bold text-white">Browse Available Flats</h1>
          <p class="text-white/70 mt-1">{{filtered().length}} units found</p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="card p-4 mb-6">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select [(ngModel)]="filters.tower_id" (change)="applyFilters()" class="form-input text-sm py-2">
            <option value="">All Towers</option>
            @for (t of towers(); track t.id) {
              <option [value]="t.id">{{t.name}}</option>
            }
          </select>
          <select [(ngModel)]="filters.bedrooms" (change)="applyFilters()" class="form-input text-sm py-2">
            <option value="">Any Beds</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
          </select>
          <select [(ngModel)]="filters.status" (change)="applyFilters()" class="form-input text-sm py-2">
            <option value="">Any Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
          <input type="number" [(ngModel)]="filters.min_rent" (input)="applyFilters()"
                 placeholder="Min Rent ₹" class="form-input text-sm py-2">
          <input type="number" [(ngModel)]="filters.max_rent" (input)="applyFilters()"
                 placeholder="Max Rent ₹" class="form-input text-sm py-2">
        </div>
      </div>

      <!-- Grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="card overflow-hidden animate-pulse">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                <div class="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="text-center py-16">
          <span class="material-icons text-gray-300 text-6xl">search_off</span>
          <p class="text-gray-500 mt-4 font-medium">No units match your filters</p>
          <button (click)="resetFilters()" class="btn-secondary mt-4">Clear Filters</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (unit of filtered(); track unit.id) {
            <div class="card overflow-hidden hover:shadow-md transition-shadow group">
              <div class="relative h-48 overflow-hidden">
                <img [src]="getPhoto(unit.bedrooms)"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     [alt]="unit.unit_number">
                <div class="absolute top-3 left-3">
                  <span [class]="'badge badge-' + unit.status">{{unit.status}}</span>
                </div>
                <div class="absolute bottom-3 right-3 bg-black/60 text-white text-sm
                            font-bold px-3 py-1 rounded-lg backdrop-blur-sm">
                  ₹{{unit.rent_monthly | number}}/mo
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="font-bold text-gray-900">Unit {{unit.unit_number}}</h3>
                    <p class="text-sm text-gray-500">{{unit.tower_name}}</p>
                  </div>
                  <span class="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                    Floor {{unit.floor}}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span class="flex items-center gap-1">
                    <span class="material-icons text-sm text-gray-400">bed</span> {{unit.bedrooms}} Bed
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-icons text-sm text-gray-400">bathtub</span> {{unit.bathrooms}} Bath
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-icons text-sm text-gray-400">square_foot</span> {{unit.area_sqft}} sqft
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-3 truncate">{{unit.description}}</p>
                <div class="flex flex-wrap gap-1 mb-4">
                  @for (a of unit.amenities?.slice(0,3); track a.id) {
                    <span class="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{{a.name}}</span>
                  }
                  @if (unit.amenities?.length > 3) {
                    <span class="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">+{{unit.amenities.length - 3}} more</span>
                  }
                </div>
                <a [routerLink]="['/units', unit.id]" class="btn-primary w-full text-center block">
                  View Details
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class UnitsComponent implements OnInit {
  private api = inject(ApiService);
  loading = signal(true);
  allUnits = signal<any[]>([]);
  filtered = signal<any[]>([]);
  towers   = signal<any[]>([]);
  filters  = { tower_id: '', bedrooms: '', status: 'available', min_rent: '', max_rent: '' };

  getPhoto(beds: number) { return UNIT_PHOTOS[beds] || UNIT_PHOTOS[1]; }

  ngOnInit() {
    this.api.getUnits().subscribe(r => {
      this.allUnits.set(r.units || []);
      this.applyFilters();
      this.loading.set(false);
    });
    this.api.getTowers().subscribe(r => this.towers.set(r.towers || []));
  }

  applyFilters() {
    let list = this.allUnits();
    if (this.filters.tower_id) list = list.filter(u => u.tower_id == +this.filters.tower_id);
    if (this.filters.bedrooms)  list = list.filter(u => u.bedrooms  == +this.filters.bedrooms);
    if (this.filters.status)    list = list.filter(u => u.status === this.filters.status);
    if (this.filters.min_rent)  list = list.filter(u => u.rent_monthly >= +this.filters.min_rent);
    if (this.filters.max_rent)  list = list.filter(u => u.rent_monthly <= +this.filters.max_rent);
    this.filtered.set(list);
  }

  resetFilters() {
    this.filters = { tower_id: '', bedrooms: '', status: 'available', min_rent: '', max_rent: '' };
    this.applyFilters();
  }
}
