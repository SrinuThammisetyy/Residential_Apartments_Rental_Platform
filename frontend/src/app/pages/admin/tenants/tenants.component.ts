import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Tenants ({{tenants().length}})</h1>
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              @for (h of ['Tenant','Email','Phone','Role','Joined']; track h) {
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{h}}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (t of tenants(); track t.id) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500
                                flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {{t.full_name?.charAt(0)?.toUpperCase()}}
                    </div>
                    <span class="font-semibold text-gray-900">{{t.full_name}}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600">{{t.email}}</td>
                <td class="px-4 py-3 text-gray-600">{{t.phone || '—'}}</td>
                <td class="px-4 py-3">
                  <span [class]="t.role === 'admin'
                    ? 'badge bg-purple-100 text-purple-800'
                    : 'badge bg-blue-100 text-blue-800'">
                    {{t.role}}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{t.created_at | date:'mediumDate'}}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TenantsComponent implements OnInit {
  private api = inject(ApiService);
  tenants = signal<any[]>([]);
  ngOnInit() { this.api.adminGetTenants().subscribe(r => this.tenants.set(r.users || r.tenants || [])); }
}
