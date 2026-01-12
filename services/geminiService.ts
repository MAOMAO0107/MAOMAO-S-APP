
import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const STANDARD_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Utilities',
  'Shopping',
  'Health & Fitness',
  'Education',
  'Entertainment',
  'Travel & Tourism',
  'Insurance & Finance',
  'Gifts & Donations',
  'Personal Care',
  'General'
];

export const classifyTransaction = async (description: string, amount: number): Promise<ClassificationResult> => {
  const systemInstruction = `You are a professional financial auditor. 
Your task is to classify user financial transactions into a STRICT set of high-level categories to ensure clean and manageable data.

RULES:
1. Determine the TYPE:
   - 'income': Money received (salary, interest, gift received).
   - 'savings': Money set aside for future/investment (savings transfers, stock buys).
   - 'expense': Money spent on goods or services.

2. Assign a CATEGORY:
   - If TYPE is 'income', the category MUST be exactly 'Income'.
   - If TYPE is 'savings', the category MUST be exactly 'Savings'.
   - If TYPE is 'expense', you MUST choose the most appropriate category from this list only:
     ${STANDARD_EXPENSE_CATEGORIES.join(', ')}.

   Examples:
   - "Starbucks", "Lunch", "McDonald's", "Grocery store" -> Food & Dining
   - "Uber", "Gas", "Bus ticket", "Airfare" -> Transportation
   - "Rent", "Electricity bill", "Water" -> Housing & Utilities
   - "Uniqlo", "Amazon", "IKEA" -> Shopping
   - "Doctor visit", "Gym membership" -> Health & Fitness
   - "Netflix", "Cinema", "Game" -> Entertainment
   - "Travel insurance", "Car insurance", "Bank fee" -> Insurance & Finance

3. Return result in strict JSON format.`;

  const prompt = `Classify this transaction:
Description: "${description}"
Amount: ${amount}

Identify the type and the category based on the rules.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'The standard category name.',
            },
            type: {
              type: Type.STRING,
              enum: ['income', 'expense', 'savings'],
              description: 'Nature of transaction.',
            },
          },
          required: ["category", "type"],
        },
      },
    });

    const text = response.text || '{}';
    const result = JSON.parse(text) as ClassificationResult;
    
    // Ensure the category is one of the allowed ones for expenses
    if (result.type === 'expense' && !STANDARD_EXPENSE_CATEGORIES.includes(result.category)) {
      result.category = 'General';
    } else if (result.type === 'income') {
      result.category = 'Income';
    } else if (result.type === 'savings') {
      result.category = 'Savings';
    }
    
    return result;
  } catch (error) {
    console.error("AI Classification failed", error);
    return {
      category: "General",
      type: "expense"
    };
  }
};
