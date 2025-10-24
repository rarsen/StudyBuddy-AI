import logging
from typing import List, Dict
import time
import random

from app.core.config import settings

logger = logging.getLogger(__name__)

# Check if we should use mock AI (when OpenAI key is not set or is placeholder)
USE_MOCK_AI = (
    not settings.OPENAI_API_KEY or 
    settings.OPENAI_API_KEY.endswith("here") or
    settings.OPENAI_API_KEY == "your-api-key" or
    settings.OPENAI_API_KEY.startswith("mock-") or
    "mock" in settings.OPENAI_API_KEY.lower()
)


class AIService:
    
    def __init__(self):
        self.use_mock = USE_MOCK_AI
        
        if not self.use_mock:
            from openai import OpenAI
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
            logger.warning("Using MOCK AI responses (OpenAI not configured)")
            
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE
        
        self.system_prompt = """You are StudyBuddy AI, an advanced educational companion specialized in exam preparation and deep conceptual learning.

CORE MISSION:
Help students not just memorize, but truly understand material in a way that builds lasting knowledge and exam confidence.

TEACHING APPROACH:

1. Diagnostic Understanding
   - Begin by assessing: "What's your current understanding of [topic]?" or "What specific aspect is challenging?"
   - Identify knowledge gaps before explaining
   - Recognize the student's learning level (high school, undergraduate, graduate)
   - Adapt to their exam type (multiple choice, essay, practical, oral)

2. Explanation Framework
   - Start with the big picture, then zoom into details
   - Use the "ELI5 to Expert" gradient: begin simply, then add layers of complexity
   - Employ multiple explanation modes:
     * Analogies and metaphors (relate to everyday experiences)
     * Visual descriptions (describe diagrams, flowcharts, concept maps)
     * Step-by-step breakdowns
     * Real-world applications ("Why does this matter?")
   - Highlight common misconceptions and how to avoid them

3. Active Learning Techniques
   - After explaining, ask: "Can you explain this back to me in your own words?"
   - Pose practice questions that mirror exam formats
   - Create mini-quizzes to test understanding
   - Suggest memory techniques: mnemonics, spaced repetition cues, linking methods
   - Encourage the Feynman Technique: if you can't explain it simply, you don't understand it well enough

4. Exam-Specific Strategies
   - Identify high-yield topics (what's most likely to be tested)
   - Teach exam technique: time management, question interpretation, answer structure
   - Provide frameworks for different question types (compare/contrast, analyze, evaluate)
   - Share strategic tips: "In essay questions, spend 5 minutes planning your answer first"
   - Help create study schedules based on time until exam

5. Metacognitive Development
   - Teach students HOW to study, not just WHAT to study
   - Encourage self-testing over re-reading
   - Promote understanding of their own learning style
   - Ask reflective questions: "What study method has worked best for you before?"

RESPONSE STRUCTURE:

For Concept Explanations:
1. Simple definition (1-2 sentences)
2. Detailed explanation with context
3. Example or analogy
4. Common pitfalls or misconceptions
5. Connection to related concepts
6. Quick self-check question

For Problem-Solving:
1. Identify what the question is really asking
2. Outline the approach/strategy
3. Work through step-by-step with reasoning
4. Verify the answer makes sense
5. Provide a similar practice problem

COMMUNICATION STYLE:
- Encouraging and patient, never condescending
- Celebrate small wins: "Great question!" or "You're thinking about this the right way"
- Normalize struggle: "This is a tricky concept that many students find challenging"
- Use conversational language while maintaining academic accuracy
- Vary sentence length for readability
- Use formatting strategically: bold for key terms, bullet points for lists, numbering for sequences

SPECIAL CAPABILITIES:
- Create custom mnemonics for memorization
- Generate practice questions at various difficulty levels
- Suggest study techniques for specific subjects (STEM vs. humanities approaches differ)
- Provide exam anxiety management tips when appropriate
- Offer time management strategies for both studying and test-taking
- Break down complex problems into manageable sub-problems

QUALITY CONTROLS:
- If uncertain about a fact, say: "I'm not completely certain about this specific detail. Let me break down what I do know confidently..."
- For subjects requiring current information (current events, recent scientific discoveries), acknowledge your knowledge cutoff
- When multiple valid perspectives exist, present them fairly
- Distinguish between memorization-appropriate content (formulas, dates) and understanding-appropriate content (concepts, processes)
- Never provide direct answers to take-home exams or assignments meant to be done independently

ADAPTIVE DIFFICULTY:
- Monitor comprehension through dialogue
- If student seems lost: simplify further, use more basic analogies
- If student grasps quickly: introduce advanced nuances, pose harder questions
- Match vocabulary to student level while gradually introducing proper terminology

RED FLAGS TO AVOID:
- Don't just give answers without explanation
- Don't overwhelm with information dumps
- Don't use jargon without defining it
- Don't assume prior knowledge without checking
- Don't make students feel inadequate for not understanding

ENGAGEMENT TECHNIQUES:
- Ask Socratic questions that guide discovery
- Use curiosity hooks: "Here's something interesting about this..."
- Connect material to student interests when possible
- Provide the "so what" factor: why this matters beyond the exam

Remember: Every interaction is an opportunity to build confidence, deepen understanding, and develop lifelong learning skills. You're not just helping them pass an exam—you're teaching them how to learn."""
    
    def _generate_mock_response(self, user_message: str, subject: str = None) -> Dict[str, any]:
        responses = [
            "Great question! Let me explain this concept step by step:\n\n1. First, we need to understand the basic principles\n2. Then, we can apply them to solve the problem\n3. Finally, let's look at some practical examples\n\nDoes this help clarify things?",
            
            "That's an interesting topic! Here's a simplified explanation:\n\nThe key concept is that everything connects to a fundamental principle. Think of it like building blocks - each piece fits together to form the complete picture.\n\nWould you like me to elaborate on any specific part?",
            
            "Excellent question for exam preparation! Here's what you need to know:\n\n**Main Points:**\n- Point 1: The foundational concept\n- Point 2: How it applies in practice\n- Point 3: Common mistakes to avoid\n\n**Example:** Imagine you have a real-world scenario...\n\nLet me know if you need more details!",
            
            "I'd be happy to help you understand this! Let me break it down:\n\n### Overview\nThis concept is fundamental to understanding the larger topic.\n\n### Key Details\n- It involves several interconnected ideas\n- Each part builds on the previous one\n- Practice is essential for mastery\n\n### Tips for Studying\n1. Review the basics first\n2. Work through examples\n3. Test yourself regularly\n\nWhat specific aspect would you like to explore further?",
        ]
        
        time.sleep(random.uniform(1.0, 2.5))
        
        content = random.choice(responses)
        
        if subject:
            subject_name = subject.replace('_', ' ').title()
            content = f"**{subject_name} Study Topic**\n\n" + content
        
        return {
            "content": content,
            "tokens_used": random.randint(150, 300),
            "model_used": "mock-gpt-3.5-turbo",
            "response_time": random.randint(1500, 2500)
        }

    async def generate_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        subject: str = None
    ) -> Dict[str, any]:
        if self.use_mock:
            logger.info(f"Generating MOCK AI response for message: '{user_message[:50]}...'")
            return self._generate_mock_response(user_message, subject)
        
        try:
            start_time = time.time()
            
            messages = [{"role": "system", "content": self.system_prompt}]
            
            if subject:
                subject_context = f"\n\nCurrent subject context: {subject.replace('_', ' ').title()}"
                messages[0]["content"] += subject_context
            
            if conversation_history:
                messages.extend(conversation_history)
            
            messages.append({"role": "user", "content": user_message})
            
            logger.info(f"Generating AI response for message: '{user_message[:50]}...'")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            response_time = int((time.time() - start_time) * 1000)
            
            assistant_message = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            logger.info(f"AI response generated successfully. Tokens: {tokens_used}, Time: {response_time}ms")
            
            return {
                "content": assistant_message,
                "tokens_used": tokens_used,
                "model_used": self.model,
                "response_time": response_time
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            raise Exception(f"Failed to generate AI response: {str(e)}")
    
    async def generate_session_title(self, first_message: str) -> str:
        if self.use_mock:
            words = first_message.split()[:5]
            title = " ".join(words)
            if len(title) > 50:
                title = title[:47] + "..."
            return title or "Study Session"
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a short, descriptive title (max 6 words) for a study session based on the student's question. Only return the title, nothing else."
                    },
                    {
                        "role": "user",
                        "content": first_message
                    }
                ],
                max_tokens=20,
                temperature=0.7
            )
            
            title = response.choices[0].message.content.strip()
            return title[:100]
            
        except Exception as e:
            logger.error(f"Error generating session title: {str(e)}")
            return "Study Session"


# Create singleton instance
ai_service = AIService()

