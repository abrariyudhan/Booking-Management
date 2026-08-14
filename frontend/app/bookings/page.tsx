"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Booking,
  BookingStatus,
  getBookings,
  updateBookingStatus,
} from "@/lib/api";

const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load bookings"));
  }, []);

  const handleStatusChange = useCallback(
    async (booking: Booking, status: BookingStatus) => {
      setError(null);
      setUpdatingId(booking.id);
      const previous = bookings;
      setBookings((current) =>
        current?.map((b) => (b.id === booking.id ? { ...b, status } : b)) ??
        current,
      );
      try {
        const updated = await updateBookingStatus(booking.id, status);
        setBookings((current) =>
          current?.map((b) => (b.id === updated.id ? updated : b)) ?? current,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status");
        setBookings(previous);
      } finally {
        setUpdatingId(null);
      }
    },
    [bookings],
  );

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (bookings === null) {
    return <p>Loading bookings…</p>;
  }

  return (
    <>
      <h1>Bookings</h1>
      <Link href="/bookings/new" className="btn">
        New booking
      </Link>
      <div style={{ height: 16 }} />
      {bookings.length === 0 ? (
        <p className="empty">No bookings yet. Create your first booking.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const nextStatuses = NEXT_STATUSES[booking.status] ?? [];
              return (
                <tr key={booking.id}>
                  <td>
                    {booking.customerName}
                    <br />
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>
                      {booking.customerEmail}
                    </span>
                  </td>
                  <td>{booking.service?.name ?? `Service #${booking.serviceId}`}</td>
                  <td>
                    {formatDateTime(booking.startTime)}
                    <br />
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>
                      ends {formatDateTime(booking.endTime)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${booking.status.toLowerCase()}`}>
                      {booking.status.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    {nextStatuses.length > 0 ? (
                      <select
                        value=""
                        disabled={updatingId === booking.id}
                        onChange={(e) =>
                          handleStatusChange(
                            booking,
                            e.target.value as BookingStatus,
                          )
                        }
                        style={{ width: "auto" }}
                      >
                        <option value="" disabled>
                          {updatingId === booking.id ? "Updating…" : "Change status"}
                        </option>
                        {nextStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.toLowerCase()}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 13 }}>
                        No further updates
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
