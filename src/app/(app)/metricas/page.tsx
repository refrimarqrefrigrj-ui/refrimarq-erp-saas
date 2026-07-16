import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function MetricasPage() {
  return (
    <ComingSoon
      title="Métricas"
      description="Indicadores e gráficos de desempenho do negócio — faturamento, conversão, produtividade dos técnicos e evolução no tempo."
      Icon={BarChart3}
    />
  );
}
