import { CalendarDays } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function CalendarioPage() {
  return (
    <ComingSoon
      title="Calendário"
      description="Agenda visual de atendimentos, instalações e manutenções — com visão por dia, semana e mês, e arrastar e soltar."
      Icon={CalendarDays}
    />
  );
}
