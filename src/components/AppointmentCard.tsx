type Appointment = {
  id: string;
  start: string | Date;
  end: string | Date;
  summary: string;
};

export default function AppointmentCard({ appt }: { appt: Appointment }) {
  const start = typeof appt.start === "string" ? new Date(appt.start) : appt.start;
  const end = typeof appt.end === "string" ? new Date(appt.end) : appt.end;
  return (
    <div className="border rounded p-3">
      <div className="font-medium">{appt.summary}</div>
      <div className="text-sm text-gray-600">{start.toLocaleString()} → {end.toLocaleString()}</div>
    </div>
  );
}


