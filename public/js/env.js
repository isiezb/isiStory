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
  // First set basic env vars
  Object.keys(ENV).forEach(key => {
    window[`ENV_${key}`] = ENV[key];
  });
  
  console.log("Basic environment variables loaded");
  
  // Add a timestamp to the request URL to avoid caching
  const timestamp = new Date().getTime();
  const configUrl = `/config/client-env?_=${timestamp}`;
  
  // Then fetch Supabase credentials from server
  try {
    console.log(`Fetching Supabase credentials from server (${configUrl})...`);
    const response = await fetch(configUrl);
    
    console.log(`Config response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
    }
    
    const config = await response.json();
    console.log("Raw config response received");
    
    // Log what we got (safely)
    const safeConfig = {
      supabase_url: config.supabase_url || "(empty)",
      supabase_key: config.supabase_key ? 
        `${config.supabase_key.substring(0, 5)}...${config.supabase_key.length}` : "(empty)"
    };
    console.log("Config received:", safeConfig);
    
    // Update environment variables with server-provided values
    if (config.supabase_url) {
      window.ENV_SUPABASE_URL = config.supabase_url;
      console.log("Supabase URL loaded from server");
    } else {
      console.warn("Server did not provide a Supabase URL");
    }
    
    if (config.supabase_key) {
      window.ENV_SUPABASE_KEY = config.supabase_key;
      console.log("Supabase key loaded from server");
    } else {
      console.warn("Server did not provide a Supabase key");
    }
    
    console.log("Environment variables updated from server");
  } catch (error) {
    console.error("Failed to load config from server:", error);
    console.warn("Using default environment variables. Some features may not work.");
  }
}

// Execute the async function
loadEnv().then(() => {
  console.log("Environment loading complete");
}).catch(err => {
  console.error("Error during environment loading:", err);
}); 