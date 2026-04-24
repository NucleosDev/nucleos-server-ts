// Copie TODO o conteúdo do seu health.ts aqui
// Que tem a interface RouteInfo, CategoryInfo e routesDocumentation

export interface RouteInfo {
  method: string;
  path: string;
  description?: string;
  auth: boolean;
}

export interface CategoryInfo {
  name: string;
  basePath: string;
  routes: RouteInfo[];
}

export const routesDocumentation: CategoryInfo[] = [
  // Coloque TODO o array que você já tem no health.ts
  {
    name: "Autenticação",
    basePath: "/Auth",
    routes: [
      {
        method: "POST",
        path: "/login",
        description: "Login de usuário",
        auth: false,
      },
      {
        method: "POST",
        path: "/register",
        description: "Registro",
        auth: false,
      },
      { method: "POST", path: "/logout", description: "Logout", auth: true },
      {
        method: "GET",
        path: "/me",
        description: "Dados do usuário",
        auth: true,
      },
      {
        method: "POST",
        path: "/refresh-token",
        description: "Renovar token",
        auth: false,
      },
    ],
  },
  // ... adicione as outras categorias
];
