export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface Service {
  id: number;
  name: string;
  duration: number;
}

export interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  serviceId: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  service: Service;
}

export interface CreateBookingInput {
  customerName: string;
  customerEmail: string;
  serviceId: number;
  startTime: string;
  endTime: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.message ?? `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function getServices(): Promise<Service[]> {
  return fetch(`${API_URL}/services`).then((res) => handle<Service[]>(res));
}

export function getBookings(): Promise<Booking[]> {
  return fetch(`${API_URL}/bookings`).then((res) => handle<Booking[]>(res));
}

export function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  return fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((res) => handle<Booking>(res));
}

export function updateBookingStatus(
  id: number,
  status: BookingStatus,
): Promise<Booking> {
  return fetch(`${API_URL}/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then((res) => handle<Booking>(res));
}
