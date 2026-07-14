import {
  LayoutDashboard,
  Users,
  Wind,
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
  { label: "Equipamentos", href: "/equipamentos", icon: Wind, disabled: true },
  {
    label: "Ordens de Serviço",
    href: "/ordens",
    icon: ClipboardList,
    disabled: true,
  },
  { label: "Agenda", href: "/agenda", icon: CalendarDays, disabled: true },
  { label: "Orçamentos", href: "/orcamentos", icon: FileText, disabled: true },
  { label: "Financeiro", href: "/financeiro", icon: Wallet, disabled: true },
];
