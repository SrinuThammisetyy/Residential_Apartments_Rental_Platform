import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Payment Records</h1>
        <span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200">
          MOCK DATA
        </span>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        @for (s of summary(); track s.label) {
          <div class="card p-5">
            <div [class]="'w-10 h-10 rounded-xl flex items-center justify-center mb-3 ' + s.bg">
              <span class="material-icons" [class]="s.color">{{s.icon}}</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{s.value}}</div>
            <div class="text-sm text-gray-400 mt-1">{{s.label}}</div>
          </div>
        }
      </div>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              @for (h of ['Tenant','Unit','Amount','Date','Method','Status']; track h) {
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{h}}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (p of payments(); track p.id) {
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 font-semibold text-gray-900">{{p.user_name || p.tenant_name}}</td>
                <td class="px-4 py-3 text-gray-600">{{p.unit_number || '—'}}</td>
                <td class="px-4 py-3 font-semibold text-green-700">&#8377;{{p.amount | number}}</td>
                <td class="px-4 py-3 text-gray-500">{{p.payment_date | date:'mediumDate'}}</td>
                <td class="px-4 py-3">
                  <span class="badge bg-blue-50 text-blue-700">{{p.payment_method}}</span>
                </td>
                <td class="px-4 py-3">
                  <span [class]="p.status === 'paid' ? 'badge badge-approved' :
                                 p.status === 'pending' ? 'badge badge-pending' : 'badge badge-declined'">
                    {{p.status}}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (payments().length === 0) {
          <div class="p-10 text-center">
            <span class="material-icons text-gray-300 text-5xl">receipt_long</span>
            <p class="text-gray-500 mt-3">No payment records yet.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class PaymentsComponent implements OnInit {
  private api = inject(ApiService);
  payments = signal<any[]>([]);

  summary = signal([
    { label: 'Total Collected', value: '₹0', icon: 'paid',        bg: 'bg-green-100',  color: 'text-green-600' },
    { label: 'Pending',         value: '0',  icon: 'hourglass_empty', bg: 'bg-yellow-100', color: 'text-yellow-600' },
    { label: 'Overdue',         value: '0',  icon: 'warning',     bg: 'bg-red-100',    color: 'text-red-500' }
  ]);

  ngOnInit() {
    this.api.adminGetPayments().subscribe(r => {
      const list = r.payments || [];
      this.payments.set(list);
      const paid    = list.filter((p: any) => p.status === 'paid');
      const pending = list.filter((p: any) => p.status === 'pending').length;
      const overdue = list.filter((p: any) => p.status === 'overdue').length;
      const total   = paid.reduce((s: number, p: any) => s + p.amount, 0);
      this.summary.set([
        { label: 'Total Collected', value: '₹' + total.toLocaleString(), icon: 'paid',        bg: 'bg-green-100',  color: 'text-green-600' },
        { label: 'Pending',         value: String(pending),              icon: 'hourglass_empty', bg: 'bg-yellow-100', color: 'text-yellow-600' },
        { label: 'Overdue',         value: String(overdue),              icon: 'warning',     bg: 'bg-red-100',    color: 'text-red-500' }
      ]);
    });
  }
}
