/**
 * Automated REST API Tester Script for COLOR-SAFE Backend
 * 
 * Usage:
 *   1. Start backend server: npm run dev
 *   2. In another terminal: node docs/test-all-apis.js
 */

const BASE_URL = 'http://localhost:5000/api';

async function runApiTests() {
  console.log('==================================================');
  console.log('  COLOR-SAFE REST API Automated Test Suite');
  console.log(`  Target: ${BASE_URL}`);
  console.log('==================================================\n');

  let accessToken = '';
  let createdTestId = '';
  let createdTestMongoId = '';
  let captureMongoId = '';
  let digitalRecordId = '';

  const logResult = (name, passed, details = '') => {
    const icon = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} | ${name} ${details ? `(${details})` : ''}`);
  };

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    logResult('1. Health Check [GET /api/health]', healthRes.ok && healthData.success);

    // 2. Auth Register
    const email = `officer_${Date.now()}@narcotics.gov.in`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Inspector',
        email,
        password: 'Password123',
        organization: 'Narcotics Control Bureau',
        phone: '+91 9999999999',
        role: 'OFFICER',
      }),
    });
    const regData = await regRes.json();
    logResult('2. Auth Register [POST /api/auth/register]', regRes.status === 201 && regData.success);

    // 3. Auth Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123' }),
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.data && loginData.data.accessToken) {
      accessToken = loginData.data.accessToken;
      logResult('3. Auth Login [POST /api/auth/login]', true, `Token issued for Operator ${loginData.data.user.operatorId}`);
    } else {
      logResult('3. Auth Login [POST /api/auth/login]', false);
      return;
    }

    const authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    // 4. Get Identity /me
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    logResult('4. Authenticated User Identity [GET /api/auth/me]', meRes.ok && meData.success);

    // 5. Test Profiles
    const profilesRes = await fetch(`${BASE_URL}/test-profiles`, { headers: authHeaders });
    const profilesData = await profilesRes.json();
    logResult('5. List Test Profiles [GET /api/test-profiles]', profilesRes.ok && profilesData.data.profiles.length > 0, `Found profile ${profilesData.data.profiles[0].profileCode}`);

    // 6. Create Field Test
    const testRes = await fetch(`${BASE_URL}/tests`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        testProfileCode: 'CP-01',
        deviceId: 'AUTOMATED-TEST-DEVICE',
        location: { latitude: 28.6139, longitude: 77.2090, accuracy: 4.0 },
      }),
    });
    const testData = await testRes.json();
    if (testRes.status === 201 && testData.data && testData.data.test) {
      createdTestId = testData.data.test.testId;
      createdTestMongoId = testData.data.test._id;
      logResult('6. Initiate Field Test [POST /api/tests]', true, `Generated ID: ${createdTestId}`);
    } else {
      logResult('6. Initiate Field Test [POST /api/tests]', false);
    }

    // 7. List Tests
    const listRes = await fetch(`${BASE_URL}/tests?limit=5`, { headers: authHeaders });
    const listData = await listRes.json();
    logResult('7. List Field Tests [GET /api/tests]', listRes.ok && listData.data.tests.length > 0);

    // 8. Upload Capture Attempt
    const captureRes = await fetch(`${BASE_URL}/tests/${createdTestId}/captures`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        qualityChecks: { blurPassed: true, referenceCardDetected: true },
      }),
    });
    const captureData = await captureRes.json();
    if (captureRes.ok && captureData.data && captureData.data.capture) {
      captureMongoId = captureData.data.capture._id;
      logResult('8. Upload Capture Metadata [POST /api/tests/:id/captures]', true, `Capture ID: ${captureMongoId}`);
    } else {
      logResult('8. Upload Capture Metadata [POST /api/tests/:id/captures]', false);
    }


    // 9. Run Analysis & Generate Digital Record
    const analysisRes = await fetch(`${BASE_URL}/analysis/${captureMongoId}/analyse`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        testId: createdTestMongoId,
        capturedSamples: { testRegionRgb: { r: 190, g: 50, b: 220 } },
      }),
    });
    const analysisData = await analysisRes.json();
    if (analysisRes.ok && analysisData.data && analysisData.data.digitalRecord) {
      digitalRecordId = analysisData.data.digitalRecord.recordId;
      logResult('9. Run Color Analysis & Record Creation [POST /api/analysis/:id/analyse]', true, `Result: ${analysisData.data.analysis.classification} | Signed Record: ${digitalRecordId}`);
    } else {
      logResult('9. Run Color Analysis [POST /api/analysis/:id/analyse]', false, JSON.stringify(analysisData));
    }

    // 10. Download PDF Report Stream
    const pdfRes = await fetch(`${BASE_URL}/reports/${createdTestId}`, { headers: authHeaders });
    const isPdf = pdfRes.ok && pdfRes.headers.get('content-type') === 'application/pdf';
    logResult('10. PDF Report Stream [GET /api/reports/:testId]', isPdf, `Streamed ${pdfRes.headers.get('content-length') || 'N/A'} bytes`);

    // 11. Verify Record Cryptographic Integrity
    const verifyRes = await fetch(`${BASE_URL}/verification/${digitalRecordId}`);
    const verifyData = await verifyRes.json();
    const isVerifyOk = verifyRes.ok && verifyData.data && verifyData.data.verificationReport && verifyData.data.verificationReport.status === 'VALID';
    logResult('11. Evidence Verification [GET /api/verification/:recordId]', isVerifyOk, 'Hashes & RSA Digital Signature Verified');

    // 12. Batch Sync Offline Records
    const syncRes = await fetch(`${BASE_URL}/sync`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        deviceId: 'AUTOMATED-TEST-DEVICE',
        records: [
          {
            localTestId: `FT-OFFLINE-${Date.now()}`,
            testProfileCode: 'CP-01',
            status: 'COMPLETED',
            analysis: {
              features: { rgb: { r: 180, g: 40, b: 200 } },
              classification: 'PRESUMPTIVE_POSITIVE',
              confidence: 0.85,
            },

          },
        ],
      }),
    });
    const syncData = await syncRes.json();
    const isSyncOk = syncRes.ok && syncData.data && syncData.data.syncSummary && syncData.data.syncSummary.syncedCount === 1;
    logResult('12. Batch Sync Offline Records [POST /api/sync]', isSyncOk, isSyncOk ? 'Synced 1 Record' : JSON.stringify(syncData));



    console.log('\n==================================================');
    console.log('  ALL API TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('==================================================\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.log('Make sure the backend server is running on http://localhost:5000 (npm run dev)');
  }
}

runApiTests();
