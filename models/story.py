from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal

class StoryGenerationRequest(BaseModel):
    academic_grade: str = Field(..., description="Target academic grade level (e.g., 'K', '5', '12')")
    subject: str = Field(..., description="Main subject area (e.g., 'biology', 'history')")
    other_subject: Optional[str] = Field(None, description="Specific subject if 'other' is chosen")
    subject_specification: Optional[str] = Field(None, description="Specific topic focus within the subject")
    setting: Optional[str] = Field(None, description="Setting or environment for the story")
    main_character: Optional[str] = Field(None, description="Description of the main character")
    word_count: int = Field(default=300, description="Target word count for the story")
    language: str = Field(default="English", description="Language for the story")
    generate_vocabulary: bool = Field(default=False, description="Flag to generate a vocabulary list")
    generate_summary: bool = Field(default=False, description="Flag to generate a story summary")
    generate_quiz: bool = Field(default=False, description="Flag to generate a comprehension quiz")

class VocabularyItem(BaseModel):
    term: str
    definition: str

class QuizItem(BaseModel):
    question: str
    options: List[str]
    correct_answer: int  # Index of the correct answer in options list

class StoryGenerationResponse(BaseModel):
    id: Optional[str] = Field(None, description="Unique ID if saved") # Assuming ID generation/saving happens elsewhere
    title: str = Field(..., description="Generated title for the story")
    content: str = Field(..., description="The main generated story text")
    academic_grade: str = Field(..., description="The academic grade level used")
    subject: str = Field(..., description="The subject used")
    word_count: int = Field(..., description="Actual word count (approximate)")
    language: str = Field(..., description="Language of the story")
    summary: Optional[str] = Field(None, description="Generated story summary, if requested")
    vocabulary: Optional[List[VocabularyItem]] = Field(None, description="Generated vocabulary list, if requested")
    quiz: Optional[List[QuizItem]] = Field(None, description="Generated comprehension quiz, if requested")
    learning_objectives: Optional[List[str]] = Field(None, description="Potential learning objectives derived from the story") # Added this as it was in frontend display 

class StoryContinuationRequest(BaseModel):
    original_story_content: Optional[str] = Field(None, description="Content of the original story to continue")
    length: int = Field(default=300, description="Target word count for the continuation")
    difficulty: str = Field(
        default="same_level", 
        description="Desired difficulty level relative to the original story"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "length": 300,
                "difficulty": "slightly_harder"
            }
        }

class StoryContinuationResponse(BaseModel):
    story_id: str = Field(..., description="ID of the original story")
    continuation_text: str = Field(..., description="The generated continuation text")
    word_count: int = Field(..., description="Actual word count of the continuation")
    difficulty: str = Field(..., description="The difficulty level that was applied")
    vocabulary: Optional[List[VocabularyItem]] = Field(None, description="Additional vocabulary items for the continuation") 