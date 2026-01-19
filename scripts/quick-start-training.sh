#!/bin/bash

# ============================================================================
# Quick Start Training Script
# 
# Cách sử dụng:
# chmod +x scripts/quick-start-training.sh
# ./scripts/quick-start-training.sh
# ============================================================================

set -e

echo "🚀 AI Chatbot Training - Quick Start"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================

echo -e "${BLUE}Step 1: Checking Prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Check .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Please create .env file with:"
    echo "  OPENAI_API_KEY=your_key_here"
    echo "  DATABASE_URL=your_database_url"
    exit 1
fi
echo -e "${GREEN}✅ .env file found${NC}"

# Check OpenAI API key
if ! grep -q "OPENAI_API_KEY" .env; then
    echo -e "${RED}❌ OPENAI_API_KEY not found in .env${NC}"
    exit 1
fi
echo -e "${GREEN}✅ OPENAI_API_KEY configured${NC}"

echo ""

# ============================================================================
# Step 2: Prepare Training Data
# ============================================================================

echo -e "${BLUE}Step 2: Preparing Training Data...${NC}"

# Run data preparation script
npx ts-node scripts/prepare-training-data.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Training data prepared${NC}"
else
    echo -e "${RED}❌ Failed to prepare training data${NC}"
    exit 1
fi

echo ""

# ============================================================================
# Step 3: Start Training
# ============================================================================

echo -e "${BLUE}Step 3: Starting Training...${NC}"

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${YELLOW}⚠️  Server is not running${NC}"
    echo "Please start the server first:"
    echo "  npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Start training
echo "Calling training API..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/chatbot/train \
  -H "Content-Type: application/json" \
  -d '{
    "dataset": {
      "id": "dataset_'$(date +%s)'",
      "name": "IELTS Chatbot Training Data",
      "examples": [],
      "totalExamples": 0,
      "trainExamples": 0,
      "validationExamples": 0,
      "createdAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "updatedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }')

echo "Response: $RESPONSE"

# Extract job ID
JOB_ID=$(echo $RESPONSE | grep -o '"jobId":"[^"]*' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
    echo -e "${RED}❌ Failed to start training${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Training started${NC}"
echo "Job ID: $JOB_ID"

echo ""

# ============================================================================
# Step 4: Monitor Training
# ============================================================================

echo -e "${BLUE}Step 4: Monitoring Training Progress...${NC}"

# Monitor for up to 30 minutes
TIMEOUT=1800
ELAPSED=0
INTERVAL=10

while [ $ELAPSED -lt $TIMEOUT ]; do
    # Get status
    STATUS=$(curl -s http://localhost:3000/api/chatbot/train/status?jobId=$JOB_ID)
    
    # Extract progress
    PROGRESS=$(echo $STATUS | grep -o '"progress":[0-9]*' | cut -d':' -f2)
    CURRENT_STATUS=$(echo $STATUS | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    echo -ne "\rProgress: $PROGRESS% | Status: $CURRENT_STATUS | Elapsed: ${ELAPSED}s"
    
    # Check if completed
    if [ "$CURRENT_STATUS" = "completed" ]; then
        echo ""
        echo -e "${GREEN}✅ Training completed!${NC}"
        break
    fi
    
    # Check if failed
    if [ "$CURRENT_STATUS" = "failed" ]; then
        echo ""
        echo -e "${RED}❌ Training failed${NC}"
        exit 1
    fi
    
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Training is still running (timeout)${NC}"
    echo "Check status with: curl http://localhost:3000/api/chatbot/train/status?jobId=$JOB_ID"
fi

echo ""

# ============================================================================
# Step 5: Get Results
# ============================================================================

echo -e "${BLUE}Step 5: Getting Training Results...${NC}"

RESULTS=$(curl -s http://localhost:3000/api/chatbot/train/results?jobId=$JOB_ID)

echo "Results:"
echo $RESULTS | jq '.' 2>/dev/null || echo $RESULTS

echo ""

# ============================================================================
# Summary
# ============================================================================

echo -e "${GREEN}===================================="
echo "✅ Training Complete!"
echo "====================================${NC}"
echo ""
echo "Job ID: $JOB_ID"
echo ""
echo "Next steps:"
echo "1. Review the results above"
echo "2. Check metrics (accuracy, precision, recall)"
echo "3. Deploy model if metrics are good"
echo "4. Test in staging environment"
echo ""
echo "Deploy model:"
echo "  curl -X POST http://localhost:3000/api/chatbot/train/deploy \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"modelId\": \"model_123\", \"environment\": \"staging\"}'"
echo ""

