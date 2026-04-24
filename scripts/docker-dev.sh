#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Núcleos Labs - Ambiente de Desenvolvimento${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado.${NC}"
    exit 1
fi

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env não encontrado. Criando...${NC}"
    cp .env.example .env 2>/dev/null || echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres" > .env
    echo -e "${GREEN}✅ .env criado${NC}"
fi

echo -e "${YELLOW}🛑 Parando containers antigos...${NC}"
docker compose down 2>/dev/null || true

echo -e "${BLUE}🐳 Buildando containers...${NC}"
docker compose up -d --build

echo -e "${YELLOW}⏳ Aguardando serviços...${NC}"
sleep 5

echo ""
echo -e "${GREEN}🌀 Ambiente pronto!${NC}"
echo -e "${BLUE}🛜 API:${NC} http://localhost:5000"
echo -e "${BLUE}🛜 Health:${NC} http://localhost:5000/health"
echo -e "${BLUE}🛜 Redis UI:${NC} http://localhost:8081"
echo -e "${BLUE}🛜 MailHog:${NC} http://localhost:8025"
