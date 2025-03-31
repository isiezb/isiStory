/**
 * Main application script
 */

// Debug function to check Supabase credentials
async function debugSupabaseConfig() {
  console.log("==== Supabase Config Debug ====");
  console.log("ENV_SUPABASE_URL:", window.ENV_SUPABASE_URL);
  console.log("ENV_SUPABASE_KEY:", window.ENV_SUPABASE_KEY ? 
              window.ENV_SUPABASE_KEY.substring(0, 5) + "..." : "not set");
  
  // Test the config endpoint directly
  try {
    const response = await fetch("/config/client-env");
    if (!response.ok) {
      console.error("Config endpoint error:", response.status, response.statusText);
    } else {
      const config = await response.json();
      console.log("Config endpoint response:", {
        supabase_url: config.supabase_url || "not returned",
        supabase_key: config.supabase_key ? 
                     (config.supabase_key.substring(0, 5) + "...") : "not returned"
      });
    }
  } catch (error) {
    console.error("Failed to fetch from config endpoint:", error);
  }
  console.log("===============================");
}

// Initialize the application
(function initApp() {
  // Add global event listeners
  document.addEventListener('DOMContentLoaded', onDocumentReady);
  window.addEventListener('error', handleGlobalError);

  // On DOM ready
  function onDocumentReady() {
    console.log('DOM content loaded');
    setupComponents();
    setupEventListeners();

    // Check if Lit components are ready
    if (window.litComponentsReady) {
      console.log('Lit components already initialized');
    }

    // Initialize Supabase if available
    try {
      if (window.initSupabase && typeof window.initSupabase === 'function') {
        window.initSupabase()
          .then(() => checkUserSession())
          .catch(err => {
            console.warn('Failed to initialize auth:', err);
          });
      } else {
        console.warn('Supabase not initialized, skipping user session check');
      }
    } catch (err) {
      console.error('Error during authentication setup:', err);
    }

    // Add debug call
    setTimeout(debugSupabaseConfig, 1000);

    console.log('App initialized successfully');
  }

  // Check user session
  function checkUserSession() {
    if (window.supabase && window.supabase.auth) {
      window.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session.user.email);
          updateUIForAuthenticatedUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          updateUIForAnonymousUser();
        }
      });

      // Get initial session
      window.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('User is signed in:', session.user.email);
          updateUIForAuthenticatedUser(session.user);
        } else {
          console.log('No active session, user is anonymous');
          updateUIForAnonymousUser();
        }
      });
    }
  }

  // Set up components
  function setupComponents() {
    // Add toast container if it doesn't exist
    if (!document.querySelector('toast-container')) {
      const toastContainer = document.createElement('toast-container');
      document.body.appendChild(toastContainer);
    }

    // Add loading overlay if it doesn't exist
    if (!document.querySelector('loading-overlay')) {
      const loadingOverlay = document.createElement('loading-overlay');
      document.body.appendChild(loadingOverlay);
    }

    // Since story-form is directly in the HTML, make sure it exists or create it if not
    const generatorTab = document.getElementById('generator-tab');
    if (generatorTab && !generatorTab.querySelector('story-form')) {
      console.log('Story form not found in generator tab, creating one');
      const storyForm = document.createElement('story-form');
      // Insert the form at the beginning of the generator tab
      generatorTab.insertBefore(storyForm, generatorTab.firstChild);
    }

    // Show the story result area when a story is generated
    const storyResult = document.getElementById('story-result');
    if (storyResult) {
      const storyDisplay = storyResult.querySelector('story-display');
      if (storyDisplay) {
        storyDisplay.addEventListener('story-updated', () => {
          storyResult.classList.remove('hidden');
        });
      }
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Listen for story form submission
    document.addEventListener('story-form-submit', handleStoryFormSubmit);
  }

  // Handle form submission
  async function handleStoryFormSubmit(event) {
    const formData = event.detail.formData;
    console.log('Form data submitted:', formData);

    // Show loading indicator
    window.showLoading?.('Creating your educational story...');

    // Find the form component
    const formComponent = document.querySelector('story-form');
    if (formComponent) {
      formComponent.isSubmitting = true;
    }

    try {
      // Call API to generate story
      const story = await generateStory(formData);

      // Save the story to window.currentStory for global access
      window.currentStory = story;
      console.log('Story saved to window.currentStory:', window.currentStory);

      // Find story content component and update it
      const storyContent = document.querySelector('#storyDisplay');
      if (storyContent) {
        storyContent.story = story;
        // Trigger custom event for story update
        storyContent.dispatchEvent(new CustomEvent('story-updated', {
          bubbles: true,
          composed: true,
          detail: { story: story }
        }));
      }

      // Show the story result container if hidden
      const storyResult = document.getElementById('story-result');
      if (storyResult) {
        storyResult.classList.remove('hidden');
      }

      // Scroll to story display
      if (storyResult) {
        storyResult.scrollIntoView({ behavior: 'smooth' });
      }

      // Save the story to Supabase if storage is enabled
      if (window.ENV_ENABLE_STORAGE && typeof window.SupabaseService !== 'undefined') {
        try {
          window.showToast?.('Saving story to library...', 'info');
          const savedStory = await window.SupabaseService.saveStory(story);
          console.log('Story saved to database:', savedStory);
          
          // Update the story ID with the database ID if needed
          if (savedStory && savedStory.id && (!story.id || story.id.startsWith('mock'))) {
            story.id = savedStory.id;
            window.currentStory.id = savedStory.id;
            console.log('Updated story ID from database:', story.id);
          }
          
          window.showToast?.('Story saved to your library!', 'success');
        } catch (saveError) {
          console.error('Error saving story to database:', saveError);
          window.showToast?.('Failed to save story to library', 'warning');
        }
      }

      // Show success message
      window.showToast?.('Story generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating story:', error);
      window.showToast?.('Failed to generate story. Please try again.', 'error');
    } finally {
      // Hide loading indicator
      window.hideLoading?.();

      // Reset form submitting state
      if (formComponent) {
        formComponent.isSubmitting = false;
      }
    }
  }

  // Generate a story using form data
  async function generateStory(formData) {
    // Default API base URL from env.js
    // Empty string is valid and means use the current origin
    const baseUrl = window.ENV_API_URL; 

    console.log(`Using base URL (from env.js): '${baseUrl}'`);
    
    // Check if API service *function* exists before trying
    if (window.apiService && typeof window.apiService.generateStory === 'function') {
      console.log('Attempting direct API request...');
      try {
        const result = await window.apiService.generateStory(formData);
        console.log('Direct API request successful');
        return result;
      } catch (error) {
        console.error('Direct API service error:', error);
        
        // If this looks like a CORS or network error, try using proxy
        if (window.proxyService && 
            (error.message.includes('CORS') || 
             error.message.includes('Failed to fetch') ||
             error.message.includes('Network') ||
             error.message.includes('TypeError'))) {
          
          console.log('Direct API failed (CORS/Network likely), trying proxy service...');
          // Fall through to proxy attempt below
        } else {
          // API failed for other reasons (e.g., 404, 500 from API itself)
          window.showToast?.('API error: ' + error.message, 'error');
          console.log('Direct API error (non-CORS/Network). Using mock story generation.');
          return mockGenerateStory(formData);
        }
      }
    } else {
        console.log('API service generateStory function not found.');
        // Fall through to proxy attempt if apiService itself exists but function doesn't
        // Or if apiService doesn't exist at all.
    }

    // Try proxy service if direct API failed or wasn't available
    if (window.proxyService && typeof window.proxyService.generateStory === 'function') {
      console.log('Attempting proxy service request...');
      try {
        const proxyResult = await window.proxyService.generateStory(baseUrl, formData);
        console.log('Proxy request successful (via app.js)');
        return proxyResult;
      } catch (proxyError) {
        console.error('Proxy service error:', proxyError);
        window.showToast?.('API Service Unavailable: Using mock data.', 'warning');
        console.log('Proxy failed. Using mock story generation.');
        return mockGenerateStory(formData);
      }
    } else {
      // No API or proxy service available
      console.log('No API or proxy service function available. Using mock data.');
      window.showToast?.('App Error: Services unavailable. Using mock data.', 'error');
      return mockGenerateStory(formData);
    }
  }
  
  // Mock story generation for testing
  function mockGenerateStory(formData) {
    // Mock response for testing
    console.log('Using mock story generation (no API service available)');
    
    // Simulating network delay
    return new Promise(resolve => setTimeout(() => {
      resolve({
        id: 'mock-story-' + Date.now(),
        title: `A Story About ${formData.subject}`,
        content: `Once upon a time in ${formData.setting || 'a magical land'}, there was ${formData.main_character || 'a curious student'} who loved learning about ${formData.subject}.\n\n` +
          `They discovered that ${formData.subject} was full of fascinating concepts. Every day they would study and learn more.\n\n` +
          `This is a placeholder story content that would normally be generated by the API based on the form data provided. It would be much longer (${formData.word_count} words) and focused on teaching ${formData.subject} to a ${formData.academic_grade} level student.\n\n` +
          `The story would incorporate educational elements while being engaging and appropriate for the selected grade level.`,
        created_at: new Date().toISOString(),
        language: formData.language,
        academic_grade: formData.academic_grade,
        subject: formData.subject,
        word_count: formData.word_count,
        summary: formData.generate_summary ? `This is a mock summary of a story about ${formData.subject} for grade ${formData.academic_grade} students. It covers basic concepts in an engaging way.` : null,
        vocabulary: formData.generate_vocabulary ? [
          { term: `${formData.subject} Term 1`, definition: 'Definition for the first term related to the subject.' },
          { term: `${formData.subject} Term 2`, definition: 'Definition for the second term related to the subject.' },
          { term: `${formData.subject} Term 3`, definition: 'Definition for the third term related to the subject.' }
        ] : null,
        quiz: formData.generate_quiz ? [
          {
            question: `What is the main subject of this story?`,
            options: [formData.subject, 'History', 'Mathematics', 'Art'],
            correct_answer: 0
          },
          {
            question: `Who is the main character of the story?`,
            options: ['A teacher', formData.main_character || 'A curious student', 'A scientist', 'A historian'],
            correct_answer: 1
          },
          {
            question: `What grade level is this story intended for?`,
            options: ['Kindergarten', 'Elementary', 'Middle School', formData.academic_grade],
            correct_answer: 3
          }
        ] : null
      });
    }, 2000));
  }

  // Update UI for authenticated user
  function updateUIForAuthenticatedUser(user) {
    window.isAnonymousUser = false;
    window.currentUser = user;
    
    // Update any login/logout buttons
    const loginButtons = document.querySelectorAll('.login-button');
    loginButtons.forEach(button => {
      button.textContent = 'My Account';
      button.href = '/account';
    });
    
    // Update any user-specific elements
    const userElements = document.querySelectorAll('.user-name');
    userElements.forEach(element => {
      element.textContent = user.email;
    });
    
    // Show user-only content
    const userOnlyElements = document.querySelectorAll('.user-only');
    userOnlyElements.forEach(element => {
      element.style.display = 'block';
    });
    
    // Hide guest-only content
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    guestOnlyElements.forEach(element => {
      element.style.display = 'none';
    });
  }

  // Update UI for anonymous user
  function updateUIForAnonymousUser() {
    window.isAnonymousUser = true;
    window.currentUser = null;
    
    // Update any login/logout buttons
    const loginButtons = document.querySelectorAll('.login-button');
    loginButtons.forEach(button => {
      button.textContent = 'Log In';
      button.href = '/login';
    });
    
    // Hide user-specific elements
    const userOnlyElements = document.querySelectorAll('.user-only');
    userOnlyElements.forEach(element => {
      element.style.display = 'none';
    });
    
    // Show guest-only content
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    guestOnlyElements.forEach(element => {
      element.style.display = 'block';
    });
  }

  // Handle global errors
  function handleGlobalError(event) {
    console.error('Global error:', event.error || event.message);
    
    // Only show toast for script errors, not network errors
    if (event.error && !(event.error instanceof TypeError && event.error.toString().includes('NetworkError'))) {
      window.showToast?.('An error occurred. Please try again.', 'error');
    }
    
    // Prevent the error from showing in console again
    event.preventDefault();
  }

  // Make public methods available globally
  window.generateStory = generateStory;
})(); 