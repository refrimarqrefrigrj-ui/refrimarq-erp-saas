import { Megaphone } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function CampanhasPage() {
  return (
    <ComingSoon
      title="Campanhas"
      description="Campanhas de marketing, origem dos leads e retorno sobre investimento (ROI) por canal."
      Icon={Megaphone}
    />
  );
}
