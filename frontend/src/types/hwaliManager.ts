// frontend/src/types/hwaliManager.ts

// Represents a user from the 'users' table
export interface User {
  id: string; // UUID is a string in TypeScript
  name: string;
  email: string;
  role: "admin" | "manager" | "worker" | "driver" | "customer";
  store_id?: string;
}

// Represents a store from the 'stores' table
export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
}

// Represents an item from the 'hwali_items' table
export interface HwaliItem {
  id: string;
  description: string;
  current_status:
    | "requested"
    | "picking_up"
    | "working"
    | "wrapping"
    | "ready"
    | "on_the_way"
    | "delivered";
  assigned_worker_id?: string;
  assigned_driver_id?: string;
}

// Represents a pickup request from the 'pickup_requests' table
export interface PickupRequest {
  id: string;
  store_id: string;
  status: "requested" | "scheduled" | "picked_up" | "cancelled";
  notes?: string;
}
