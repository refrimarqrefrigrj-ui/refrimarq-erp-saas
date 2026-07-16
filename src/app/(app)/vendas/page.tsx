import { ShoppingCart } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function VendasPage() {
  return (
    <ComingSoon
      title="Vendas"
      description="Funil de vendas, propostas e conversão de leads em clientes — com etapas e acompanhamento de resultado."
      Icon={ShoppingCart}
    />
  );
}
