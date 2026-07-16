import {
  LayoutDashboard,
  BarChart3,
  Target,
  ShoppingCart,
  Megaphone,
  Users,
  HardHat,
  Wind,
  Building2,
  CalendarDays,
  ClipboardList,
  History,
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
 * Navegação principal do ERP. A ordem agrupa por área (visão geral,
 * comercial, cadastros/operação, agenda/atendimento, financeiro).
 * Itens `disabled` mostram ao usuário o que está por vir (visão do produto).
 */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Métricas", href: "/metricas", icon: BarChart3 },

  { label: "Leads", href: "/leads", icon: Target },
  { label: "Vendas", href: "/vendas", icon: ShoppingCart },
  { label: "Campanhas", href: "/campanhas", icon: Megaphone },

  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Colaboradores", href: "/colaboradores", icon: HardHat },
  { label: "Equipamentos", href: "/equipamentos", icon: Wind },
  { label: "Obras", href: "/obras", icon: Building2 },

  { label: "Calendário", href: "/calendario", icon: CalendarDays },
  {
    label: "Ordens de Serviço",
    href: "/ordens",
    icon: ClipboardList,
    disabled: true,
  },
  { label: "Histórico de serviço", href: "/historico", icon: History },

  { label: "Orçamentos", href: "/orcamentos", icon: FileText, disabled: true },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
];
