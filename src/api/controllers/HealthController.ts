import { Request, Response } from "express";
import { testDatabaseConnection } from "../../infrastructure/persistence/db/connection";

export class HealthController {
  async check(req: Request, res: Response) {
    const dbHealthy = await testDatabaseConnection();

    res.json({
      status: dbHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: {
          status: dbHealthy ? "connected" : "disconnected",
        },
        api: {
          status: "running",
          port: process.env.PORT,
        },
      },
      system: {
        memory: process.memoryUsage(),
        node: process.version,
      },
    });
  }

  getHealthHTML(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Nucleos API - Health Dashboard</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #0a0e27; color: #fff; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { background: #1a1f3a; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .status { color: #4ade80; font-weight: bold; }
        pre { background: #0d1117; padding: 15px; border-radius: 8px; overflow-x: auto; }
        h1 { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Nucleos API - Health Dashboard</h1>
        <div class="card">
            <h2>📊 Status</h2>
            <pre id="health-data">Carregando...</pre>
        </div>
    </div>
    <script>
        fetch('/health')
            .then(res => res.json())
            .then(data => {
                document.getElementById('health-data').innerText = JSON.stringify(data, null, 2);
            });
    </script>
</body>
</html>`;
  }
}
