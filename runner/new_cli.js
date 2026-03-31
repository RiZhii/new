const axios = require('axios');
const { chromium } = require('playwright');
const { loadPlan, executeStep } = require('./runner');
const fs = require('fs');
const path = require('path');

const args = parseArgs(process.argv.slice(2));
const PLAN_FILE = args.plan;
const HEADED = args.headed !== undefined;
const SCREENSHOTS = !!args.screenshots;
const SLOW_MO = parseInt(args.slowmo || '0');

if (!PLAN_FILE) {
  console.error("\nUsage: node cli.js --plan <file>\n");
  process.exit(1);
}

async function run() {
  const plan = loadPlan(PLAN_FILE);

  console.log("\nENTERPRISE TEST RUNNER - Playwright Executor\n");

  // 🔌 connect to browser
  const res = await axios.get("http://browser-box:9223/json");
  const wsurl = res.data[0].webSocketDebuggerUrl;

  const browser = await chromium.connectOverCDP(wsurl);

  // ✅ correct CDP usage
  const contexts = browser.contexts();
  if (contexts.length === 0) {
    throw new Error("No browser context available");
  }

  const context = contexts[0];

  let page;
  const pages = context.pages();

  if (pages.length > 0) {
    console.log("Reusing existing page");
    page = pages[0];
  } else {
    console.log("Creating new page");
    page = await context.newPage();
  }

  await page.goto("https://google.com");

  console.log("Browser connected successfully 🚀");

  // ===== EXECUTION =====
  const results = [];
  let passed = 0, failed = 0;

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const stepType = step.step_type || step.type;
    const stepId = step.step_id || step.id || `step_${i+1}`;
    const start = Date.now();

    try {
      await executeStep(page, step, { verbose: true });

      results.push({
        step_id: stepId,
        step_type: stepType,
        status: 'passed',
        duration_ms: Date.now() - start
      });

      passed++;

    } catch (err) {
      results.push({
        step_id: stepId,
        step_type: stepType,
        status: 'failed',
        error: err.message,
        duration_ms: Date.now() - start
      });

      failed++;
      console.error("Step failed:", err.message);
    }
  }

  console.log(`\nTotal: ${plan.steps.length} | Passed: ${passed} | Failed: ${failed}`);

  await browser.close();
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      out[key] = argv[i + 1] && !argv[i + 1].startsWith('--')
        ? argv[++i]
        : true;
    }
  }
  return out;
}

run().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});