# Módulos de negócio

Cada subpasta aqui é um **domínio de negócio** independente ("fatia vertical").
Abrir a pasta de um módulo deve ser suficiente para entender tudo sobre ele.

## Anatomia de um módulo

```
<modulo>/
├── domain/           # Entidades, value objects e regras puras. Sem framework.
├── application/      # Casos de uso. Dependem de interfaces (ports), não de infra.
└── infrastructure/   # Implementações: repositórios Drizzle, gateways de integração.
```

## Roadmap de módulos

**MVP (Núcleo Operacional):** `customers` · `equipment` · `service-orders` ·
`scheduling` · `quotes` · `finance` · `dashboard`

**Fase 2:** `contracts` · `pmoc` · `technicians` · app offline do técnico
**Fase 3:** `crm` · `automations` · `client-portal`
**Fase 4:** `inventory` · `purchasing`
**Fase 5:** `fiscal` (NF-e/NFS-e) · `payments`
**Fase 6:** `ai`

> Ver `docs/ARCHITECTURE.md` para as regras de dependência entre as camadas.
