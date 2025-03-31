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
  
  // YOUR SUPABASE CREDENTIALS (REPLACE THESE VALUES)
  SUPABASE_URL: "https://YOUR_SUPABASE_URL.supabase.co", // Replace with your project URL
  SUPABASE_KEY: "YOUR_SUPABASE_KEY", // Replace with your anon/public key
  
  DEBUG: true,
  ENABLE_STORAGE: true // Set to false to disable story saving
};

// Make environment variables available globally
(function loadEnv() {
  Object.keys(ENV).forEach(key => {
    window[`ENV_${key}`] = ENV[key];
  });
  console.log("Environment variables loaded:", ENV);
})(); 