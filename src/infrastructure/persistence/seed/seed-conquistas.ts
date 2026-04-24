import { pool } from "../db/connection";

export async function seedConquistas() {
  const conquistas = [
    {
      nome: "Primeiro Nucleo",
      descricao: "Crie seu primeiro nucleo",
      tipo: "creation",
      condicao: { type: "count", target: 1 },
      xp_recompensa: 100,
    },
    {
      nome: "Mestre Construtor",
      descricao: "Crie 10 blocos",
      tipo: "creation",
      condicao: { type: "count", target: 10 },
      xp_recompensa: 500,
    },
    {
      nome: "Produtivo",
      descricao: "Complete 10 tarefas",
      tipo: "progress",
      condicao: { type: "count", target: 10 },
      xp_recompensa: 300,
    },
    {
      nome: "Consistente",
      descricao: "Streak de 7 dias",
      tipo: "streak",
      condicao: { type: "streak", target: 7 },
      xp_recompensa: 150,
    },
    {
      nome: "Dedicado",
      descricao: "Streak de 30 dias",
      tipo: "streak",
      condicao: { type: "streak", target: 30 },
      xp_recompensa: 1000,
    },
    {
      nome: "Aprendiz",
      descricao: "Nivel 5",
      tipo: "level",
      condicao: { type: "level", target: 5 },
      xp_recompensa: 500,
    },
    {
      nome: "Veterano",
      descricao: "Nivel 10",
      tipo: "level",
      condicao: { type: "level", target: 10 },
      xp_recompensa: 2000,
    },
  ];

  for (const c of conquistas) {
    await pool.query(
      `INSERT INTO conquistas (nome, descricao, tipo, condicao, xp_recompensa) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (nome) DO NOTHING`,
      [
        c.nome,
        c.descricao,
        c.tipo,
        JSON.stringify(c.condicao),
        c.xp_recompensa,
      ],
    );
  }
  console.log("[Seed] Conquistas seeded successfully");
}
