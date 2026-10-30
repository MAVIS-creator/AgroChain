import { useEffect, useState } from "react";

export default function SecurityPage({ activeRoleLabel, securityRequest }) {
  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyIncident, setBusyIncident] = useState("");

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventData, incidentData] = await Promise.all([
        securityRequest("GET", "/api/security/events"),
        securityRequest("GET", "/api/security/incidents"),
      ]);
      setEvents(eventData.events || []);
      setIncidents(incidentData.incidents || []);
    } catch (err) {
      setError(err?.message || "Could not load security telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRoleLabel === "ADMINISTRATOR") reload();
    else {
      setEvents([]);
      setIncidents([]);
    }
  }, [activeRoleLabel, securityRequest]);

  const updateIncident = async (incident, action) => {
    const note = action === "resolve" ? "Resolved by the connected administrator." : "Acknowledged for investigation.";
    setBusyIncident(incident.id);
    setError("");
    try {
      await securityRequest("POST", `/api/security/incidents/${incident.id}/action`, { action, note });
      await reload();
    } catch (err) {
      setError(err?.message || "Incident update failed.");
    } finally {
      setBusyIncident("");
    }
  };

  if (activeRoleLabel !== "ADMINISTRATOR") {
    return (
      <main className="mx-auto mt-24 mb-16 max-w-4xl px-4">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          Connect the registered administrator wallet to view and manage security telemetry.
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-24 mb-16 w-full max-w-6xl space-y-6 px-4 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Application telemetry</p>
          <h1 className="mt-1 text-3xl font-extrabold text-emerald-950">Security Operations</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Events observed by this local AgroChain application. This is not network-wide threat detection.</p>
        </div>
        <button type="button" onClick={reload} disabled={loading} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white disabled:opacity-50">
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Incidents ({incidents.length})</h2>
        {incidents.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No security incidents have been recorded.</p>}
        {incidents.map((incident) => (
          <article key={incident.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">{incident.title}</h3>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">{incident.severity}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{incident.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{incident.evidence}</p>
                <p className="mt-1 text-xs text-slate-500">{incident.id} · {new Date(incident.createdAt).toLocaleString()} · {incident.actor}</p>
              </div>
              <div className="flex gap-2">
                {incident.status === "OPEN" && <button type="button" disabled={busyIncident === incident.id} onClick={() => updateIncident(incident, "investigate")} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Investigate</button>}
                {incident.status === "INVESTIGATING" && <button type="button" disabled={busyIncident === incident.id} onClick={() => updateIncident(incident, "resolve")} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Resolve</button>}
              </div>
            </div>
            {incident.history?.length > 0 && <ol className="mt-4 space-y-1 border-l-2 border-emerald-100 pl-3 text-xs text-slate-600">{incident.history.map((entry, index) => <li key={`${incident.id}-${index}`}>{entry.status} · {new Date(entry.timestamp).toLocaleString()} · {entry.note}</li>)}</ol>}
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Recent events ({events.length})</h2>
        {events.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No application security events have been recorded.</p>}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Time</th><th className="p-3">Event</th><th className="p-3">Severity</th><th className="p-3">Actor</th><th className="p-3">Evidence</th></tr></thead>
            <tbody>{events.map((event) => <tr key={event.id} className="border-t border-slate-100"><td className="whitespace-nowrap p-3 text-xs">{new Date(event.timestamp).toLocaleString()}</td><td className="p-3 font-semibold">{event.eventType}</td><td className="p-3">{event.severity}</td><td className="p-3 font-mono text-xs">{event.actor}</td><td className="p-3">{event.summary}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
