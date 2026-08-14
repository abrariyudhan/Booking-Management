"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBooking, getServices, Service } from "@/lib/api";

interface FieldErrors {
  customerName?: string;
  customerEmail?: string;
  serviceId?: string;
  date?: string;
  time?: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => setServerError("Failed to load services"));
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === serviceId),
    [services, serviceId],
  );

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!customerName.trim()) next.customerName = "Customer name is required.";
    if (!customerEmail.trim()) {
      next.customerEmail = "Customer email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      next.customerEmail = "Enter a valid email address.";
    }
    if (!serviceId) next.serviceId = "Select a service.";
    if (!date) next.date = "Pick a date.";
    if (!time) next.time = "Pick a time.";
    return next;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const start = new Date(`${date}T${time}`);
    if (Number.isNaN(start.getTime())) {
      setErrors({ time: "Enter a valid date and time." });
      return;
    }

    if (!selectedService) {
      setServerError("Select a service.");
      return;
    }

    const end = new Date(start.getTime() + selectedService.duration * 60000);

    setSubmitting(true);
    try {
      await createBooking({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        serviceId: selectedService.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      router.push("/bookings");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to create booking");
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1>New booking</h1>
      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="customerName">Customer name</label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Jane Doe"
            />
            {errors.customerName && <p className="error">{errors.customerName}</p>}
          </div>

          <div className="field">
            <label htmlFor="customerEmail">Customer email</label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="jane@example.com"
            />
            {errors.customerEmail && <p className="error">{errors.customerEmail}</p>}
          </div>

          <div className="field">
            <label htmlFor="serviceId">Service</label>
            <select
              id="serviceId"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">Select a service…</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min)
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="error">{errors.serviceId}</p>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <p className="error">{errors.date}</p>}
            </div>
            <div className="field">
              <label htmlFor="time">Start time</label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              {errors.time && <p className="error">{errors.time}</p>}
            </div>
          </div>

          {serverError && <p className="error">{serverError}</p>}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create booking"}
            </button>
            <Link href="/bookings" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
