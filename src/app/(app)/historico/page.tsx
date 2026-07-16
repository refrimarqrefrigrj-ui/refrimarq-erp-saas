import { History } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function HistoricoPage() {
  return (
    <ComingSoon
      title="Histórico de serviço"
      description="Linha do tempo de todos os atendimentos, instalações e manutenções — por cliente e por equipamento."
      Icon={History}
    />
  );
}
