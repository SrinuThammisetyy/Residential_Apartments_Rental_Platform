import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-towers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Manage Towers</h1>
        <button (click)="openModal()" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-sm">add</span> Add Tower
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (t of towers(); track t.id) {
          <div class="card p-5">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span class="material-icons text-blue-600">business</span>
              </div>
              <div class="flex gap-2">
                <button (click)="openModal(t)" class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg">
                  <span class="material-icons text-sm">edit</span>
                </button>
                <button (click)="deleteTower(t.id)" class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                  <span class="material-icons text-sm">delete</span>
                </button>
              </div>
            </div>
            <h3 class="font-bold text-gray-900">{{t.name}}</h3>
            <p class="text-sm text-gray-500 mt-1">{{t.address}}</p>
            <div class="flex gap-4 mt-3 text-sm text-gray-500">
              <span>{{t.floors}} Floors</span>
              <span>{{t.unit_count}} Units</span>
            </div>
          </div>
        }
      </div>
    </div>
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h2 class="text-lg font-bold text-gray-900 mb-5">{{editing() ? 'Edit' : 'Add'}} Tower</h2>
          <div class="space-y-4">
            <div><label class="form-label">Tower Name</label>
              <input type="text" [(ngModel)]="form.name" class="form-input" placeholder="Tower A - Sunrise"></div>
            <div><label class="form-label">Address</label>
              <input type="text" [(ngModel)]="form.address" class="form-input"></div>
            <div><label class="form-label">Floors</label>
              <input type="number" [(ngModel)]="form.floors" class="form-input"></div>
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
export class TowersComponent implements OnInit {
  private api = inject(ApiService);
  towers = signal<any[]>([]); showModal = signal(false); editing = signal<any>(null);
  form = { name: '', address: '', floors: 10 };
  ngOnInit() { this.load(); }
  load() { this.api.adminGetTowers().subscribe(r => this.towers.set(r.towers || [])); }
  openModal(t?: any) {
    this.editing.set(t || null);
    this.form = t ? { name: t.name, address: t.address, floors: t.floors } : { name: '', address: '', floors: 10 };
    this.showModal.set(true);
  }
  save() {
    const obs = this.editing() ? this.api.adminUpdateTower(this.editing().id, this.form) : this.api.adminCreateTower(this.form);
    obs.subscribe(() => { this.showModal.set(false); this.load(); });
  }
  deleteTower(id: number) {
    if (confirm('Delete this tower?')) this.api.adminDeleteTower(id).subscribe(() => this.load());
  }
}
