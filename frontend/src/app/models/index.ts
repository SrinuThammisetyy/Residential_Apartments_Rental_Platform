export interface User {
  id: number; email: string; full_name: string; phone?: string; role: 'user' | 'admin';
}
export interface Tower {
  id: number; name: string; address: string; floors: number; unit_count: number;
}
export interface Amenity {
  id: number; name: string; description: string; icon: string;
}
export interface Unit {
  id: number; tower_id: number; tower_name: string; unit_number: string;
  floor: number; bedrooms: number; bathrooms: number; area_sqft: number;
  rent_monthly: number; status: 'available' | 'occupied'; description: string;
  amenities: Amenity[];
}
export interface Booking {
  id: number; user_id: number; user_name: string; user_email: string;
  unit_id: number; unit_number: string; tower_name: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  visit_date: string; message: string; admin_note: string; created_at: string;
}
export interface Lease {
  id: number; user_id: number; user_name: string; unit_id: number;
  unit_number: string; tower_name: string; start_date: string; end_date: string;
  monthly_rent: number; deposit: number; status: string;
}
