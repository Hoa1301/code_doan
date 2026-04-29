#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Docker Setup Validator${NC}\n"

# Check Docker
echo -e "${YELLOW}Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed: $(docker --version)${NC}"

# Check Docker Compose
echo -e "\n${YELLOW}Checking Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed: $(docker-compose --version)${NC}"

# Check required files
echo -e "\n${YELLOW}Checking required files...${NC}"
FILES=("Dockerfile" ".dockerignore" "nginx.conf" "docker-compose.yml" "package.json")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
    else
        echo -e "${RED}✗ $file is missing${NC}"
        exit 1
    fi
done

# Validate Dockerfile syntax
echo -e "\n${YELLOW}Validating Dockerfile syntax...${NC}"
if docker build --dry-run . &> /dev/null; then
    echo -e "${GREEN}✓ Dockerfile syntax is valid${NC}"
else
    echo -e "${RED}✗ Dockerfile has syntax errors${NC}"
    exit 1
fi

# Check if port 3000 is available
echo -e "\n${YELLOW}Checking port availability...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3000 is already in use${NC}"
    echo -e "${YELLOW}  You may need to change the port in docker-compose.yml${NC}"
else
    echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All checks passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Build the image:    ${BLUE}make build${NC}"
echo -e "  2. Run the container:  ${BLUE}make run${NC}"
echo -e "  3. View logs:          ${BLUE}make logs${NC}"
echo -e "  4. Open browser:       ${BLUE}http://localhost:3000${NC}\n"

echo -e "${YELLOW}For more commands, run:${NC} ${BLUE}make help${NC}\n"
