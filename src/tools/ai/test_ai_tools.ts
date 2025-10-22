/**
 * Test script for AI tools with Gemini API
 *
 * This script tests:
 * 1. Gemini API connection
 * 2. scorePosts tool
 * 3. analyzeContent tool
 * 4. smartFilter tool
 *
 * Run with: npm run test:ai
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { getGeminiClient } from "../../utils/llm_client.js";
import {
  SCORE_POST_PROMPT,
  ANALYZE_CONTENT_PROMPT,
  SMART_FILTER_PROMPT,
} from "../../utils/ai_prompts.js";
import {
  PostScore,
  ContentAnalysis,
  SmartFilterResult,
} from "../../utils/scoring_criteria.js";

// Sample test posts
const TEST_POSTS = [
  {
    id: "test1",
    pubkey: "npub1ld54kyg0yf627j8q23kgl80ld0h2mn3rqqpv6w3r0txed476e5vs3m0vwf",
    content:
      "Just discovered #Bitcoin and I'm blown away by the technology! The concept of decentralized money is revolutionary. Can't wait to learn more about the Lightning Network and how it scales Bitcoin payments. 🚀⚡",
    created_at: Date.now() / 1000,
  },
];

async function testGeminiConnection() {
  console.log("\n🧪 Test 1: Gemini API Connection");
  console.log("=".repeat(50));

  try {
    const client = getGeminiClient();
    const testPrompt =
      "Respond with only the word 'connected' if you can read this.";
    const response = await client.generateText(testPrompt);

    console.log("✅ Gemini API connected successfully!");
    console.log(`Response: ${response.substring(0, 100)}`);
    return true;
  } catch (error: any) {
    console.error("❌ Gemini API connection failed!");
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function testScorePostsTool() {
  console.log("\n🧪 Test 2: scorePosts Tool");
  console.log("=".repeat(50));

  try {
    const client = getGeminiClient();

    // Test with first 3 posts
    const postsToScore = TEST_POSTS.slice(0, 3);
    console.log(`\nScoring ${postsToScore.length} posts...`);

    const scoringPrompts = postsToScore.map((post) =>
      SCORE_POST_PROMPT(post.content, "bitcoin", post.pubkey)
    );

    const scores = await client.generateBatch<PostScore>(scoringPrompts);

    console.log("\n✅ Scoring completed successfully!\n");

    scores.forEach((score, idx) => {
      const post = postsToScore[idx];
      console.log(`Post ${idx + 1}: "${post.content.substring(0, 50)}..."`);
      console.log(`  Overall Score: ${score.overallScore}/100`);
      console.log(`  Breakdown:`);
      console.log(`    - Content Quality: ${score.breakdown.contentQuality}`);
      console.log(`    - Engagement: ${score.breakdown.engagement}`);
      console.log(`    - Relevance: ${score.breakdown.relevance}`);
      console.log(`    - Authenticity: ${score.breakdown.authenticity}`);
      console.log(`    - Community Value: ${score.breakdown.communityValue}`);
      console.log(`  Reasoning: ${score.reasoning}`);
      console.log("");
    });

    // Validate scores
    const validScores = scores.every(
      (s) =>
        s.overallScore >= 0 &&
        s.overallScore <= 100 &&
        s.breakdown &&
        s.reasoning &&
        s.reasoning.length > 0
    );

    if (validScores) {
      console.log("✅ All scores are valid!");
      return true;
    } else {
      console.log("❌ Some scores are invalid!");
      return false;
    }
  } catch (error: any) {
    console.error("❌ scorePosts test failed!");
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function testAnalyzeContentTool() {
  console.log("\n🧪 Test 3: analyzeContent Tool");
  console.log("=".repeat(50));

  try {
    const client = getGeminiClient();

    // Test with first 2 posts
    const postsToAnalyze = TEST_POSTS.slice(0, 2);
    console.log(`\nAnalyzing ${postsToAnalyze.length} posts...`);

    const analysisPrompts = postsToAnalyze.map((post) =>
      ANALYZE_CONTENT_PROMPT(post.content, "bitcoin")
    );

    const analyses = await client.generateBatch<ContentAnalysis>(
      analysisPrompts
    );

    console.log("\n✅ Analysis completed successfully!\n");

    analyses.forEach((analysis, idx) => {
      const post = postsToAnalyze[idx];
      console.log(`Post ${idx + 1}: "${post.content.substring(0, 50)}..."`);
      console.log(`  Sentiment: ${analysis.sentiment}`);
      console.log(`  Topics: ${analysis.topics.join(", ")}`);
      console.log(`  Target Audience: ${analysis.targetAudience}`);
      console.log(`  Engagement Prediction: ${analysis.engagementPrediction}`);
      console.log(`  Key Insights:`);
      analysis.keyInsights.forEach((insight) => {
        console.log(`    - ${insight}`);
      });
      if (analysis.warnings && analysis.warnings.length > 0) {
        console.log(`  Warnings:`);
        analysis.warnings.forEach((warning) => {
          console.log(`    ⚠️  ${warning}`);
        });
      }
      console.log("");
    });

    // Validate analyses
    const validAnalyses = analyses.every(
      (a) =>
        ["positive", "negative", "neutral", "mixed"].includes(a.sentiment) &&
        Array.isArray(a.topics) &&
        a.topics.length > 0 &&
        ["high", "medium", "low"].includes(a.engagementPrediction) &&
        Array.isArray(a.keyInsights) &&
        a.keyInsights.length > 0
    );

    if (validAnalyses) {
      console.log("✅ All analyses are valid!");
      return true;
    } else {
      console.log("❌ Some analyses are invalid!");
      return false;
    }
  } catch (error: any) {
    console.error("❌ analyzeContent test failed!");
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function testSmartFilterTool() {
  console.log("\n🧪 Test 4: smartFilter Tool");
  console.log("=".repeat(50));

  try {
    const client = getGeminiClient();

    // Test with all posts
    console.log(`\nFiltering ${TEST_POSTS.length} posts...`);

    const postsForPrompt = TEST_POSTS.map((post) => ({
      id: post.id,
      content: post.content,
      pubkey: post.pubkey,
    }));

    const prompt = SMART_FILTER_PROMPT(postsForPrompt, "bitcoin");
    const result = await client.generateJSON<SmartFilterResult>(prompt);

    console.log("\n✅ Filtering completed successfully!\n");

    console.log(`📊 Filter Results:`);
    console.log(`  Total Posts: ${TEST_POSTS.length}`);
    console.log(`  🎯 High Quality: ${result.highQualityPosts.length}`);
    console.log(`  📝 Medium Quality: ${result.mediumQualityPosts.length}`);
    console.log(`  ⚠️  Low Quality: ${result.lowQualityPosts.length}`);
    console.log(`  🚫 Spam: ${result.spamPosts.length}`);
    console.log("");

    console.log("High Quality Posts:");
    result.highQualityPosts.forEach((id) => {
      const post = TEST_POSTS.find((p) => p.id === id);
      console.log(`  - ${id}: "${post?.content.substring(0, 50)}..."`);
    });

    console.log("\nMedium Quality Posts:");
    result.mediumQualityPosts.forEach((id) => {
      const post = TEST_POSTS.find((p) => p.id === id);
      console.log(`  - ${id}: "${post?.content.substring(0, 50)}..."`);
    });

    console.log("\nLow Quality Posts:");
    result.lowQualityPosts.forEach((id) => {
      const post = TEST_POSTS.find((p) => p.id === id);
      console.log(`  - ${id}: "${post?.content.substring(0, 50)}..."`);
    });

    console.log("\nSpam Posts:");
    result.spamPosts.forEach((id) => {
      const post = TEST_POSTS.find((p) => p.id === id);
      console.log(`  - ${id}: "${post?.content.substring(0, 50)}..."`);
    });

    // Validate result
    const totalCategorized =
      result.highQualityPosts.length +
      result.mediumQualityPosts.length +
      result.lowQualityPosts.length +
      result.spamPosts.length;

    if (totalCategorized === TEST_POSTS.length) {
      console.log("\n✅ All posts categorized correctly!");

      // Check if spam post was detected
      const spamDetected = result.spamPosts.includes("test3");
      if (spamDetected) {
        console.log("✅ Spam detection working correctly!");
      } else {
        console.log("⚠️  Spam post not detected (this may vary)");
      }

      return true;
    } else {
      console.log(
        `\n❌ Post count mismatch! Expected ${TEST_POSTS.length}, got ${totalCategorized}`
      );
      return false;
    }
  } catch (error: any) {
    console.error("❌ smartFilter test failed!");
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function runAllTests() {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 AI Tools Test Suite");
  console.log("=".repeat(50));
  console.log("\nTesting Gemini AI integration for zapcampaign-mcp");
  console.log(`Model: gemini-1.5-flash`);
  console.log(`Test Posts: ${TEST_POSTS.length}`);

  const results = {
    connection: false,
    scorePosts: false,
    analyzeContent: false,
    smartFilter: false,
  };

  // Test 1: API Connection
  results.connection = await testGeminiConnection();
  if (!results.connection) {
    console.log("\n❌ Cannot proceed without API connection!");
    console.log(
      "\n💡 Make sure GOOGLE_GENERATIVE_AI_API_KEY is set in your environment"
    );
    process.exit(1);
  }

  // Add delay between tests to avoid rate limits
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Test 2: Score Posts
  await delay(2000);
  results.scorePosts = await testScorePostsTool();

  // Test 3: Analyze Content
  await delay(2000);
  results.analyzeContent = await testAnalyzeContentTool();

  // Test 4: Smart Filter
  await delay(2000);
  results.smartFilter = await testSmartFilterTool();

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Summary");
  console.log("=".repeat(50));
  console.log(
    `✅ Gemini API Connection: ${results.connection ? "PASS" : "FAIL"}`
  );
  console.log(
    `${results.scorePosts ? "✅" : "❌"} scorePosts Tool: ${
      results.scorePosts ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `${results.analyzeContent ? "✅" : "❌"} analyzeContent Tool: ${
      results.analyzeContent ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `${results.smartFilter ? "✅" : "❌"} smartFilter Tool: ${
      results.smartFilter ? "PASS" : "FAIL"
    }`
  );

  const allPassed = Object.values(results).every((r) => r === true);
  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("🎉 All tests passed! AI tools are working correctly!");
  } else {
    console.log("⚠️  Some tests failed. Check the output above for details.");
  }
  console.log("=".repeat(50) + "\n");

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  console.error("\n💥 Unexpected error running tests:");
  console.error(error);
  process.exit(1);
});
