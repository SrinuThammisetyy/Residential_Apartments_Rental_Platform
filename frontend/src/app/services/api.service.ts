import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Units
  getUnits(filters?: any) {
    let params = new HttpParams();
    if (filters) Object.keys(filters).forEach(k => {
      if (filters[k] !== '' && filters[k] != null) params = params.set(k, filters[k]);
    });
    return this.http.get<any>(`${this.base}/units/`, { params });
  }
  getUnit(id: number)    { return this.http.get<any>(`${this.base}/units/${id}`); }
  getTowers()            { return this.http.get<any>(`${this.base}/units/towers`); }
  getAmenities()         { return this.http.get<any>(`${this.base}/amenities/`); }

  // Bookings
  createBooking(data: any)        { return this.http.post<any>(`${this.base}/bookings/`, data); }
  getMyBookings()                 { return this.http.get<any>(`${this.base}/bookings/my`); }
  cancelBooking(id: number)       { return this.http.put<any>(`${this.base}/bookings/${id}/cancel`, {}); }

  // Admin
  getStats()                      { return this.http.get<any>(`${this.base}/admin/stats`); }
  adminGetTowers()                 { return this.http.get<any>(`${this.base}/admin/towers`); }
  adminCreateTower(d: any)         { return this.http.post<any>(`${this.base}/admin/towers`, d); }
  adminUpdateTower(id: number, d: any) { return this.http.put<any>(`${this.base}/admin/towers/${id}`, d); }
  adminDeleteTower(id: number)     { return this.http.delete<any>(`${this.base}/admin/towers/${id}`); }
  adminGetUnits()                  { return this.http.get<any>(`${this.base}/admin/units`); }
  adminCreateUnit(d: any)          { return this.http.post<any>(`${this.base}/admin/units`, d); }
  adminUpdateUnit(id: number, d: any) { return this.http.put<any>(`${this.base}/admin/units/${id}`, d); }
  adminDeleteUnit(id: number)      { return this.http.delete<any>(`${this.base}/admin/units/${id}`); }
  adminGetBookings(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.base}/admin/bookings`, { params });
  }
  adminApproveBooking(id: number, note?: string) { return this.http.put<any>(`${this.base}/admin/bookings/${id}/approve`, { admin_note: note }); }
  adminDeclineBooking(id: number, note?: string) { return this.http.put<any>(`${this.base}/admin/bookings/${id}/decline`, { admin_note: note }); }
  adminGetTenants()   { return this.http.get<any>(`${this.base}/admin/tenants`); }
  adminGetLeases()    { return this.http.get<any>(`${this.base}/admin/leases`); }
  adminCreateLease(d: any) { return this.http.post<any>(`${this.base}/admin/leases`, d); }
  adminGetPayments()  { return this.http.get<any>(`${this.base}/admin/payments`); }
  adminGetAmenities() { return this.http.get<any>(`${this.base}/admin/amenities`); }
  adminCreateAmenity(d: any) { return this.http.post<any>(`${this.base}/admin/amenities`, d); }
  adminUpdateAmenity(id: number, d: any) { return this.http.put<any>(`${this.base}/admin/amenities/${id}`, d); }
}
