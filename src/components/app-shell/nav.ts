import {
  LayoutDashboard,
  Users,
  Wind,
  Building2,
  ClipboardList,
  CalendarDays,
  FileText,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Módulo ainda não construído — aparece como "Em breve" e não navega. */
  disabled?: boolean;
};

/**
 * Navegação principal do ERP. A ordem reflete o roadmap do MVP.
 * Itens `disabled` mostram ao usuário o que está por vir (visão do produto).
 */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Equipamentos", href: "/equipamentos", icon: Wind },
  { label: "Obras", href: "/obras", icon: Building2 },
  {
    label: "Ordens de Serviço",
    href: "/ordens",
    icon: ClipboardList,
    disabled: true,
  },
  { label: "Agenda", href: "/agenda", icon: CalendarDays, disabled: true },
  { label: "Orçamentos", href: "/orcamentos", icon: FileText, disabled: true },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
];
