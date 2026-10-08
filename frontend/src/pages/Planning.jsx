import { useEffect, useState } from "react";
import api from "../lib/api";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS_FR = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

export default function Planning() {
  const [items, setItems] = useState([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  useEffect(() => { api.get("/interventions").then(r => setItems(r.data)); }, []);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Planning</h1><p className="text-sm text-slate-500">Vue hebdomadaire des interventions</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="btn-secondary"><ChevronLeft size={16} /></button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="btn-secondary">Aujourd'hui</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="btn-secondary"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex items-center gap-2 text-sm font-medium text-slate-600">
          <CalendarDays size={16} /> Semaine du {weekStart.getDate()} {MONTHS_FR[weekStart.getMonth()]} {weekStart.getFullYear()}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x">
          {days.map((d, i) => {
            const dayItems = items.filter(it => isSameDay(new Date(it.scheduledAt), d));
            const today = isSameDay(d, new Date());
            return (
              <div key={i} className="p-3 min-h-[180px]">
                <div className={"mb-2 pb-2 border-b " + (today ? "text-brand-600" : "")}>
                  <p className="text-xs uppercase">{DAYS_FR[d.getDay()]}</p>
                  <p className={"text-lg font-bold " + (today ? "text-brand-600" : "")}>{d.getDate()}</p>
                </div>
                <div className="space-y-2">
                  {dayItems.map(it => (
                    <div key={it.id} className="bg-brand-50 border-l-2 border-brand-500 rounded p-2 text-xs">
                      <p className="font-medium text-brand-900 truncate">{it.title}</p>
                      <p className="text-brand-700 truncate">{it.site && it.site.name}</p>
                      <p className="text-slate-500">{new Date(it.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ))}
                  {dayItems.length === 0 && <p className="text-xs text-slate-300">-</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
