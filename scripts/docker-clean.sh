#!/bin/bash
# Núcleos Labs - Limpeza completa do ambiente Docker

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Núcleos Labs - Limpeza do Ambiente Docker${NC}"

# Confirmar limpeza
echo -e "${YELLOW}sso irá REMOVER todos os containers, volumes e dados do Docker.${NC}"
read -p "Tem certeza? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Operação cancelada.${NC}"
    exit 0
fi

# Parar containers
echo -e "${YELLOW}arando containers...${NC}"
docker compose down -v 2>/dev/null || true

# Remover containers órfãos
echo -e "${YELLOW}🗑️  Removendo containers órfãos...${NC}"
docker container prune -f

# Remover imagens não utilizadas
echo -e "${YELLOW}🗑️  Removendo imagens não utilizadas...${NC}"
docker image prune -f

# Remover volumes
echo -e "${YELLOW}🗑️  Removendo volumes...${NC}"
docker volume prune -f

# Remover cache de build
echo -e "${YELLOW}🗑️  Limpando cache de build...${NC}"
docker builder prune -f

# Remover node_modules e dist local (opcional)
echo -e "${YELLOW}⚠️  Deseja remover node_modules e dist local?${NC}"
read -p "Isso exigirá reinstalação das dependências (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removendo node_modules e dist...${NC}"
    rm -rf node_modules dist
    echo -e "${GREEN}✅ node_modules e dist removidos. Execute 'npm install' para reinstalar.${NC}"
fi

echo ""
echo -e "${GREEN}✅ Limpeza completa!${NC}"
echo -e "${BLUE}💡 Para recriar o ambiente:${NC} npm run docker:up"