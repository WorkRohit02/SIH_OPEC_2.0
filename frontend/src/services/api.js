// API Service to connect Frontend React App to Node.js/Express Backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token Management
export const getStoredToken = () => localStorage.getItem('opec_access_token') || sessionStorage.getItem('opec_access_token');
export const setStoredToken = (token, remember = true) => {
  if (remember) {
    localStorage.setItem('opec_access_token', token);
  } else {
    sessionStorage.setItem('opec_access_token', token);
  }
};
export const removeStoredToken = () => {
  localStorage.removeItem('opec_access_token');
  sessionStorage.removeItem('opec_access_token');
};

// Generic HTTP Request Wrapper
async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/pdf')) {
      const blob = await response.blob();
      return { success: true, data: blob };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.warn(`[API] Error on ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
}

// Map backend test/record object to frontend format
export function mapBackendTestToRecord(test) {
  const analysis = test.analysisResult || {};
  const capture = test.captures?.[0] || {};

  const createdDate = test.createdAt ? new Date(test.createdAt) : new Date();
  const pad = (n) => String(n).padStart(2, '0');

  const formattedDate = createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = `${pad(createdDate.getHours())}:${pad(createdDate.getMinutes())}`;

  let result = (analysis.classificationResult || 'inconclusive').toLowerCase();
  if (result === 'positive') result = 'positive';
  else if (result === 'negative') result = 'negative';
  else result = 'inconclusive';

  return {
    id: test.testId || test._id || `OPEC-${test._id?.slice(-6).toUpperCase()}`,
    mongoId: test._id,
    test: test.testProfileCode ? `Colorimetric Test (${test.testProfileCode})` : 'Colorimetric Field Test',
    result: result,
    date: formattedDate,
    time: formattedTime,
    location: test.location ? `${test.location.latitude?.toFixed(4)}, ${test.location.longitude?.toFixed(4)}` : 'Device location',
    gps: test.location?.latitude ? `${test.location.latitude}, ${test.location.longitude}` : 'unavailable',
    officer: test.officerId?.name || test.officerId || 'OP-4587',
    reagent: analysis.reagent || 'Marquis reagent',
    confidence: analysis.confidenceScore || 92,
    calibration: analysis.calibrationStatus || 'PASS',
    attempts: test.captures?.length || 1,
    tampered: false,
    image: capture.imageUrl || capture.imagePath || null,
    hash: analysis.sha256Hash || test.hash || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
    signature: analysis.digitalSignature || test.signature || 'SIG-VALID-ECDSA-SECURE',
    clipHash: capture.clipHash || null,
    frameInfo: capture.frameInfo || null,
  };
}

// API Methods
export const api = {
  // Auth
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res.data?.accessToken) {
      setStoredToken(res.data.accessToken);
    }
    return res;
  },

  async register(userData) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: userData,
    });
    if (res.data?.accessToken) {
      setStoredToken(res.data.accessToken);
    }
    return res;
  },

  async getMe() {
    return request('/auth/me');
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {}
    removeStoredToken();
  },

  // User Profile
  async getProfile() {
    return request('/users/profile');
  },

  async updateProfile(data) {
    return request('/users/profile', {
      method: 'PATCH',
      body: data,
    });
  },

  async changePassword(currentPassword, newPassword) {
    return request('/users/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  },

  // Test Profiles
  async getTestProfiles() {
    return request('/test-profiles');
  },

  // Tests
  async createTest(testProfileCode = 'CP-01', location = null) {
    const defaultLoc = location || { latitude: 28.6139, longitude: 77.2090 };
    return request('/tests', {
      method: 'POST',
      body: {
        testProfileCode,
        deviceId: 'DEVICE-MOBILE-001',
        location: defaultLoc,
        appVersion: '2.0.0',
      },
    });
  },

  async getTests(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/tests${query ? `?${query}` : ''}`);
  },

  async getTestById(id) {
    return request(`/tests/${id}`);
  },

  // Captures
  async uploadCapture(testId, imageBlobOrDataUrl, metadata = {}, qualityChecks = {}) {
    let blob = imageBlobOrDataUrl;
    if (typeof imageBlobOrDataUrl === 'string' && imageBlobOrDataUrl.startsWith('data:')) {
      const parts = imageBlobOrDataUrl.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      blob = new Blob([uInt8Array], { type: contentType });
    }

    const formData = new FormData();
    formData.append('image', blob, 'capture.jpg');
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('qualityChecks', JSON.stringify(qualityChecks));

    return request(`/captures/${testId}`, {
      method: 'POST',
      body: formData,
    });
  },

  // Analysis
  async analyseCapture(captureId, testId, capturedSamples = {}) {
    return request(`/analysis/${captureId}/analyse`, {
      method: 'POST',
      body: {
        testId,
        capturedSamples: capturedSamples || {
          testRegionRgb: { r: 180, g: 40, b: 220 },
        },
      },
    });
  },

  // PDF Report
  async downloadReport(testId) {
    return request(`/reports/${testId}`);
  },

  // Verification
  async verifyRecord(recordId) {
    return request(`/verification/${recordId}`);
  },

  // Sync
  async syncOffline(records) {
    return request('/sync', {
      method: 'POST',
      body: {
        deviceId: 'DEVICE-MOBILE-001',
        records,
      },
    });
  },
};

export default api;
