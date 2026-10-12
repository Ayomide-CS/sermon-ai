import puppeteer from 'puppeteer-core';

const BROWSER_URL = 'http://localhost:3000';
let browser;
let results = [];
let passCount = 0;
let failCount = 0;

function log(test, status, detail) {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${test}${detail ? ` — ${detail}` : ''}`);
  results.push({ test, status, detail });
  if (status === 'PASS') passCount++; else failCount++;
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

try {
  browser = await puppeteer.launch({ 
    headless: false,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setDefaultTimeout(30000);
  await page.setViewport({ width: 1280, height: 900 });

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Home Page (/)');
  console.log('═══════════════════════════════════════\n');

  await page.goto(BROWSER_URL, { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  try {
    const title = await page.title();
    log('Home page loads', 'PASS', `title="${title}"`);
  } catch (e) {
    log('Home page loads', 'FAIL', e.message);
  }

  try {
    const hasForm = await page.$('.sermon-form');
    assert(hasForm, 'Sermon form not found');
    log('Sermon input form exists', 'PASS');
  } catch (e) {
    log('Sermon input form exists', 'FAIL', e.message);
  }

  try {
    const hasInput = await page.$('.sermon-form input[type="url"]');
    assert(hasInput, 'URL input not found');
    log('YouTube URL input field exists', 'PASS');
  } catch (e) {
    log('YouTube URL input field exists', 'FAIL', e.message);
  }

  try {
    const hasSubmitBtn = await page.$('.sermon-form button[type="submit"]');
    assert(hasSubmitBtn, 'Submit button not found');
    log('Submit button exists', 'PASS');
  } catch (e) {
    log('Submit button exists', 'FAIL', e.message);
  }

  try {
    const hasModeSelector = await page.$('.mode-selector');
    assert(hasModeSelector, 'Mode selector not found');
    log('Transcription mode selector exists', 'PASS');
  } catch (e) {
    log('Transcription mode selector exists', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Navbar & Auth UI');
  console.log('═══════════════════════════════════════\n');

  try {
    const hasNav = await page.$('.site-nav');
    assert(hasNav, 'Navbar not found');
    log('Navbar renders', 'PASS');
  } catch (e) {
    log('Navbar renders', 'FAIL', e.message);
  }

  try {
    const signInBtns = await page.$$('.btn--ghost');
    assert(signInBtns.length > 0, 'Sign In button not found');
    log('Sign In button visible (unauthenticated)', 'PASS');
  } catch (e) {
    log('Sign In button visible (unauthenticated)', 'FAIL', e.message);
  }

  try {
    const signUpBtns = await page.$$('.btn--accent');
    assert(signUpBtns.length > 0, 'Sign Up button not found');
    log('Sign Up button visible (unauthenticated)', 'PASS');
  } catch (e) {
    log('Sign Up button visible (unauthenticated)', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Sign Up Flow');
  console.log('═══════════════════════════════════════\n');

  try {
    const signUpBtn = await page.$('.btn--accent');
    if (signUpBtn) {
      await signUpBtn.click();
      await sleep(1000);
    }
    
    const hasModal = await page.$('.modal-card');
    assert(hasModal, 'Sign up modal not found');
    log('Sign Up modal opens', 'PASS');

    // Fill in registration form
    const emailInput = await page.$('.form-group input[type="email"]');
    if (emailInput) {
      await emailInput.click();
      await page.type('.form-group input[type="email"]', 'test@example.com');
    }

    const passwordInput = await page.$('.form-group input[type="password"]');
    if (passwordInput) {
      await passwordInput.click();
      await page.type('.form-group input[type="password"]', 'TestPass123!');
    }

    // Submit registration
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(3000);
    }

    // Check for success or error message
    try {
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('success') || bodyText.includes('Welcome') || bodyText.includes('Dashboard')) {
        log('User registration succeeds', 'PASS');
      } else if (bodyText.includes('already exists') || bodyText.includes('taken')) {
        log('User registration — account may already exist', 'PASS', 'Expected for existing user');
      } else {
        // Check if we got redirected or modal closed with token
        const hasToken = await page.evaluate(() => localStorage.getItem('sermon_ai_access_token'));
        if (hasToken) {
          log('User registration succeeds + token stored', 'PASS');
        } else {
          log('User registration result', 'FAIL', `Page text: ${bodyText.slice(0, 200)}`);
        }
      }
    } catch (e) {
      log('User registration result', 'FAIL', e.message);
    }

    // Close modal if still open
    try {
      const closeBtn = await page.$('.modal-close');
      if (closeBtn) await closeBtn.click();
      await sleep(500);
    } catch {}

  } catch (e) {
    log('Sign Up flow', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Sign In Flow');
  console.log('═══════════════════════════════════════\n');

  try {
    const signInBtn = await page.$('.btn--ghost');
    if (signInBtn) {
      await signInBtn.click();
      await sleep(1000);
    }

    // Check modal is open
    const hasModal = await page.$('.modal-card');
    assert(hasModal, 'Sign in modal not found');
    log('Sign In modal opens', 'PASS');

    // Fill login form
    await page.type('.form-group input[type="email"]', 'test@example.com');
    await sleep(300);
    await page.type('.form-group input[type="password"]', 'TestPass123!');
    await sleep(300);

    // Submit login
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(3000);
    }

    // Check auth state
    try {
      const hasToken = await page.evaluate(() => localStorage.getItem('sermon_ai_access_token'));
      assert(hasToken, 'No access token stored after login');
      
      const userMenuVisible = await page.$('.user-avatar-btn');
      assert(userMenuVisible, 'User menu not visible after login');
      
      log('User login succeeds + auth UI updates', 'PASS');
    } catch (e) {
      log('User login result', 'FAIL', e.message);
    }

  } catch (e) {
    log('Sign In flow', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Dashboard Pages');
  console.log('═══════════════════════════════════════\n');

  try {
    await page.goto(`${BROWSER_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const title = await page.title();
    log('Dashboard loads', 'PASS', `title="${title}"`);

    // Check sidebar navigation
    const sidebarLinks = await page.evaluate(() => {
      const aside = document.querySelector('aside nav');
      if (!aside) return [];
      return Array.from(aside.querySelectorAll('a')).map(a => a.textContent.trim());
    });
    
    assert(sidebarLinks.length >= 3, `Only ${sidebarLinks.length} sidebar links found`);
    log('Dashboard sidebar has navigation', 'PASS', `${sidebarLinks.join(', ')}`);

    // Check stats cards exist
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert(bodyText.includes('Sermons Analyzed') || bodyText.includes('Notes Generated'), 'Stats section not found');
    log('Dashboard stats section exists', 'PASS');

    // Check quick actions
    assert(bodyText.includes('Quick Actions') || bodyText.includes('Analyze New Sermon'), 'Quick actions not found');
    log('Dashboard quick actions section exists', 'PASS');

  } catch (e) {
    log('Dashboard loads', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: My Sermons Page (/dashboard/my-sermons)');
  console.log('═══════════════════════════════════════\n');

  try {
    await page.goto(`${BROWSER_URL}/dashboard/my-sermons`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const title = await page.title();
    log('My Sermons dashboard page loads', 'PASS', `title="${title}"`);

    // Check for heading
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert(bodyText.includes('My Sermons'), 'My Sermons heading not found');
    log('My Sermons heading present', 'PASS');

    // Check for new sermon button
    assert(bodyText.includes('+ New Sermon') || bodyText.includes('New Sermon'), 'New Sermon button not found');
    log('New Sermon button exists', 'PASS');

  } catch (e) {
    log('My Sermons dashboard page loads', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Saved Notes Page (/dashboard/saved-notes)');
  console.log('═══════════════════════════════════════\n');

  try {
    await page.goto(`${BROWSER_URL}/dashboard/saved-notes`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const title = await page.title();
    log('Saved Notes dashboard page loads', 'PASS', `title="${title}"`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert(bodyText.includes('Saved Notes'), 'Saved Notes heading not found');
    log('Saved Notes heading present', 'PASS');

  } catch (e) {
    log('Saved Notes dashboard page loads', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Settings Page (/dashboard/settings)');
  console.log('═══════════════════════════════════════\n');

  try {
    await page.goto(`${BROWSER_URL}/dashboard/settings`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const title = await page.title();
    log('Settings dashboard page loads', 'PASS', `title="${title}"`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert(bodyText.includes('Settings'), 'Settings heading not found');
    log('Settings heading present', 'PASS');

    // Check for API config section
    assert(bodyText.includes('API') || bodyText.includes('Configuration'), 'API configuration section not found');
    log('API Configuration section exists', 'PASS');

    // Check for danger zone with Sign Out button
    assert(bodyText.includes('Danger Zone') || bodyText.includes('Clear All Data') || bodyText.includes('Sign Out'), 'Danger zone / logout not found');
    log('Danger zone with Sign Out button exists', 'PASS');

  } catch (e) {
    log('Settings dashboard page loads', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Sermons Library Page (/sermons)');
  console.log('═══════════════════════════════════════\n');

  try {
    await page.goto(`${BROWSER_URL}/sermons`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const title = await page.title();
    log('Sermons library page loads', 'PASS', `title="${title}"`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert(bodyText.includes('My Sermons') || bodyText.includes('Library'), 'Sermons heading not found');
    log('Sermons Library heading present', 'PASS');

    // Check for search input
    const hasSearchInput = await page.$('input[placeholder*="search"], input[type="text"]');
    if (hasSearchInput) {
      log('Search filter input exists on sermons list', 'PASS');
    } else {
      log('Search filter input exists on sermons list', 'FAIL', 'Not found');
    }

  } catch (e) {
    log('Sermons library page loads', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: API Endpoints');
  console.log('═══════════════════════════════════════\n');

  try {
    const token = await page.evaluate(() => localStorage.getItem('sermon_ai_access_token'));
    
    if (token) {
      // Test stats endpoint
      const statsRes = await fetch(`${BROWSER_URL}/api/sermons?action=stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert(statsRes.ok, `Stats API returned ${statsRes.status}`);
      
      const statsData = await statsRes.json();
      log('GET /api/sermons?action=stats', 'PASS', JSON.stringify(statsData));

      // Test list endpoint
      const listRes = await fetch(`${BROWSER_URL}/api/sermons?action=list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert(listRes.ok, `List API returned ${listRes.status}`);
      
      const listData = await listRes.json();
      log('GET /api/sermons?action=list', 'PASS', `${(listData.sermons || []).length} sermons found`);

      // Test get single sermon (with invalid ID to check 404 handling)
      const getRes = await fetch(`${BROWSER_URL}/api/sermons?action=get&id=99999`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      log('GET /api/sermons?action=get&id=99999 (not found)', getRes.status === 404 ? 'PASS' : 'FAIL', 
          `Status: ${getRes.status}, Body: ${(await getRes.text()).slice(0, 100)}`);

      // Test notes list endpoint
      const notesRes = await fetch(`${BROWSER_URL}/api/notes?action=list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert(notesRes.ok, `Notes API returned ${notesRes.status}`);
      
      const notesData = await notesRes.json();
      log('GET /api/notes?action=list', 'PASS', `${(notesData.notes || []).length} notes found`);

    } else {
      log('API tests skipped — no auth token (user not logged in)', 'FAIL');
      
      // Test without auth - should return 401
      const statsRes = await fetch(`${BROWSER_URL}/api/sermons?action=stats`);
      log('GET /api/sermons?action=stats (no auth) returns 401', statsRes.status === 401 ? 'PASS' : 'FAIL', 
          `Status: ${statsRes.status}`);
    }

  } catch (e) {
    log('API endpoints', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Static Pages');
  console.log('═══════════════════════════════════════\n');

  const staticPages = [
    { path: '/about', name: 'About' },
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/disclaimer', name: 'Disclaimer' },
  ];

  for (const { path, name } of staticPages) {
    try {
      await page.goto(`${BROWSER_URL}${path}`, { waitUntil: 'domcontentloaded' });
      await sleep(1000);
      
      const title = await page.title();
      log(`Static page ${name} (${path})`, 'PASS', `title="${title}"`);
    } catch (e) {
      log(`Static page ${name} (${path})`, 'FAIL', e.message);
    }
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Dashboard Sidebar Navigation');
  console.log('═══════════════════════════════════════\n');

  try {
    await page.goto(`${BROWSER_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);

    const sidebarItems = await page.evaluate(() => {
      const aside = document.querySelector('aside nav a');
      if (!aside) return [];
      // Get all nav links in the dashboard sidebar
      const items = Array.from(document.querySelectorAll('aside nav a'));
      return items.map(a => ({ href: a.href, text: a.textContent.trim() }));
    });

    assert(sidebarItems.length >= 3, `Only ${sidebarItems.length} sidebar items found`);
    
    const expectedLabels = ['Overview', 'My Sermons', 'Saved Notes', 'Settings'];
    for (const label of expectedLabels) {
      const found = sidebarItems.some(item => item.text.includes(label));
      assert(found, `Sidebar missing "${label}"`);
    }
    
    log('Dashboard sidebar has all 4 nav items', 'PASS', 
        sidebarItems.map(i => i.text).join(', '));

  } catch (e) {
    log('Dashboard sidebar navigation', 'FAIL', e.message);
  }

  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TESTING: Footer');
  console.log('═══════════════════════════════════════\n');

  try {
    await page.goto(BROWSER_URL, { waitUntil: 'domcontentloaded' });
    await sleep(1500);

    const hasFooter = await page.$('.site-footer');
    assert(hasFooter, 'Footer not found');
    log('Footer renders on home page', 'PASS');

  } catch (e) {
    log('Footer renders on home page', 'FAIL', e.message);
  }

} catch (err) {
  console.error('\nFATAL ERROR:', err.message);
  console.error(err.stack);
} finally {
  // ============================================================
  console.log('\n═══════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════\n');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total:  ${passCount + failCount}\n`);

  if (results.length > 0) {
    const failed = results.filter(r => r.status === 'FAIL');
    if (failed.length > 0) {
      console.log('Failed tests:');
      for (const f of failed) {
        console.log(`  ❌ ${f.test} — ${f.detail}`);
      }
    }
  }

  await sleep(2000);
  
  if (browser) {
    // Keep browser open briefly so user can see, then close
    try {
      await browser.close();
    } catch {}
  }
}
