import { Request, Response } from "express";

interface RouteInfo {
  method: string;
  path: string;
  description?: string;
  auth: boolean;
}

interface CategoryInfo {
  name: string;
  basePath: string;
  routes: RouteInfo[];
}

// Documentação completa baseada no frontend
export const routesDocumentation: CategoryInfo[] = [
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
        description: "Registro de novo usuário",
        auth: false,
      },
      { method: "POST", path: "/logout", description: "Logout", auth: true },
      {
        method: "GET",
        path: "/me",
        description: "Dados do usuário logado",
        auth: true,
      },
      {
        method: "POST",
        path: "/refresh-token",
        description: "Renovar token JWT",
        auth: false,
      },
    ],
  },
  {
    name: "Núcleos",
    basePath: "/nucleos",
    routes: [
      {
        method: "GET",
        path: "/",
        description: "Listar núcleos do usuário",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id",
        description: "Buscar núcleo por ID",
        auth: true,
      },
      {
        method: "POST",
        path: "/",
        description: "Criar novo núcleo",
        auth: true,
      },
      {
        method: "PUT",
        path: "/:id",
        description: "Atualizar núcleo",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/:id",
        description: "Deletar núcleo",
        auth: true,
      },
      {
        method: "POST",
        path: "/:id/share",
        description: "Compartilhar núcleo",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id/stats",
        description: "Estatísticas do núcleo",
        auth: true,
      },
      {
        method: "GET",
        path: "/icons",
        description: "Listar ícones disponíveis",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id/relacoes",
        description: "Relações do núcleo",
        auth: true,
      },
      {
        method: "POST",
        path: "/relacoes",
        description: "Criar relação",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/relacoes/:id",
        description: "Deletar relação",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id/achievements",
        description: "Conquistas",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id/xp",
        description: "XP do núcleo",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id/energy",
        description: "Energia do núcleo",
        auth: true,
      },
    ],
  },
  {
    name: "Blocos",
    basePath: "/blocos",
    routes: [
      {
        method: "GET",
        path: "/nucleo/:nucleoId",
        description: "Listar blocos",
        auth: true,
      },
      { method: "GET", path: "/:id", description: "Buscar bloco", auth: true },
      { method: "POST", path: "/", description: "Criar bloco", auth: true },
      {
        method: "PUT",
        path: "/:id",
        description: "Atualizar bloco",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/:id",
        description: "Deletar bloco",
        auth: true,
      },
      {
        method: "POST",
        path: "/reorder",
        description: "Reordenar blocos",
        auth: true,
      },
    ],
  },
  {
    name: "Coleções",
    basePath: "/colecoes",
    routes: [
      {
        method: "GET",
        path: "/bloco/:blocoId",
        description: "Listar coleções",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id",
        description: "Buscar coleção",
        auth: true,
      },
      {
        method: "POST",
        path: "/bloco/:blocoId",
        description: "Criar coleção",
        auth: true,
      },
      {
        method: "PUT",
        path: "/:id",
        description: "Atualizar coleção",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/:id",
        description: "Deletar coleção",
        auth: true,
      },
    ],
  },
  {
    name: "Campos",
    basePath: "/campos",
    routes: [
      {
        method: "GET",
        path: "/colecao/:colecaoId",
        description: "Listar campos",
        auth: true,
      },
      {
        method: "POST",
        path: "/colecao/:colecaoId",
        description: "Criar campo",
        auth: true,
      },
      { method: "GET", path: "/:id", description: "Buscar campo", auth: true },
      {
        method: "PUT",
        path: "/:id",
        description: "Atualizar campo",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/:id",
        description: "Deletar campo",
        auth: true,
      },
    ],
  },
  {
    name: "Itens",
    basePath: "/itens",
    routes: [
      {
        method: "GET",
        path: "/colecao/:colecaoId",
        description: "Listar itens",
        auth: true,
      },
      {
        method: "POST",
        path: "/colecao/:colecaoId",
        description: "Criar item",
        auth: true,
      },
      { method: "GET", path: "/:id", description: "Buscar item", auth: true },
      {
        method: "PUT",
        path: "/:id",
        description: "Atualizar item",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/:id",
        description: "Deletar item",
        auth: true,
      },
    ],
  },
  {
    name: "Tarefas",
    basePath: "/tarefas",
    routes: [
      { method: "GET", path: "/", description: "Listar tarefas", auth: true },
      { method: "GET", path: "/:id", description: "Buscar tarefa", auth: true },
      { method: "POST", path: "/", description: "Criar tarefa", auth: true },
      {
        method: "PUT",
        path: "/:id",
        description: "Atualizar tarefa",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/:id",
        description: "Deletar tarefa",
        auth: true,
      },
      {
        method: "POST",
        path: "/:id/concluir",
        description: "Concluir tarefa",
        auth: true,
      },
      {
        method: "GET",
        path: "/bloco/:blocoId",
        description: "Tarefas do bloco",
        auth: true,
      },
      {
        method: "GET",
        path: "/vencendo",
        description: "Tarefas vencendo",
        auth: true,
      },
    ],
  },
  {
    name: "Hábitos",
    basePath: "/habitos",
    routes: [
      { method: "GET", path: "/", description: "Listar hábitos", auth: true },
      { method: "GET", path: "/:id", description: "Buscar hábito", auth: true },
      { method: "POST", path: "/", description: "Criar hábito", auth: true },
      {
        method: "PUT",
        path: "/:id",
        description: "Atualizar hábito",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/:id",
        description: "Deletar hábito",
        auth: true,
      },
      {
        method: "GET",
        path: "/bloco/:blocoId",
        description: "Hábitos do bloco",
        auth: true,
      },
      {
        method: "POST",
        path: "/:id/registrar",
        description: "Registrar progresso",
        auth: true,
      },
      {
        method: "GET",
        path: "/:id/progresso",
        description: "Progresso do hábito",
        auth: true,
      },
    ],
  },
  {
    name: "Gamificação",
    basePath: "/gamificacao",
    routes: [
      {
        method: "GET",
        path: "/level",
        description: "Nível do usuário",
        auth: true,
      },
      {
        method: "GET",
        path: "/conquistas",
        description: "Conquistas",
        auth: true,
      },
      { method: "GET", path: "/streaks", description: "Streaks", auth: true },
      {
        method: "POST",
        path: "/add-xp",
        description: "Adicionar XP",
        auth: true,
      },
      {
        method: "POST",
        path: "/atualizar-streak",
        description: "Atualizar streak",
        auth: true,
      },
      {
        method: "POST",
        path: "/desbloquear-conquista",
        description: "Desbloquear conquista",
        auth: true,
      },
    ],
  },
  {
    name: "Usuários",
    basePath: "/users",
    routes: [
      { method: "GET", path: "/me", description: "Meu perfil", auth: true },
      {
        method: "PUT",
        path: "/profile",
        description: "Atualizar perfil",
        auth: true,
      },
      {
        method: "POST",
        path: "/avatar",
        description: "Upload avatar",
        auth: true,
      },
      { method: "GET", path: "/level", description: "Meu nível", auth: true },
      {
        method: "GET",
        path: "/:id/level",
        description: "Nível de usuário",
        auth: true,
      },
      {
        method: "GET",
        path: "/xp-logs",
        description: "Logs de XP",
        auth: true,
      },
      {
        method: "GET",
        path: "/energy-logs",
        description: "Logs de energia",
        auth: true,
      },
      {
        method: "GET",
        path: "/notifications",
        description: "Notificações",
        auth: true,
      },
      {
        method: "GET",
        path: "/ai-context",
        description: "Contexto IA",
        auth: true,
      },
      {
        method: "GET",
        path: "/ai-insights",
        description: "Insights IA",
        auth: true,
      },
    ],
  },
];

