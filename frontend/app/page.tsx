import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <h1>Booking Management</h1>
      <p>
        Internal operational tool to manage customer bookings for available
        services.
      </p>
      <div className="grid-cta">
        <div className="cta-card">
          <h2>Create a booking</h2>
          <p>Book a customer for an available service.</p>
          <Link href="/bookings/new" className="btn">
            New booking
          </Link>
        </div>
        <div className="cta-card">
          <h2>View bookings</h2>
          <p>Browse all bookings and update their status.</p>
          <Link href="/bookings" className="btn btn-secondary">
            Bookings list
          </Link>
        </div>
        <div className="cta-card">
          <h2>Available services</h2>
          <p>See the services and their durations.</p>
          <Link href="/services" className="btn btn-secondary">
            Services
          </Link>
        </div>
      </div>
    </>
  );
}
