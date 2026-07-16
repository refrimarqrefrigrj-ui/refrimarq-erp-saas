import { Target } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function LeadsPage() {
  return (
    <ComingSoon
      title="Leads"
      description="Captação e acompanhamento de potenciais clientes — do primeiro contato ao fechamento, com origem e follow-up."
      Icon={Target}
    />
  );
}
