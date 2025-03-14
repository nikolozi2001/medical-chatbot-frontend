/**
 * Database of predefined questions and answers
 * The keys are the questions or patterns to match
 * The values are the answers to return
 */
export const PREDEFINED_QA = {
  // English questions
  "hello": "Hello, how can I help you?",
  "what is your name?": "I am MediBot, your personal medical assistant.",
  "who created you?": "I was created by Nika Kachibaia to provide medical information.",
  "how does blood pressure work?": "Blood pressure is the force of blood pushing against the walls of your arteries. It's measured using two numbers: systolic (top number) and diastolic (bottom number).",
  
  // You can add variations of the same question
  "what should i do for a headache?": "For a headache, you can try resting in a quiet dark room, staying hydrated, and taking over-the-counter pain relievers like acetaminophen or ibuprofen. If headaches are severe or persistent, please consult with a healthcare provider.",
  "how to treat headache?": "For a headache, you can try resting in a quiet dark room, staying hydrated, and taking over-the-counter pain relievers like acetaminophen or ibuprofen. If headaches are severe or persistent, please consult with a healthcare provider.",
  
  // Georgian questions
  "გამარჯობა": "გამარჯობა, რით შემიძლია დაგეხმაროთ?",
  "რა გქვია?": "მე ვარ მედიბოტი, თქვენი პირადი სამედიცინო ასისტენტი.",
  "ვინ შეგქმნა?": "მე შემქმნა ნიკოლოზ ქაჩიბაიამ სამედიცინო ინფორმაციის მისაწოდებლად.",
  "რა არის სისხლის წნევა?": "სისხლის წნევა არის ძალა, რომელსაც სისხლი ახდენს არტერიების კედლებზე. იგი იზომება ორი რიცხვით: სისტოლური (ზედა რიცხვი) და დიასტოლური (ქვედა რიცხვი).",

  // Headache related questions in Georgian
  "რა უნდა გავაკეთო თავის ტკივილის დროს?": "თავის ტკივილისთვის შეგიძლიათ დაისვენოთ წყნარ ბნელ ოთახში, დალიოთ საკმარისი რაოდენობის წყალი, და მიიღოთ ურეცეპტო ტკივილგამაყუჩებლები როგორიცაა პარაცეტამოლი ან იბუპროფენი. თუ თავის ტკივილი მძიმე ან ხანგრძლივია, გთხოვთ მიმართოთ ექიმს.",
  "როგორ მოვიხსნა თავის ტკივილი?": "თავის ტკივილისთვის შეგიძლიათ დაისვენოთ წყნარ ბნელ ოთახში, დალიოთ საკმარისი რაოდენობის წყალი, და მიიღოთ ურეცეპტო ტკივილგამაყუჩებლები როგორიცაა პარაცეტამოლი ან იბუპროფენი. თუ თავის ტკივილი მძიმე ან ხანგრძლივია, გთხოვთ მიმართოთ ექიმს.",
  
  // Add more Q&A pairs as needed
};

/**
 * Keywords-based matching for more flexible question recognition
 * Maps keywords to specific questions in the PREDEFINED_QA object
 */
export const KEYWORD_MAPPINGS = {
  // English keywords
  "headache pain head": "what should i do for a headache?",
  "blood pressure hypertension": "how does blood pressure work?",
  "name who are you": "what is your name?",
  "created made developed": "who created you?",
  
  // Georgian keywords
  "თავის ტკივილი": "რა უნდა გავაკეთო თავის ტკივილის დროს?",
  "სისხლის წნევა": "რა არის სისხლის წნევა?",
  "რა გქვია ვინ ხარ": "რა გქვია?",
  "ვინ შეგქმნა ვინ გააკეთა": "ვინ შეგქმნა?",
};

/**
 * Check if a question has a predefined answer
 * @param {string} question - The user's question
 * @returns {string|null} The answer if found, null otherwise
 */
export function findPredefinedAnswer(question) {
  // Convert to lowercase for case-insensitive matching
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Check for exact match first
  if (PREDEFINED_QA[normalizedQuestion]) {
    return PREDEFINED_QA[normalizedQuestion];
  }
  
  // Check keyword-based matching
  for (const [keywords, mappedQuestion] of Object.entries(KEYWORD_MAPPINGS)) {
    const keywordArray = keywords.split(' ');
    const matchesKeywords = keywordArray.some(keyword => 
      normalizedQuestion.includes(keyword)
    );
    
    if (matchesKeywords && PREDEFINED_QA[mappedQuestion]) {
      return PREDEFINED_QA[mappedQuestion];
    }
  }
  
  // No predefined answer found
  return null;
}
