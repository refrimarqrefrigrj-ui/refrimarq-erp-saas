import type { TenantContext } from "@/shared/domain";
import { listCustomers } from "@/modules/customers/application/list-customers";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import { listEquipment } from "@/modules/equipment/application/list-equipment";
import { drizzleEquipmentRepository } from "@/modules/equipment/infrastructure/drizzle-equipment-repository";
import { listCollaborators } from "@/modules/collaborators/application/collaborator-usecases";
import { drizzleCollaboratorRepository } from "@/modules/collaborators/infrastructure/drizzle-collaborator-repository";

/** Carrega as opções dos selects da OS (cliente, equipamento, técnico). */
export async function loadServiceOrderOptions(ctx: TenantContext) {
  const [customers, equipment, collaborators] = await Promise.all([
    listCustomers(drizzleCustomerRepository, ctx),
    listEquipment(drizzleEquipmentRepository, ctx),
    listCollaborators(drizzleCollaboratorRepository, ctx),
  ]);

  return {
    customers: customers.map((c) => ({ id: c.id, name: c.name })),
    equipmentOptions: equipment.map((e) => {
      const base =
        [e.brand, e.model].filter(Boolean).join(" ").trim() ||
        e.kind ||
        "Equipamento";
      return { id: e.id, label: `${base} — ${e.customerName}` };
    }),
    collaborators: collaborators.map((c) => ({ id: c.id, name: c.name })),
  };
}