// Interface HTML para visualização
export const getRoutesHTML = (baseUrl: string = "/api/v1"): string => {
  const totalRoutes = routesDocumentation.reduce(
    (acc, cat) => acc + cat.routes.length,
    0,
  );

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nucleos API - Rotas</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .header h1 { color: #333; font-size: 2.5rem; margin-bottom: 10px; }
        .header p { color: #666; font-size: 1.1rem; }
        .stats { display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap; }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-card .number { font-size: 2rem; font-weight: bold; }
        .stat-card .label { font-size: 0.9rem; opacity: 0.9; }
        .category {
            background: white;
            border-radius: 12px;
            margin-bottom: 20px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .category-header {
            background: #f7f7f7;
            padding: 20px 25px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #667eea;
        }
        .category-header h2 { color: #333; font-size: 1.5rem; }
        .category-header .badge {
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
        }
        .category-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
        .category-content.open { max-height: 2000px; }
        .route-table { width: 100%; border-collapse: collapse; }
        .route-table th {
            text-align: left;
            padding: 15px 20px;
            background: #fafafa;
            color: #666;
            font-weight: 600;
            border-bottom: 1px solid #e0e0e0;
        }
        .route-table td { padding: 12px 20px; border-bottom: 1px solid #f0f0f0; color: #555; }
        .method {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        .method.get { background: #4caf50; color: white; }
        .method.post { background: #2196f3; color: white; }
        .method.put { background: #ff9800; color: white; }
        .method.delete { background: #f44336; color: white; }
        .auth-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: bold;
        }
        .auth-true { background: #ff9800; color: white; }
        .auth-false { background: #4caf50; color: white; }
        .path { font-family: monospace; font-size: 0.85rem; color: #667eea; }
        .footer { text-align: center; padding: 30px; color: white; opacity: 0.8; }
        .search-box {
            width: 100%;
            padding: 12px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            margin-bottom: 20px;
        }
        .search-box:focus { outline: none; border-color: #667eea; }
        .toggle-icon { font-size: 1.2rem; transition: transform 0.2s; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Nucleos API</h1>
            <p>Documentação completa de todas as rotas disponíveis</p>
            <div class="stats">
                <div class="stat-card"><div class="number">${routesDocumentation.length}</div><div class="label">Categorias</div></div>
                <div class="stat-card"><div class="number">${totalRoutes}</div><div class="label">Endpoints</div></div>
            </div>
        </div>
        <input type="text" class="search-box" id="search" placeholder="🔍 Buscar rotas...">
        <div id="categories">
            ${routesDocumentation
              .map(
                (category, idx) => `
                <div class="category">
                    <div class="category-header" onclick="toggleCategory(${idx})">
                        <h2>📁 ${category.name}</h2>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span class="badge">${category.routes.length} rotas</span>
                            <span class="toggle-icon">▼</span>
                        </div>
                    </div>
                    <div class="category-content" id="category-${idx}">
                        <table class="route-table">
                            <thead><tr><th>Método</th><th>Rota</th><th>Descrição</th><th>Auth</th></tr></thead>
                            <tbody>
                                ${category.routes
                                  .map(
                                    (route) => `
                                    <tr class="route-row" data-search="${route.method} ${route.path} ${route.description} ${category.name}">
                                        <td><span class="method ${route.method.toLowerCase()}">${route.method}</span></td>
                                        <td><span class="path">${baseUrl}${category.basePath}${route.path}</span></td>
                                        <td>${route.description || "-"}</td>
                                        <td><span class="auth-badge auth-${route.auth}">${route.auth ? "🔒 Protegida" : "🌐 Pública"}</span></td>
                                    </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>
        <div class="footer"><p>⚡ Nucleos API v1.0.0 | Desenvolvido com TypeScript, Express e Socket.IO</p></div>
    </div>
    <script>
        function toggleCategory(index) {
            const content = document.getElementById('category-' + index);
            const icon = content.parentElement.querySelector('.toggle-icon');
            content.classList.toggle('open');
            icon.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
        setTimeout(() => toggleCategory(0), 100);
        document.getElementById('search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.route-row').forEach(row => {
                row.style.display = row.getAttribute('data-search').toLowerCase().includes(term) ? '' : 'none';
            });
        });
    </script>
</body>
</html>`;
};

// Setup da interface de rotas
export const setupRouteInterface = (app: any, baseUrl: string = "/api/v1") => {
  app.get("/routes", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html");
    res.send(getRoutesHTML(baseUrl));
  });

  app.get("/routes/json", (req: Request, res: Response) => {
    res.json({
      totalCategories: routesDocumentation.length,
      totalRoutes: routesDocumentation.reduce(
        (acc, cat) => acc + cat.routes.length,
        0,
      ),
      categories: routesDocumentation,
    });
  });
};
