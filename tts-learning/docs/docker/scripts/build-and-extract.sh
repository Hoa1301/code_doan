#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Building TTS Learning Project...${NC}\n"

# Build Docker image
echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
docker build -f Dockerfile.build-only -t tts-learning-builder --target builder .

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Create temporary container
echo -e "\n${YELLOW}Step 2: Creating temporary container...${NC}"
docker create --name temp-builder tts-learning-builder

# Remove old dist folder if exists
if [ -d "./dist" ]; then
    echo -e "${YELLOW}Removing old dist folder...${NC}"
    rm -rf ./dist
fi

# Copy dist folder
echo -e "\n${YELLOW}Step 3: Extracting dist folder...${NC}"
docker cp temp-builder:/app/dist ./dist

# Clean up
echo -e "\n${YELLOW}Step 4: Cleaning up...${NC}"
docker rm temp-builder

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Dist folder is ready at:${NC} ${BLUE}./dist${NC}"
echo -e "${YELLOW}You can now configure your own Nginx to serve this folder.${NC}\n"

# Show dist folder size
DIST_SIZE=$(du -sh ./dist | cut -f1)
echo -e "${YELLOW}Dist folder size:${NC} ${BLUE}${DIST_SIZE}${NC}\n"
