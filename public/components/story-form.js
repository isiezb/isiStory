import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';
import { showLoading, hideLoading } from './loading-overlay.js';

export class StoryForm extends LitElement {
  static get properties() {
    return {
      isSubmitting: { type: Boolean },
      subjects: { type: Array },
      gradeLevels: { type: Array },
      wordCounts: { type: Array },
      languages: { type: Array }
    };
  }

  constructor() {
    super();
    this.isSubmitting = false;
    
    this.subjects = [
      { value: 'law', label: 'Law' },
      { value: 'medicine', label: 'Medicine' },
      { value: 'chemistry', label: 'Chemistry' },
      { value: 'biology', label: 'Biology' },
      { value: 'physics', label: 'Physics' },
      { value: 'mathematics', label: 'Mathematics' },
      { value: 'history', label: 'History' },
      { value: 'literature', label: 'Literature' },
      { value: 'other', label: 'Other' }
    ];

    this.gradeLevels = [
      { value: 'K', label: 'Kindergarten' },
      { value: '1', label: 'Grade 1' },
      { value: '2', label: 'Grade 2' },
      { value: '3', label: 'Grade 3' },
      { value: '4', label: 'Grade 4' },
      { value: '5', label: 'Grade 5' },
      { value: '6', label: 'Grade 6' },
      { value: '7', label: 'Grade 7' },
      { value: '8', label: 'Grade 8' },
      { value: '9', label: 'Grade 9' },
      { value: '10', label: 'Grade 10' },
      { value: '11', label: 'Grade 11' },
      { value: '12', label: 'Grade 12' }
    ];

    this.wordCounts = [
      { value: '300', label: '300 words' },
      { value: '500', label: '500 words' },
      { value: '750', label: '750 words' }
    ];

    this.languages = [
      { value: 'English', label: 'English' },
      { value: 'Spanish', label: 'Spanish' },
      { value: 'French', label: 'French' },
      { value: 'German', label: 'German' },
      { value: 'Italian', label: 'Italian' }
    ];

    this._formData = {
      academic_grade: '',
      subject: '',
      other_subject: '',
      subject_specification: '',
      setting: '',
      main_character: '',
      word_count: '300',
      language: 'English',
      generate_vocabulary: true,
      generate_summary: true,
      generate_quiz: true
    };

    this._showOtherSubject = false;
  }

  _handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    
    const newValue = type === 'checkbox' ? checked : value;
    
    this._formData = {
      ...this._formData,
      [name]: newValue
    };

