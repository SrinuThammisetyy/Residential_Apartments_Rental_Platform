import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-units',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Manage Units</h1>
        <button (click)="openModal()" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-sm">add</span> Add Unit
        </button>
      </div>
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              @for (h of ['Unit','Tower','Beds','Area','Rent/mo','Status','Actions']; track h) {
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{h}}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (u of units(); track u.id) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 font-semibold text-gray-900">{{u.unit_number}}</td>
                <td class="px-4 py-3 text-gray-600 text-xs">{{u.tower_name}}</td>
                <td class="px-4 py-3 text-gray-600">{{u.bedrooms}}B / {{u.bathrooms}}Ba</td>
                <td class="px-4 py-3 text-gray-600">{{u.area_sqft}} sqft</td>
                <td class="px-4 py-3 font-semibold text-blue-600">&#8377;{{u.rent_monthly | number}}</td>
                <td class="px-4 py-3"><span [class]="'badge badge-' + u.status">{{u.status}}</span></td>
                <td class="px-4 py-3">
                  <div class="flex gap-1">
                    <button (click)="openModal(u)" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg">
                      <span class="material-icons text-sm">edit</span>
                    </button>
                    <button (click)="deleteUnit(u.id)" class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-4">
          <h2 class="text-lg font-bold text-gray-900 mb-5">{{editing() ? 'Edit' : 'Add'}} Unit</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2"><label class="form-label">Tower</label>
              <select [(ngModel)]="form.tower_id" class="form-input">
                @for (t of towers(); track t.id) { <option [value]="t.id">{{t.name}}</option> }
              </select>
            </div>
            <div><label class="form-label">Unit Number</label><input type="text" [(ngModel)]="form.unit_number" class="form-input"></div>
            <div><label class="form-label">Floor</label><input type="number" [(ngModel)]="form.floor" class="form-input"></div>
            <div><label class="form-label">Bedrooms</label><input type="number" [(ngModel)]="form.bedrooms" class="form-input"></div>
            <div><label class="form-label">Bathrooms</label><input type="number" [(ngModel)]="form.bathrooms" class="form-input"></div>
            <div><label class="form-label">Area (sqft)</label><input type="number" [(ngModel)]="form.area_sqft" class="form-input"></div>
            <div><label class="form-label">Rent (&#8377;/mo)</label><input type="number" [(ngModel)]="form.rent_monthly" class="form-input"></div>
            <div class="col-span-2"><label class="form-label">Status</label>
              <select [(ngModel)]="form.status" class="form-input">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
            <div class="col-span-2"><label class="form-label">Description</label>
              <textarea [(ngModel)]="form.description" class="form-input" rows="2"></textarea></div>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="save()" class="btn-primary flex-1">{{editing() ? 'Update' : 'Create'}}</button>
            <button (click)="showModal.set(false)" class="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminUnitsComponent implements OnInit {
  private api = inject(ApiService);
  units = signal<any[]>([]); towers = signal<any[]>([]); showModal = signal(false);
  editing = signal<any>(null); form: any = {};
  ngOnInit() { this.load(); this.api.adminGetTowers().subscribe(r => this.towers.set(r.towers || [])); }
  load() { this.api.adminGetUnits().subscribe(r => this.units.set(r.units || [])); }
  openModal(u?: any) {
    this.editing.set(u || null);
    this.form = u ? { ...u } : { tower_id: '', unit_number: '', floor: 1, bedrooms: 2, bathrooms: 1, area_sqft: 900, rent_monthly: 1500, status: 'available', description: '' };
    this.showModal.set(true);
  }
  save() {
    const obs = this.editing() ? this.api.adminUpdateUnit(this.editing().id, this.form) : this.api.adminCreateUnit(this.form);
    obs.subscribe(() => { this.showModal.set(false); this.load(); });
  }
  deleteUnit(id: number) {
    if (confirm('Delete this unit?')) this.api.adminDeleteUnit(id).subscribe(() => this.load());
  }
}
