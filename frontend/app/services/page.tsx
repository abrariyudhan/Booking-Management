"use client";

import { useEffect, useState } from "react";
import { getServices, Service } from "@/lib/api";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load services"));
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (services === null) {
    return <p>Loading services…</p>;
  }

  return (
    <>
      <h1>Available services</h1>
      {services.length === 0 ? (
        <p className="empty">No services available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.duration} minutes</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