    // Show/hide other subject field
    if (name === 'subject') {
      this._showOtherSubject = value === 'other';
    }
  }

  _handleSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!this._validate()) {
      return;
    }
    
    // Prepare data for submission
    const formData = { ...this._formData };
    
    // Handle special case for other subject
    if (formData.subject === 'other' && formData.other_subject) {
      formData.subject = formData.other_subject;
      delete formData.other_subject;
    }
    
    // Convert word_count to number
    formData.word_count = parseInt(formData.word_count, 10);
    
    // Dispatch form submit event
    this.dispatchEvent(new CustomEvent('story-form-submit', {
      detail: { formData },
      bubbles: true,
      composed: true
    }));
  }

  _validate() {
    // Basic validation
    if (!this._formData.academic_grade) {
      this._showError('Please select an academic grade');
      return false;
    }
    
    if (!this._formData.subject) {
      this._showError('Please select a subject');
      return false;
    }
    
    if (this._formData.subject === 'other' && !this._formData.other_subject) {
      this._showError('Please specify the other subject');
      return false;
    }
    
    return true;
  }

  _showError(message) {
    // If toast system is available, use it
    if (typeof window.showToast === 'function') {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
  }

  static get styles() {
    return css`
    :host {
      display: block;
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
    }

    .form-section {
      background: var(--card-bg, white);
      border-radius: 32px;
      padding: 3rem;
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      margin-bottom: 3rem;
      border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      transition: var(--transition-normal, all 0.3s ease);
    }

    .form-section:hover {
      box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
      transform: translateY(-2px);
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      margin-bottom: 32px;
      overflow: visible;
      position: relative;
      border: 1px solid #e9ecef;
    }

    .card-title {
      background: var(--primary-50, #eef2ff);
      color: var(--primary, #5e7ce6);
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      padding: 16px 24px;
      margin: 0;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .card-content {
      padding: 24px;
    }

    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group {
      flex: 1 1 275px;
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-weight: 600;
      color: var(--text, #212529);
      font-size: 1rem;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 12px;
      background-color: var(--card-bg, white);
      color: var(--text, #212529);
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      transition: var(--transition-fast, all 0.2s ease);
      margin-top: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary, #5e7ce6);
      box-shadow: 0 0 0 3px rgba(94, 124, 230, 0.1);
    }

    .form-group input::placeholder,
    .form-group select::placeholder {
      color: var(--gray-500, #adb5bd);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      margin-bottom: 0.75rem;
    }

    .checkbox-label input {
      position: absolute;
      opacity: 0;
      height: 0;
      width: 0;
    }

    .checkbox-label span {
      position: relative;
      padding-left: 2.25rem;
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1rem;
      color: var(--text, #212529);
    }

    .checkbox-label span:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 6px;
      background-color: var(--card-bg, white);
      transition: var(--transition-fast, all 0.2s ease);
    }

    .checkbox-label input:checked + span:before {
      background-color: var(--primary, #5e7ce6);
      border-color: var(--primary, #5e7ce6);
    }

    .checkbox-label input:checked + span:after {
      content: '';
      position: absolute;
      left: 0.5rem;
      top: 0.25rem;
      width: 0.5rem;
      height: 0.875rem;
      border: solid white;
      border-width: 0 3px 3px 0;
      transform: rotate(45deg);
    }

    .form-actions {
      text-align: center;
    }

    button[type="submit"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 2.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: white;
      background: var(--primary, #5e7ce6);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: var(--transition-normal, all 0.3s ease);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      font-family: var(--font-heading, 'Inter', sans-serif);
      position: relative;
    }

    button[type="submit"]:hover {
      background: var(--primary-600, #4a63b9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
    }

    button[type="submit"]:disabled {
      background: var(--gray-500, #adb5bd);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .spinner {
      display: none;
      width: 1.25rem;
      height: 1.25rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }

    button[type="submit"]:disabled .spinner {
      display: block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      fieldset {
        padding: 1.25rem;
        margin-bottom: 1.25rem;
      }
      
      .form-row {
        margin-bottom: 1rem;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      legend {
        font-size: 1.15rem;
        margin-bottom: 0.5rem;
      }
      
      .story-elements-grid {
        gap: 0.75rem;
      }
      
      .input-group {
        margin-bottom: 0.75rem;
      }
    }

    /* Add new styles for story elements grid */
    .story-elements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .input-group {
      margin-bottom: 1.5rem;
    }

    /* Add new styles for checkbox options */
    .checkbox-options {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .checkbox-group {
      flex: 1 1 200px;
      margin-bottom: 0.75rem;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .checkbox-label:hover {
      color: var(--primary, #5e7ce6);
    }
    
    .checkbox-label input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary, #5e7ce6);
    }

    label {
      display: block;
      margin-bottom: 0.75rem; 
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-weight: 600;
      color: var(--text, #212529);
    }

    .input-group input, 
    .input-group select {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 12px;
      background-color: var(--card-bg, white);
      color: var(--text, #212529);
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      transition: var(--transition-fast, all 0.2s ease);
      margin-top: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .input-group input:focus,
    .input-group select:focus {
      outline: none;
      border-color: var(--primary, #5e7ce6);
      box-shadow: 0 0 0 3px rgba(94, 124, 230, 0.25);
    }

    /* Make input fields more visible */
    .input-group input {
      background-color: #fff;
      border: 2px solid rgba(0, 0, 0, 0.15);
    }

    /* Special styling for topic focus field */
    #subjectSpecification {
      border: 2px solid rgba(94, 124, 230, 0.35);
      background-color: rgba(244, 246, 255, 0.5);
    }

    /* Specific styles for topic focus */
    .topic-focus {
      margin-top: 20px;
      border-top: 1px dashed #e9ecef;
      padding-top: 20px;
    }
    
    .topic-focus input {
      border: 2px solid var(--primary-100, #e0e7ff) !important;
      background-color: #fcfcff !important;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .form-card {
        margin-bottom: 24px;
        border-radius: 12px;
      }
      
      .card-title {
        font-size: 1.1rem;
        padding: 12px 16px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }
      
      .card-content {
        padding: 16px;
      }
      
      .story-elements-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .topic-focus {
        margin-top: 16px;
        padding-top: 16px;
      }
    }
  `;
  }

  render() {
    return html`
      <div class="form-section">
        <form @submit=${this._handleSubmit}>
          <div class="form-container">
            <!-- Content Settings Card -->
            <div class="form-card">
              <h3 class="card-title">Content Settings</h3>
              <div class="card-content">
                <div class="story-elements-grid">
                  <div class="input-group">
                    <label for="academicGrade">Academic Level</label>
                    <select id="academicGrade" name="academic_grade" 
                            @change=${this._handleInputChange} 
                            ?disabled=${this.isSubmitting}
                            required>
                      <option value="">Select your grade level...</option>
                      ${this.gradeLevels.map(grade => html`
                        <option value=${grade.value} ?selected=${this._formData.academic_grade === grade.value}>
                          ${grade.label}
                        </option>
                      `)}
                    </select>
                  </div>

                  <div class="input-group">
                    <label for="subject">Subject Area</label>
                    <select id="subject" name="subject" 
                            @change=${this._handleInputChange} 
                            ?disabled=${this.isSubmitting}
                            required>
                      <option value="">Select a subject...</option>
                      ${this.subjects.map(subject => html`
                        <option value=${subject.value} ?selected=${this._formData.subject === subject.value}>
                          ${subject.label}
                        </option>
                      `)}
                    </select>
                  </div>
                </div>

                <div class="input-group" ?hidden=${!this._showOtherSubject}>
                  <label for="otherSubject">Specify Subject</label>
                  <input type="text" id="otherSubject" name="other_subject" 
                        placeholder="e.g., Astronomy"
                        .value=${this._formData.other_subject}
                        @input=${this._handleInputChange}
                        ?disabled=${this.isSubmitting}>
                </div>
              </div>
            </div>

            <!-- Topic Focus Card (separate from Content Settings) -->
            <div class="form-card topic-focus-card">
              <h3 class="card-title">Topic Focus</h3>
              <div class="card-content">
                <div class="input-group">
                  <label for="subjectSpecification">Topic Focus (optional)</label>
                  <input type="text" id="subjectSpecification" name="subject_specification" 
                        placeholder="e.g., Genetics for Biology"
                        .value=${this._formData.subject_specification}
                        @input=${this._handleInputChange}
                        ?disabled=${this.isSubmitting}>
                </div>
              </div>
            </div>

            <!-- Story Elements Card -->
            <div class="form-card">
              <h3 class="card-title">Story Elements</h3>
              <div class="card-content">
                <div class="story-elements-grid">
                  <div class="input-group">
                    <label for="setting">Story Setting (optional)</label>
                    <input type="text" id="setting" name="setting" 
                          placeholder="e.g., a small village in the mountains"
                          .value=${this._formData.setting}
                          @input=${this._handleInputChange}
                          ?disabled=${this.isSubmitting}>
                  </div>
                  <div class="input-group">
                    <label for="mainCharacter">Main Character (optional)</label>
                    <input type="text" id="mainCharacter" name="main_character"
                          placeholder="e.g., a curious young scientist"
                          .value=${this._formData.main_character}
                          @input=${this._handleInputChange}
                          ?disabled=${this.isSubmitting}>
                  </div>
                </div>
              </div>
            </div>

            <!-- Format Settings Card -->
            <div class="form-card">
              <h3 class="card-title">Format Settings</h3>
              <div class="card-content">
                <div class="story-elements-grid">
                  <div class="input-group">
                    <label for="wordCount">Story Length</label>
                    <select id="wordCount" name="word_count"
                            @change=${this._handleInputChange}
                            ?disabled=${this.isSubmitting}
                            required>
                      ${this.wordCounts.map(option => html`
                        <option value=${option.value} ?selected=${this._formData.word_count === option.value}>
                          ${option.label}
                        </option>
                      `)}
                    </select>
                  </div>
                  <div class="input-group">
                    <label for="language">Language</label>
                    <select id="language" name="language"
                            @change=${this._handleInputChange}
                            ?disabled=${this.isSubmitting}
                            required>
                      ${this.languages.map(language => html`
                        <option value=${language.value} ?selected=${this._formData.language === language.value}>
                          ${language.label}
                        </option>
                      `)}
                    </select>
                  </div>
                </div>
                <div class="checkbox-options">
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="generateVocabulary" name="generate_vocabulary"
                            ?checked=${this._formData.generate_vocabulary}
                            @change=${this._handleInputChange}
                            ?disabled=${this.isSubmitting}>
                      <span>Generate Vocabulary List</span>
                    </label>
                  </div>
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="generateSummary" name="generate_summary"
                            ?checked=${this._formData.generate_summary}
                            @change=${this._handleInputChange}
                            ?disabled=${this.isSubmitting}>
                      <span>Generate Story Summary</span>
                    </label>
                  </div>
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="generateQuiz" name="generate_quiz"
                            ?checked=${this._formData.generate_quiz}
                            @change=${this._handleInputChange}
                            ?disabled=${this.isSubmitting}>
                      <span>Generate Comprehension Quiz</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" ?disabled=${this.isSubmitting}>
                <div class="spinner"></div>
                Generate Story
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define('story-form', StoryForm); 