import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-leases',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Manage Leases</h1>
        <button (click)="showModal.set(true)" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-sm">add</span> New Lease
        </button>
      </div>
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              @for (h of ['Tenant','Unit','Period','Rent','Deposit','Status']; track h) {
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{h}}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (l of leases(); track l.id) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 font-semibold text-gray-900">{{l.user_name}}</td>
                <td class="px-4 py-3 text-gray-600">{{l.unit_number}} · {{l.tower_name}}</td>
                <td class="px-4 py-3 text-gray-600 text-xs">
                  {{l.start_date | date:'MMM d, y'}} – {{l.end_date | date:'MMM d, y'}}
                </td>
                <td class="px-4 py-3 font-semibold text-blue-600">&#8377;{{l.monthly_rent | number}}/mo</td>
                <td class="px-4 py-3 text-gray-600">&#8377;{{l.deposit | number}}</td>
                <td class="px-4 py-3">
                  <span [class]="l.status === 'active'
                    ? 'badge bg-green-100 text-green-800'
                    : 'badge bg-gray-100 text-gray-600'">
                    {{l.status}}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (leases().length === 0) {
          <div class="p-10 text-center">
            <span class="material-icons text-gray-300 text-5xl">description</span>
            <p class="text-gray-500 mt-3">No leases yet. Create one to get started.</p>
          </div>
        }
      </div>
    </div>
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h2 class="font-bold text-gray-900 text-lg mb-5">New Lease</h2>
          <div class="space-y-4">
            <div><label class="form-label">Tenant</label>
              <select [(ngModel)]="form.user_id" class="form-input">
                @for (t of tenants(); track t.id) { <option [value]="t.id">{{t.full_name}} ({{t.email}})</option> }
              </select>
            </div>
            <div><label class="form-label">Unit</label>
              <select [(ngModel)]="form.unit_id" class="form-input">
                @for (u of units(); track u.id) { <option [value]="u.id">{{u.unit_number}} · {{u.tower_name}}</option> }
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="form-label">Start Date</label><input type="date" [(ngModel)]="form.start_date" class="form-input"></div>
              <div><label class="form-label">End Date</label><input type="date" [(ngModel)]="form.end_date" class="form-input"></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="form-label">Monthly Rent</label><input type="number" [(ngModel)]="form.monthly_rent" class="form-input"></div>
              <div><label class="form-label">Deposit</label><input type="number" [(ngModel)]="form.deposit" class="form-input"></div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="save()" class="btn-primary flex-1">Create Lease</button>
            <button (click)="showModal.set(false)" class="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>
    }
  `
})
export class LeasesComponent implements OnInit {
  private api = inject(ApiService);
  leases = signal<any[]>([]); tenants = signal<any[]>([]); units = signal<any[]>([]);
  showModal = signal(false);
  form = { user_id: '', unit_id: '', start_date: '', end_date: '', monthly_rent: 0, deposit: 0 };
  ngOnInit() {
    this.api.adminGetLeases().subscribe(r => this.leases.set(r.leases || []));
    this.api.adminGetTenants().subscribe(r => this.tenants.set(r.users || r.tenants || []));
    this.api.adminGetUnits().subscribe(r => this.units.set((r.units || []).filter((u: any) => u.status === 'available')));
  }
  save() {
    this.api.adminCreateLease(this.form).subscribe(() => {
      this.showModal.set(false);
      this.api.adminGetLeases().subscribe(r => this.leases.set(r.leases || []));
    });
  }
}
