import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * No Next 16, o antigo "middleware" chama-se `proxy`.
 *
 * Aqui apenas conectamos o Clerk ao ciclo de request (a sessão passa a estar
 * disponível em toda a aplicação via `auth()`).
 *
 * A PROTEÇÃO de rotas NÃO é feita aqui por casamento de caminho — abordagem
 * que o Clerk passou a desaconselhar, pois path-matching pode divergir do
 * roteamento real do Next e deixar recursos acessíveis. Em vez disso, cada
 * área protegida verifica a sessão no seu próprio layout/página
 * (resource-based auth). Ver `src/app/dashboard/layout.tsx`.
 */
export const proxy = clerkMiddleware();

export const config = {
  matcher: [
    // Roda em todas as rotas, exceto arquivos estáticos e internos do Next.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?:.*)|api|trpc)(.*)",
  ],
};
