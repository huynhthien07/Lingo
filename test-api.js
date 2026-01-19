/**
 * Test OpenAI API Key
 *
 * This script verifies that your OpenAI API key is configured correctly
 * and can communicate with the OpenAI API.
 *
 * Run: node test-api.js
 */

// Load environment variables from .env file
require('dotenv').config();

const OpenAI = require('openai');

async function testAPI() {
  try {
    console.log("🔄 Testing OpenAI API...\n");
    
    // Check if API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log("❌ ERROR: OPENAI_API_KEY not found in .env file");
      console.log("   Please add: OPENAI_API_KEY=sk-your-key-here");
      process.exit(1);
    }
    
    console.log("✅ API Key found in .env");
    console.log(`   Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}\n`);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    console.log("🔄 Connecting to OpenAI API...\n");
    
    // Test API connection with a simple request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an IELTS English tutor. Provide clear, concise answers."
        },
        {
          role: "user",
          content: "What does 'collocation' mean? Give a brief definition with one example."
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    
    console.log("✅ API CONNECTION SUCCESSFUL!\n");
    console.log("=" .repeat(60));
    console.log("📊 API RESPONSE");
    console.log("=" .repeat(60));
    console.log(`Model: ${response.model}`);
    console.log(`Tokens Used: ${response.usage.total_tokens}`);
    console.log(`  - Prompt: ${response.usage.prompt_tokens}`);
    console.log(`  - Completion: ${response.usage.completion_tokens}`);
    console.log("\n📝 Response:\n");
    console.log(response.choices[0].message.content);
    console.log("\n" + "=" .repeat(60));
    console.log("✅ TEST PASSED - API KEY WORKS!\n");
    console.log("🚀 You can now proceed with training!\n");
    console.log("Next steps:");
    console.log("1. Read: BEGIN_TRAINING_NOW.md");
    console.log("2. Run: npx ts-node scripts/prepare-training-data.ts");
    console.log("3. Start: curl -X POST http://localhost:3000/api/chatbot/train\n");
    
  } catch (error) {
    console.log("❌ API ERROR\n");
    console.log("=" .repeat(60));
    console.log("Error Details:");
    console.log("=" .repeat(60));
    
    if (error.status === 401) {
      console.log("❌ Invalid API Key");
      console.log("   - Check your API key in .env file");
      console.log("   - Make sure it starts with 'sk-'");
      console.log("   - Visit: https://platform.openai.com/api-keys");
    } else if (error.status === 429) {
      console.log("❌ Rate Limit Exceeded");
      console.log("   - Wait a few minutes before retrying");
      console.log("   - Or upgrade your OpenAI plan");
    } else if (error.status === 500) {
      console.log("❌ OpenAI Server Error");
      console.log("   - Try again in a few moments");
      console.log("   - Check: https://status.openai.com");
    } else {
      console.log(`Error: ${error.message}`);
      console.log(`Status: ${error.status}`);
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("Troubleshooting:");
    console.log("=" .repeat(60));
    console.log("1. Check .env file has OPENAI_API_KEY");
    console.log("2. Verify API key is correct");
    console.log("3. Check API key has not expired");
    console.log("4. Verify you have credits/billing set up");
    console.log("5. Check OpenAI status: https://status.openai.com\n");
    
    process.exit(1);
  }
}

// Run the test
testAPI();

