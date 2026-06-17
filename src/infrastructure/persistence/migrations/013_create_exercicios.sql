-- Workout templates (treino plans linked to a bloco)
CREATE TABLE IF NOT EXISTS treino_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloco_id UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Exercises within a template
CREATE TABLE IF NOT EXISTS treino_exercicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES treino_templates(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  series INTEGER NOT NULL DEFAULT 3,
  repeticoes INTEGER NOT NULL DEFAULT 10,
  peso_kg DECIMAL(6,2),
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training session log
CREATE TABLE IF NOT EXISTS sessoes_treino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES treino_templates(id) ON DELETE SET NULL,
  bloco_id UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  duracao_min INTEGER,
  notas TEXT,
  concluida BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treino_templates_bloco_id ON treino_templates(bloco_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_treino_exercicios_template_id ON treino_exercicios(template_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_treino_bloco_id ON sessoes_treino(bloco_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_treino_template_id ON sessoes_treino(template_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_treino_data ON sessoes_treino(data DESC);
