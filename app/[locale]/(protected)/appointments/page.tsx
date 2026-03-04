import { redirect } from "next/navigation";

export default function AppointmentsPageRedirect() {
  redirect("/bookings");
}
