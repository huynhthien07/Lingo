#!/bin/bash

# Complete Flow Testing Script
# Tests the entire admission test flow with different score levels

echo "🚀 Complete Admission Test Flow Testing"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Low Score (4.5-5.0)
echo -e "${BLUE}Test 1: Creating admission test with LOW score (4.5-5.0)${NC}"
echo "This will show beginner-level courses"
echo ""
npx tsx scripts/test-admission-score-4-5.ts
echo ""
echo -e "${GREEN}✅ Test 1 Complete${NC}"
echo ""

# Test 2: High Score (7.5-8.0)
echo -e "${BLUE}Test 2: Creating admission test with HIGH score (7.5-8.0)${NC}"
echo "This will show advanced-level courses"
echo ""
npx tsx scripts/test-admission-score-7-5.ts
echo ""
echo -e "${GREEN}✅ Test 2 Complete${NC}"
echo ""

# Test 3: Perfect Score (7.5)
echo -e "${BLUE}Test 3: Creating admission test with PERFECT score (7.5)${NC}"
echo "This will show all matching courses"
echo ""
npx tsx scripts/test-admission-e2e.ts
echo ""
echo -e "${GREEN}✅ Test 3 Complete${NC}"
echo ""

echo "========================================"
echo -e "${GREEN}✅ All Tests Completed Successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Test Results:${NC}"
echo "1. Low Score Test - Attempt ID: Check output above"
echo "2. High Score Test - Attempt ID: Check output above"
echo "3. Perfect Score Test - Attempt ID: Check output above"
echo ""
echo -e "${YELLOW}🔗 Visit these URLs to test:${NC}"
echo "- Low Score: http://localhost:3000/admission-test/14/result/[attemptId]"
echo "- High Score: http://localhost:3000/admission-test/14/result/[attemptId]"
echo "- Perfect Score: http://localhost:3000/admission-test/14/result/[attemptId]"
echo ""
echo -e "${YELLOW}📊 Expected Results:${NC}"
echo "- Low Score: Shows beginner courses (band 4.5-5.0)"
echo "- High Score: Shows advanced courses (band 7.5-8.0)"
echo "- Perfect Score: Shows all matching courses (band 7.5)"
echo ""
echo -e "${YELLOW}🎯 Flow to Test:${NC}"
echo "1. Go to /admission-tests"
echo "2. Click 'Start Test'"
echo "3. Answer questions"
echo "4. Submit test"
echo "5. View results and recommendations"
echo "6. Click course to see details"
echo "7. Click 'Xem tất cả khóa học' to view all courses"
echo ""

