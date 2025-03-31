// Environment variables for frontend
const ENV = {
  API_URL: "", // API is now served from the same origin
  
  // ===== IMPORTANT: SUPABASE SETUP INSTRUCTIONS =====
  // 1. Create a free Supabase account at https://supabase.com
  // 2. Create a new project
  // 3. Get your URL and anon key from Settings > API in your Supabase dashboard
  // 4. Replace the placeholder values below with your actual credentials:
  //    - SUPABASE_URL should look like: "https://abcdefghijklm.supabase.co"
  //    - SUPABASE_KEY should be your anon/public key (starts with "eyJ...")
  // 5. Make sure you've run the SQL setup script to create the required tables
  // ===================================================
  
  // Supabase credentials - these will be fetched from the server
  SUPABASE_URL: "",
  SUPABASE_KEY: "",
  
  DEBUG: true,
  ENABLE_STORAGE: true // Set to false to disable story saving
};

// Make environment variables available globally
async function loadEnv() {
  console.log("ENV.JS: Starting environment variable loading");
  
  // First set basic env vars
  Object.keys(ENV).forEach(key => {
    window[`ENV_${key}`] = ENV[key];
  });
  
  console.log("ENV.JS: Basic environment variables loaded");
  
  // Add a timestamp to the request URL to avoid caching
  const timestamp = new Date().getTime();
  const configUrl = `/config/client-env?_=${timestamp}`;
  
  let configLoaded = false;
  
  // Then fetch Supabase credentials from server
  try {
    console.log(`ENV.JS: Fetching Supabase credentials from server (${configUrl})...`);
    const response = await fetch(configUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`ENV.JS: Config response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
    }
    
    const config = await response.json();
    console.log("ENV.JS: Raw config response received");
    
    // Log what we got (safely)
    const safeConfig = {
      supabase_url: config.supabase_url || "(empty)",
      supabase_key: config.supabase_key ? 
        `${config.supabase_key.substring(0, 5)}...${config.supabase_key.length}` : "(empty)"
    };
    console.log("ENV.JS: Config received:", safeConfig);
    
    // Update environment variables with server-provided values
    if (config.supabase_url) {
      window.ENV_SUPABASE_URL = config.supabase_url;
      console.log("ENV.JS: Supabase URL loaded from server");
      configLoaded = true;
    } else {
      console.warn("ENV.JS: Server did not provide a Supabase URL");
    }
    
    if (config.supabase_key) {
      window.ENV_SUPABASE_KEY = config.supabase_key;
      console.log("ENV.JS: Supabase key loaded from server");
      configLoaded = true;
    } else {
      console.warn("ENV.JS: Server did not provide a Supabase key");
    }
    
    console.log("ENV.JS: Environment variables updated from server");
  } catch (error) {
    console.error("ENV.JS: Failed to load config from server:", error);
    console.warn("ENV.JS: Using default environment variables. Some features may not work.");
  }
  
  // If config wasn't loaded, add default test values
  if (!configLoaded && ENV.DEBUG) {
    console.log("ENV.JS: No configuration received, setting test values for development");
    // Only in debug mode and only if no config was loaded
    window.ENV_SUPABASE_URL = "https://example.supabase.co";
    window.ENV_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example";
  }
  
  // Notify that environment loading is complete
  console.log("ENV.JS: Environment loading complete", {
    SUPABASE_URL: window.ENV_SUPABASE_URL ? 
      window.ENV_SUPABASE_URL.substring(0, 10) + "..." : "(not set)",
    SUPABASE_KEY: window.ENV_SUPABASE_KEY ? 
      window.ENV_SUPABASE_KEY.substring(0, 5) + "..." : "(not set)"
  });
  
  // Trigger the global callback if it exists
  if (typeof window.onEnvLoaded === 'function') {
    window.onEnvLoaded();
  }
}

// Execute the async function
loadEnv().then(() => {
  console.log("ENV.JS: Environment loading promise resolved");
}).catch(err => {
  console.error("ENV.JS: Error during environment loading:", err);
}); 