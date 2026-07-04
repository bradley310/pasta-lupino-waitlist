import { useState, useEffect } from "react";

const WAIT_OPTIONS = [10, 15, 20, 25, 30, 40, 45, 60];

function formatPhone(val) {
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function minutesWaiting(ts) {
  return Math.floor((Date.now() - ts) / 60000);
}

const STATUS_COLORS = {
  waiting: { bg: "#fff8ed", dot: "#f59e0b", label: "Waiting" },
  notified: { bg: "#eff6ff", dot: "#3b82f6", label: "Notified" },
  seated: { bg: "#f0fdf4", dot: "#22c55e", label: "Seated" },
};

export default function WaitlistApp() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pl_waitlist") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ name: "", phone: "", wait: 20, guests: 2 });
  const [tableInput, setTableInput] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pl_tableInput") || "{}"); } catch { return {}; }
  });
  const [tick, setTick] = useState(0);
  const [notifLog, setNotifLog] = useState([]);

  // Persist entries to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem("pl_waitlist", JSON.stringify(entries)); } catch {}
  }, [entries]);

  useEffect(() => {
    try { localStorage.setItem("pl_tableInput", JSON.stringify(tableInput)); } catch {}
  }, [tableInput]);

  // Tick every 30s to refresh wait times
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  function addEntry() {
    if (!form.name.trim() || form.phone.replace(/\D/g, "").length < 10) return;
    setEntries(prev => [
      ...prev,
      {
        id: Date.now(),
        name: form.name.trim(),
        phone: form.phone,
        wait: form.wait,
        guests: form.guests,
        addedAt: Date.now(),
        status: "waiting",
        table: "",
      },
    ]);
    setForm({ name: "", phone: "", wait: 20, guests: 2 });
  }

  function notify(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const digits = entry.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hi ${entry.name}! Your table at Pasta Lupino is ready. Please come in now. See you soon! 🍝`
    );
    window.open(`sms:+1${digits}?body=${msg}`, "_blank");
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, status: "notified", notifiedAt: Date.now() } : e))
    );
    setNotifLog(prev => [
      { id, name: entry.name, at: Date.now() },
      ...prev.slice(0, 9),
    ]);
  }

  function seat(id) {
    const tbl = tableInput[id] || "";
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, status: "seated", table: tbl, seatedAt: Date.now() } : e))
    );
  }

  function remove(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function updateTable(id, val) {
    setTableInput(prev => ({ ...prev, [id]: val }));
  }

  const active = entries.filter(e => e.status !== "seated");
  const seated = entries.filter(e => e.status === "seated");

  const phoneValid = form.phone.replace(/\D/g, "").length === 10;
  const nameValid = form.name.trim().length > 0;
  const canAdd = phoneValid && nameValid;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1208",
      fontFamily: "'Georgia', serif",
      color: "#f5ede0",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2d1f0e 0%, #1a1208 100%)",
        borderBottom: "1px solid #3d2a14",
        padding: "20px 24px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{ fontSize: 28 }}>🍝</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 1, color: "#f0c060" }}>
            Pasta Lupino
          </div>
          <div style={{ fontSize: 12, color: "#a0845a", letterSpacing: 2, textTransform: "uppercase" }}>
            Walk-in Waitlist
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: "bold", color: "#f0c060" }}>{active.length}</div>
          <div style={{ fontSize: 11, color: "#a0845a", textTransform: "uppercase", letterSpacing: 1 }}>
            Waiting
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 520, margin: "0 auto" }}>
        {/* Add Form */}
        <div style={{
          background: "#241609",
          border: "1px solid #3d2a14",
          borderRadius: 12,
          padding: "18px 16px",
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: "bold", letterSpacing: 1, color: "#f0c060", marginBottom: 14, textTransform: "uppercase" }}>
            Add to Waitlist
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              placeholder="Guest name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && canAdd && addEntry()}
              style={inputStyle}
            />
            <input
              placeholder="Phone number"
              value={form.phone}
              inputMode="tel"
              onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
              onKeyDown={e => e.key === "Enter" && canAdd && addEntry()}
              style={{
                ...inputStyle,
                borderColor: form.phone && !phoneValid ? "#c0392b" : "#3d2a14",
              }}
            />

            <div>
              <div style={{ fontSize: 11, color: "#a0845a", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Guests
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <button
                    key={n}
                    onClick={() => setForm(f => ({ ...f, guests: n }))}
                    style={{
                      width: 36, height: 36,
                      borderRadius: 8,
                      border: "1px solid",
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: "Georgia, serif",
                      fontWeight: form.guests === n ? "bold" : "normal",
                      background: form.guests === n ? "#f0c060" : "transparent",
                      borderColor: form.guests === n ? "#f0c060" : "#3d2a14",
                      color: form.guests === n ? "#1a1208" : "#a0845a",
                      transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#a0845a", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Quoted wait
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {WAIT_OPTIONS.map(w => (
                  <button
                    key={w}
                    onClick={() => setForm(f => ({ ...f, wait: w }))}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      border: "1px solid",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "Georgia, serif",
                      transition: "all 0.15s",
                      background: form.wait === w ? "#f0c060" : "transparent",
                      borderColor: form.wait === w ? "#f0c060" : "#3d2a14",
                      color: form.wait === w ? "#1a1208" : "#a0845a",
                      fontWeight: form.wait === w ? "bold" : "normal",
                    }}
                  >
                    {w}m
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addEntry}
              disabled={!canAdd}
              style={{
                background: canAdd ? "#f0c060" : "#2d1f0e",
                color: canAdd ? "#1a1208" : "#5a4030",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontSize: 15,
                fontWeight: "bold",
                fontFamily: "Georgia, serif",
                cursor: canAdd ? "pointer" : "not-allowed",
                letterSpacing: 0.5,
                transition: "all 0.15s",
                marginTop: 2,
              }}
            >
              + Add Guest
            </button>
          </div>
        </div>

        {/* Active Queue */}
        {active.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#a0845a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              Queue — {active.length} {active.length === 1 ? "party" : "parties"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {active.map((entry, i) => {
                const waited = minutesWaiting(entry.addedAt);
                const overdue = waited > entry.wait;
                const sc = STATUS_COLORS[entry.status];
                return (
                  <div key={entry.id} style={{
                    background: overdue ? "#2d1209" : "#241609",
                    border: `1px solid ${overdue ? "#7f1d1d" : "#3d2a14"}`,
                    borderLeft: `4px solid ${overdue ? "#ef4444" : entry.status === "notified" ? "#3b82f6" : "#f0c060"}`,
                    borderRadius: 10,
                    padding: "14px 14px 12px",
                    transition: "all 0.2s",
                  }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "#2d1f0e",
                        border: "1px solid #3d2a14",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: "#f0c060", fontWeight: "bold", flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: 16, color: "#f5ede0" }}>{entry.name}</div>
                        <div style={{ fontSize: 12, color: "#a0845a", marginTop: 2 }}>
                          {entry.phone} · {entry.guests} {entry.guests === 1 ? "guest" : "guests"} · Quoted {entry.wait}m
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: overdue ? "#ef4444" : waited > entry.wait * 0.8 ? "#f59e0b" : "#f5ede0",
                        }}>
                          {waited}m
                        </div>
                        <div style={{ fontSize: 11, color: "#a0845a" }}>waited</div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot }} />
                      <span style={{ fontSize: 11, color: "#a0845a", textTransform: "uppercase", letterSpacing: 1 }}>
                        {sc.label}
                        {entry.status === "notified" && entry.notifiedAt && ` · ${timeAgo(entry.notifiedAt)}`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        onClick={() => notify(entry.id)}
                        style={{
                          ...actionBtn,
                          background: entry.status === "notified" ? "#1e3a5f" : "#1e3a5f",
                          borderColor: "#3b82f6",
                          color: "#93c5fd",
                          flex: 1,
                        }}
                      >
                        📱 {entry.status === "notified" ? "Re-notify" : "Text Ready"}
                      </button>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <input
                          placeholder="Table #"
                          value={tableInput[entry.id] || ""}
                          onChange={e => updateTable(entry.id, e.target.value)}
                          style={{
                            ...inputStyle,
                            width: 70,
                            textAlign: "center",
                            padding: "8px 6px",
                            fontSize: 14,
                          }}
                        />
                        <span style={{ fontSize: 9, color: "#4a3020", letterSpacing: 0.5, textTransform: "uppercase" }}>
                          🔒 staff only
                        </span>
                      </div>

                      <button
                        onClick={() => seat(entry.id)}
                        style={{
                          ...actionBtn,
                          background: "#14402a",
                          borderColor: "#22c55e",
                          color: "#86efac",
                        }}
                      >
                        ✓ Seat
                      </button>

                      <button
                        onClick={() => remove(entry.id)}
                        style={{
                          ...actionBtn,
                          background: "transparent",
                          borderColor: "#3d2a14",
                          color: "#6b4c2a",
                          padding: "8px 10px",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {active.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#4a3020",
            border: "1px dashed #3d2a14",
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🍷</div>
            <div style={{ fontSize: 14 }}>No one waiting right now</div>
          </div>
        )}

        {/* Recently Seated */}
        {seated.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "#4a3020", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
              Seated today — {seated.length}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {seated.slice().reverse().map(entry => (
                <div key={entry.id} style={{
                  background: "#1a1208",
                  border: "1px solid #2a1a08",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: 0.6,
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: "bold", color: "#7a5a38" }}>{entry.name}</span>
                    {entry.table && <span style={{ fontSize: 12, color: "#5a3a18", marginLeft: 8 }}>Table {entry.table}</span>}
                    <span style={{ fontSize: 12, color: "#4a2a08", marginLeft: 8 }}>{entry.guests} guests</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#4a2a08" }}>
                    {entry.seatedAt ? timeAgo(entry.seatedAt) : ""}
                  </div>
                  <button
                    onClick={() => remove(entry.id)}
                    style={{ background: "none", border: "none", color: "#4a2a08", cursor: "pointer", fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#1a1208",
  border: "1px solid #3d2a14",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 15,
  color: "#f5ede0",
  fontFamily: "Georgia, serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const actionBtn = {
  border: "1px solid",
  borderRadius: 7,
  padding: "8px 12px",
  fontSize: 13,
  fontFamily: "Georgia, serif",
  cursor: "pointer",
  fontWeight: "bold",
  letterSpacing: 0.3,
};
