// Supabase client initialization
let supabaseClient = null;
let supabaseScriptLoaded = false;

async function initSupabaseClient() {
  console.log("Initializing Supabase client...");
  
  // Check if client is already initialized
  if (supabaseClient) {
    console.log("Supabase client already initialized");
    return supabaseClient;
  }
  
  // Check if the Supabase script is loaded
  if (!window.supabase && !supabaseScriptLoaded) {
    console.log("Supabase script not loaded, loading dynamically...");
    
    // Load the Supabase script dynamically
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => {
        console.log("Supabase script loaded successfully");
        supabaseScriptLoaded = true;
        
        // After script is loaded, create the client
        createSupabaseClient().then(resolve).catch(reject);
      };
      script.onerror = (error) => {
        console.error("Failed to load Supabase script:", error);
        reject(new Error("Failed to load Supabase script"));
      };
      document.head.appendChild(script);
    });
  } else {
    // Script already loaded, create client
    return createSupabaseClient();
  }
}

async function createSupabaseClient() {
  console.log("Creating Supabase client...");
  
  // Wait for environment variables to load if promise exists
  if (window.envLoadedPromise) {
    console.log("Waiting for environment variables to load...");
    await window.envLoadedPromise;
  }
  
  // Get credentials from environment variables
  const supabaseUrl = window.ENV_SUPABASE_URL;
  const supabaseKey = window.ENV_SUPABASE_KEY;
  
  // Log SafeURL and partial key for debugging
  const safeUrl = supabaseUrl || "(empty)";
  const safeKey = supabaseKey ? 
    `${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}` : 
    "(empty)";
  
  console.log(`Creating Supabase client with URL: ${safeUrl} and key: ${safeKey}`);
  
  // Validate Supabase credentials before creating client
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === "https://YOUR_SUPABASE_URL.supabase.co" || 
      supabaseKey === "YOUR_SUPABASE_KEY" ||
      supabaseUrl === "https://example.supabase.co" ||
      supabaseKey.includes("example")) {
        
    console.error("Invalid Supabase credentials. Using mock Supabase client.");
    
    // Return mock client if credentials are invalid
    return createMockSupabaseClient();
  }
  
  // Create and return the real Supabase client
  try {
    console.log("Creating real Supabase client...");
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client created successfully");
    return supabaseClient;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    console.warn("Falling back to mock Supabase client");
    return createMockSupabaseClient();
  }
}

// Create a mock Supabase client for development/testing
function createMockSupabaseClient() {
  console.log("Creating mock Supabase client");
  
  // In-memory storage for the mock client
  const mockStorage = {
    stories: []
  };
  
  // Return a mock client with the required methods
  return {
    from: (table) => {
      return {
        select: () => {
          return {
            order: (column, { ascending }) => {
              return {
                then: (callback) => {
                  // Simulate async behavior
                  setTimeout(() => {
                    if (table === 'stories') {
                      callback({ data: mockStorage.stories, error: null });
                    } else {
                      callback({ data: [], error: null });
                    }
                  }, 100);
                }
              };
            }
          };
        },
        insert: (data) => {
          return {
            then: (callback) => {
              // Simulate async behavior
              setTimeout(() => {
                if (table === 'stories') {
                  const newItem = {
                    id: `mock-${Date.now()}`,
                    created_at: new Date().toISOString(),
                    ...data
                  };
                  mockStorage.stories.push(newItem);
                  callback({ data: newItem, error: null });
                } else {
                  callback({ data: null, error: new Error(`Table ${table} not supported in mock`) });
                }
              }, 100);
            }
          };
        }
      };
    }
  };
}

// Supabase service for story operations
const SupabaseService = {
  // Save a story to Supabase
  saveStory: async function(storyData) {
    console.log("Saving story to Supabase...");
    
    try {
      // Initialize Supabase client if not already done
      const client = await initSupabaseClient();
      
      // Prepare story data for insertion
      const story = {
        title: storyData.title,
        content: storyData.content,
        summary: storyData.summary || "",
        academic_grade: storyData.academic_grade || "",
        subject: storyData.subject || "",
        word_count: storyData.wordCount || 0,
        vocab_list: storyData.vocabList || [],
        quiz_data: storyData.quizData || []
      };
      
      console.log("Prepared story data for Supabase insertion");
      
      // Insert the story into the 'stories' table
      const { data, error } = await client.from('stories').insert(story);
      
      if (error) {
        console.error("Error saving story to Supabase:", error);
        return { success: false, error };
      }
      
      console.log("Story saved successfully to Supabase:", data);
      return { success: true, data };
      
    } catch (error) {
      console.error("Exception when saving story to Supabase:", error);
      return { success: false, error };
    }
  },
  
  // Get all stories from Supabase
  getStories: async function() {
    console.log("Fetching stories from Supabase...");
    
    try {
      // Initialize Supabase client if not already done
      const client = await initSupabaseClient();
      
      // Fetch all stories ordered by creation date (newest first)
      const { data, error } = await client
        .from('stories')
        .select()
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching stories from Supabase:", error);
        return { success: false, error };
      }
      
      console.log(`Retrieved ${data.length} stories from Supabase`);
      return { success: true, data };
      
    } catch (error) {
      console.error("Exception when fetching stories from Supabase:", error);
      return { success: false, error };
    }
  }
};

// Expose the Supabase service globally
window.supabaseService = SupabaseService;

// Initialize Supabase client on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing Supabase...");
  initSupabaseClient().catch(error => {
    console.error("Failed to initialize Supabase client on page load:", error);
  });
}); 