// #!/usr/bin/env node
// /* ═══════════════════════════════════════════════════════════════
//    CLI RUNNER  —  cli.js
//    node cli.js --plan recordings/rec_123.json
//    node cli.js --plan recordings/rec_123.json --headed
//    node cli.js --plan recordings/rec_123.json --screenshots
//    node cli.js --plan recordings/rec_123.json --slowmo 500
// ═══════════════════════════════════════════════════════════════ */

// const axios = require('axios');
// const { chromium }              = require('@playwright/test');
// const { loadPlan, executeStep } = require('./runner');
// const fs                        = require('fs');
// const path                      = require('path');

// const args        = parseArgs(process.argv.slice(2));
// const PLAN_FILE   = args.plan;
// const HEADED      = args.headed  !== undefined;
// const SCREENSHOTS = !!args.screenshots;
// const SLOW_MO     = parseInt(args.slowmo || '0');

// if (!PLAN_FILE) {
//   console.error('\n  Usage: node cli.js --plan <path-to-recording.json> [--headed] [--screenshots] [--slowmo 300]\n');
//   process.exit(1);
// }
// if (!fs.existsSync(PLAN_FILE)) {
//   console.error(`\n  File not found: ${PLAN_FILE}\n`);
//   process.exit(1);
// }

// let screenshotDir = null;
// if (SCREENSHOTS) {
//   screenshotDir = path.join('screenshots', path.basename(PLAN_FILE, '.json'));
//   fs.mkdirSync(screenshotDir, { recursive: true });
// }

// run().catch(err => { console.error('\n  Fatal:', err.message); process.exit(1); });

// import {chromium} from 'playwright'; 
// import axios from 'axios';

// async function run() {
//   const plan = loadPlan(PLAN_FILE);

//   console.log('\n╔══════════════════════════════════════════════════════╗');
//   console.log('║   ENTERPRISE TEST RUNNER  —  Playwright Executor     ║');
//   console.log('╚══════════════════════════════════════════════════════╝');
//   console.log(`  Plan    : ${PLAN_FILE}`);
//   console.log(`  Steps   : ${plan.steps.length}`);
//   console.log(`  Headed  : ${HEADED}`);
//   if (SLOW_MO) console.log(`  SlowMo  : ${SLOW_MO}ms`);
//   console.log('─'.repeat(56) + '\n');

//   const res = await axios.get("http://localhost:9223/json");

//   const wsurl = res.data[0].webSocketDebuggerUrl;

//   const browser = await chromium.connectOverCDP(wsurl);
  
//   const contexts = browser.contexts();

//   if(contexts.length === 0) {
//     throw new error("No browser context available")
//   }

//   const context =contexts[0];

//   if (pages.length > 0) {
//     console.log("reusing existing page");
//     page = pages[0];
//   } else {
//     console.log("creating new page");
//     page = await context.newPage();
//   }

//   if (!page) {
//     throw new error("Page not initialized")
//   }

//   await page.goto("https://google.com");

//   console.log("browser connected");

//   // const context = await browser.contexts()[0];
//   // const page    = await context.newPage();

//   const results = [];
//   let passed = 0, failed = 0;

//   for (let i = 0; i < plan.steps.length; i++) {
//     const step     = plan.steps[i];
//     const stepType = step.step_type || step.type;
//     const stepId   = step.step_id  || step.id || `step_${i+1}`;
//     const t0       = Date.now();

//     try {
//       await executeStep(page, step, {
//         verbose: true,
//         screenshotDir,
//         index:      i + 1,
//         _stepIndex: i,
//         _allSteps:  plan.steps,
//         _prevStep:  i > 0 ? plan.steps[i - 1] : null
//       });
//       results.push({ step_id: stepId, step_type: stepType, status: 'passed',
//                      duration_ms: Date.now() - t0 });
//       passed++;
//     } catch (err) {
//       results.push({ step_id: stepId, step_type: stepType, status: 'failed',
//                      error: err.message, duration_ms: Date.now() - t0 });
//       failed++;

//       const failPath = path.join('screenshots', `FAIL_${stepId}_${stepType}.png`);
//       fs.mkdirSync('screenshots', { recursive: true });
//       await page.screenshot({ path: failPath }).catch(() => {});

//       console.log(`\n     ✗ ${err.message.split('\n').slice(0,2).join('\n       ')}`);
//       console.log(`       Screenshot → ${failPath}\n`);
//     }
//   }

//   await browser.close();

//   const total    = plan.steps.length;
//   const passRate = total ? Math.round((passed / total) * 100) : 0;

//   console.log('\n' + '═'.repeat(56));
//   console.log(`  ${failed === 0 ? '✓  ALL PASSED' : '✗  SOME FAILED'}`);
//   console.log('─'.repeat(56));
//   console.log(`  Total   ${total}  |  Passed ${passed}  |  Failed ${failed}  |  ${passRate}%`);

//   fs.mkdirSync('test-results', { recursive: true });
//   const out = path.join('test-results', `run_${Date.now()}.json`);
//   fs.writeFileSync(out, JSON.stringify({
//     plan_file: PLAN_FILE, ran_at: new Date().toISOString(),
//     total, passed, failed, pass_rate: passRate, steps: results
//   }, null, 2));

//   console.log(`\n  Results  →  ${out}`);
//   console.log('═'.repeat(56) + '\n');
//   process.exit(failed > 0 ? 1 : 0);
// }

// function parseArgs(argv) {
//   const out = {};
//   for (let i = 0; i < argv.length; i++) {
//     if (argv[i].startsWith('--')) {
//       const key = argv[i].slice(2);
//       out[key]  = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : true;
//     }
//   }
//   return out;
// }
// run().catch(err => {
//   console.error("fatal:", err.message);
// });

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

  // connect to browser
  const res = await axios.get("http://browser-box:9223/json");

  let wsurl = res.data[0].webSocketDebuggerUrl;
  wsurl = wsurl.replace("localhost", "browser-box");

  const browser = await chromium.connectOverCDP(wsurl);

  // correct CDP usage
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

  console.log("Browser connected successfully");

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