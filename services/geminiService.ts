
import { GoogleGenAI, GenerateContentResponse, Chat, Part } from "@google/genai";
import { SuggestedItem, MenuItemForPrompt } from '../types';

let ai: GoogleGenAI | null = null;
let initError: Error | null = null;

const API_KEY_ENV = process.env.API_KEY;

if (!API_KEY_ENV) {
  const errorMessage = "API_KEY environment variable is not set. Gemini API calls will fail.";
  console.warn(errorMessage);
  initError = new Error(errorMessage);
} else {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY_ENV });
  } catch (e) {
    const errorMessage = "Failed to initialize GoogleGenAI client. Please check if the API key is valid.";
    console.error(errorMessage, e);
    initError = e instanceof Error ? e : new Error(errorMessage);
    ai = null; 
  }
}

const SUGGESTION_MARKER = '%%%SUGGESTIONS%%%';
const ORDER_INTENT_MARKER = '%%%ORDER_INTENT%%%';
const REMOVE_INTENT_MARKER = '%%%REMOVE_INTENT%%%';
const CHECKOUT_INTENT_MARKER = '%%%CHECKOUT_INTENT%%%';

export interface ParsedBotResponse {
  text: string;
  suggestions?: SuggestedItem[];
  orderIntent?: { itemName: string; quantity: number; customizationNotes?: string }[];
  removeIntent?: { itemName: string; quantity: number; customizationNotes?: string }[];
  checkoutIntent?: boolean;
}

const getMenuForPromptInjection = (menuItemsForPrompt: MenuItemForPrompt[]): string => {
  return JSON.stringify(menuItemsForPrompt.map(item => {
    const promptItem: any = {
      id: item.id,
      name: item.name,
      category: item.category,
      tastes: item.tasteProfiles.join(', '),
    };
    if (item.pieces) {
      promptItem.composition_details = `${item.pieces} pc${item.pieces > 1 ? 's' : ''}`;
    }
    return promptItem;
  }));
};

export const startChat = async (menuItemsForPrompt: MenuItemForPrompt[]): Promise<Chat> => {
  if (initError) {
    throw initError;
  }
  if (!ai) {
    throw new Error("Gemini AI service is not initialized. This should not happen if initError is also null.");
  }

  const menuContext = getMenuForPromptInjection(menuItemsForPrompt);

  const systemInstructionString: string = `You are Froastie, a friendly and efficient culinary assistant for Fire & Froast restaurant.
Your primary goal is to help users find dishes, customize them if requested, manage their order, and proceed to checkout.
Our menu items (with id, name, category, tastes, and optional composition_details) are:
${menuContext}

**Understanding Item Composition**:
Some menu items have a "composition_details" field (e.g., "2 pcs" for Gulab Jamun). This describes the standard serving.
"Quantity" refers to how many standard servings a user wants.

**Food Customization**:
Users can request customizations (e.g., "Paneer Butter Masala, make it extra spicy", "Chicken Biryani without nuts", "Masala Dosa, extra crispy").
- When a user requests an item with customization, capture their specific request.
- Assume most reasonable textual customizations can be passed to the kitchen.
- If a customization seems impossible or unclear, politely ask for clarification or state limitations gently.
- When you use ${ORDER_INTENT_MARKER}, include an optional "customizationNotes" field (string) with the user's full customization request for that specific item.
- Example for order: "I'd like a Paneer Butter Masala, make it very spicy and no cashews." -> ${ORDER_INTENT_MARKER}[{"itemName": "Paneer Butter Masala", "quantity": 1, "customizationNotes": "make it very spicy and no cashews"}]
- **Handling Mixed Quantities and Customizations**: If a user asks for multiple units of an item but specifies a customization for only some of them (e.g., "I need 2 Chai, one with extra sweet"), you MUST represent this as separate entries in the JSON array, ensuring the total quantity matches the user's request.
  - Example: "I need 2 Chai, make one extra sweet." -> ${ORDER_INTENT_MARKER}[{"itemName": "Chai", "quantity": 1, "customizationNotes": "extra sweet"}, {"itemName": "Chai", "quantity": 1}]
  - Example: "Three Paneer Butter Masalas, one mild and two spicy." -> ${ORDER_INTENT_MARKER}[{"itemName": "Paneer Butter Masala", "quantity": 1, "customizationNotes": "mild"}, {"itemName": "Paneer Butter Masala", "quantity": 2, "customizationNotes": "spicy"}]
  - If the user says "2 chai, extra sweet" (implying the customization applies to all), represent it as a single entry: ${ORDER_INTENT_MARKER}[{"itemName": "Chai", "quantity": 2, "customizationNotes": "extra sweet"}]


**Order Management & Checkout**:

*   **Slash Commands (User-typed, App-handled)**:
    Inform users about these if they ask *how* to manage their order.
    - \`/add [item name]\`: (Informational) Tell Froastie directly, e.g., 'add two samosas, one extra spicy'.
    - \`/remove [quantity] [item name]\`: Removes item(s). Be mindful of customizations if a user has multiple versions of the same base item.
    - \`/vieworder\`: Shows current order.
    - \`/checkout\`: Starts checkout.
    - \`/confirmorder\`: Confirms order in checkout.
    - \`/cancelorder\`: Cancels checkout.
    DO NOT attempt to process slash commands yourself.

*   **Direct Order Intent (You detect, App handles)**:
    If a user wants to order item(s), possibly with customizations:
    1.  Respond conversationally.
    2.  Append: "${ORDER_INTENT_MARKER}".
    3.  Follow with a VALID JSON ARRAY: \`[{"itemName": "Exact Base Item Name", "quantity": number, "customizationNotes"?: "User's specific request for this item"}, ...]\`.
        - "itemName" MUST be an EXACT BASE NAME from the menu.
        - "quantity" MUST be a positive integer (default 1).
        - "customizationNotes" is optional; include if the user specified any. Refer to "Handling Mixed Quantities and Customizations" for details.
    4.  If using ${ORDER_INTENT_MARKER}, do NOT use other markers.

*   **Direct Remove Intent (You detect, App handles)**:
    If a user wants to remove item(s):
    1.  Respond conversationally.
    2.  Append: "${REMOVE_INTENT_MARKER}".
    3.  Follow with a VALID JSON ARRAY: \`[{"itemName": "Exact Base Item Name", "quantity": number, "customizationNotes"?: "Specify notes if needed to identify a specific version"}, ...]\`.
        - "itemName" MUST be an EXACT BASE NAME.
        - "quantity" MUST be a positive integer (default 1).
        - "customizationNotes" might be needed if the user had ordered, e.g., a "spicy" version and a "mild" version of the same dish. If they are vague (e.g. "remove Paneer Butter Masala") and multiple distinct customized versions are in their order history (discern from chat), ask them to clarify which one (e.g., "Sure, the spicy one or the mild one?"). If they specify, include the notes to help the app remove the correct one. If no customization was mentioned for removal and only one version exists, omit notes.
    4.  If using ${REMOVE_INTENT_MARKER}, do NOT use other markers.

*   **Proceeding to Checkout Intent (You detect, App handles)**:
    If the user is ready for their bill:
    1.  Check if their order/cart (based on chat history) is empty.
    2.  If cart NOT empty:
        a. Respond conversationally (e.g., "Great! Let's get your bill ready.").
        b. Append: "${CHECKOUT_INTENT_MARKER}". (No JSON after this marker for checkout).
    3.  If cart IS empty:
        a. Politely inform them and ask what they'd like. Do NOT use ${CHECKOUT_INTENT_MARKER}.
    4.  If using ${CHECKOUT_INTENT_MARKER}, do NOT use other markers.
    5.  Proactive Check: After adding an item, if cart isn't empty, you can ask, "Anything else, or ready for your bill?" If they affirm, use ${CHECKOUT_INTENT_MARKER}.

**Displaying the Full Menu**:
If user asks for the full menu:
1.  Brief intro.
2.  Append: "${SUGGESTION_MARKER}".
3.  Follow with JSON array of ALL menu items: \`[{"id": "ID", "reason": "Category"}, ...]\`. Each item's "reason" should be its category (e.g., "Appetizer", "Main Course").
4.  Do NOT use other markers.

**Item Suggestions (General Conversation)**:
1.  Conversational text first.
2.  If suggesting specific items, append: "${SUGGESTION_MARKER}".
3.  Follow with JSON array: \`[{"id": "ID", "reason": "Brief reason, max 15 words"}, ...]\`.
4.  Suggest 3-4 diverse items for general queries; 1-2 for specific queries or pairings.
*   **Pairing Recommendations**: Consider cart items (from chat history) and suggest complements. "reason" should highlight pairing. Example: "A cool Mango Lassi would be great with your spicy Samosa! ${SUGGESTION_MARKER}[{\\"id\\": \\"5\\", \\"reason\\": \\"Refreshing with spicy Samosas!\\"}]"

**General Instructions**:
1.  **Style**: Direct, concise, simple, clear, polite, helpful, efficient.
2.  Quickly understand preferences. Ask brief clarifying questions if necessary.
3.  DO NOT make up menu items. Only use the provided menu. Refer to it as "our menu".
4.  Ensure JSON output is ONLY for its respective marker and DIRECTLY follows it. No markdown (like \`\`\`json \`\`\`) wrapping the JSON.
`;

  const chat = ai.chats.create({ 
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstructionString,
      temperature: 0.6,
      topP: 0.9,
      topK: 40,
    }
  });
  return chat;
};

const cleanJsonString = (textFollowingMarker: string): string => {
    let clean = textFollowingMarker.trimStart(); // Trim leading whitespace

    // 1. Handle markdown fences first (e.g., ```json ... ```)
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const fenceMatch = clean.match(fenceRegex);
    if (fenceMatch && fenceMatch[1]) {
        clean = fenceMatch[1].trim(); // Content inside fences
    }
    // At this point, 'clean' is either the content within fences or the raw text after marker (trimmed start).
    // It might still have trailing non-JSON text if not fenced.

    // 2. Isolate the first complete JSON object or array
    let isolatedJson = "";
    if (clean.startsWith('[')) {
        let balance = 0;
        for (let i = 0; i < clean.length; i++) {
            if (clean[i] === '[') balance++;
            else if (clean[i] === ']') balance--;
            if (balance === 0 && clean[i] === ']') {
                isolatedJson = clean.substring(0, i + 1);
                break;
            }
        }
    } else if (clean.startsWith('{')) {
        let balance = 0;
        for (let i = 0; i < clean.length; i++) {
            if (clean[i] === '{') balance++;
            else if (clean[i] === '}') balance--;
            if (balance === 0 && clean[i] === '}') {
                isolatedJson = clean.substring(0, i + 1);
                break;
            }
        }
    } else {
        // Does not start with [ or {, so it's not valid JSON to begin with for our markers
        return ""; 
    }
    
    // Validate if the isolated string is indeed parseable JSON
    try {
        JSON.parse(isolatedJson);
        return isolatedJson; // Return if parseable
    } catch (e) {
        // If parsing fails even after isolation, it's malformed.
        // console.warn("Isolated string is not valid JSON:", isolatedJson, e);
        return ""; // Return empty if not valid JSON
    }
};


export const sendMessageToBot = async (
  chat: Chat, 
  message: string,
  menuItemsForPrompt: MenuItemForPrompt[] 
): Promise<ParsedBotResponse> => {
  if (initError) { 
    throw initError;
  }

  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    const rawText = response.text;

    let conversationalText = rawText;
    let suggestions: SuggestedItem[] | undefined = undefined;
    let orderIntentArray: { itemName: string; quantity: number; customizationNotes?: string }[] | undefined = undefined;
    let removeIntentArray: { itemName: string; quantity: number; customizationNotes?: string }[] | undefined = undefined;
    let checkoutIntentFlag: boolean | undefined = undefined;

    const orderIntentMarkerIndex = rawText.indexOf(ORDER_INTENT_MARKER);
    const suggestionMarkerIndex = rawText.indexOf(SUGGESTION_MARKER);
    const removeIntentMarkerIndex = rawText.indexOf(REMOVE_INTENT_MARKER);
    const checkoutIntentMarkerIndex = rawText.indexOf(CHECKOUT_INTENT_MARKER);


    if (checkoutIntentMarkerIndex !== -1) {
        conversationalText = rawText.substring(0, checkoutIntentMarkerIndex).trim();
        checkoutIntentFlag = true;
    } else if (orderIntentMarkerIndex !== -1) {
      conversationalText = rawText.substring(0, orderIntentMarkerIndex).trim();
      const textAfterMarker = rawText.substring(orderIntentMarkerIndex + ORDER_INTENT_MARKER.length);
      const isolatedJsonString = cleanJsonString(textAfterMarker);
      
      if (isolatedJsonString) {
        try {
          const parsedJson = JSON.parse(isolatedJsonString);
          if (Array.isArray(parsedJson) && parsedJson.every(item => 
              item && typeof item.itemName === 'string' && 
              (typeof item.quantity === 'number' || item.quantity === undefined) &&
              (typeof item.customizationNotes === 'string' || item.customizationNotes === undefined)
          )) {
            orderIntentArray = parsedJson.map(item => ({
              itemName: item.itemName,
              quantity: (typeof item.quantity === 'number' && item.quantity > 0) ? Math.floor(item.quantity) : 1,
              customizationNotes: item.customizationNotes
            }));
          } else {
            console.warn("Parsed JSON for order intent is not an array of the expected format:", parsedJson, "From string:", isolatedJsonString);
            conversationalText += ` (Order processing issue with: ${isolatedJsonString.substring(0,30)}...)`;
          }
        } catch (e) {
          console.error("Failed to parse order intent JSON:", e, "JSON string:", isolatedJsonString, "Raw bot text:", rawText);
          conversationalText += ` (Order processing error: ${isolatedJsonString.substring(0,30)}...)`;
        }
      }
    } else if (removeIntentMarkerIndex !== -1) { 
      conversationalText = rawText.substring(0, removeIntentMarkerIndex).trim();
      const textAfterMarker = rawText.substring(removeIntentMarkerIndex + REMOVE_INTENT_MARKER.length);
      const isolatedJsonString = cleanJsonString(textAfterMarker);

      if (isolatedJsonString) {
        try {
          const parsedJson = JSON.parse(isolatedJsonString);
           if (Array.isArray(parsedJson) && parsedJson.every(item => 
              item && typeof item.itemName === 'string' && 
              (typeof item.quantity === 'number' || item.quantity === undefined) &&
              (typeof item.customizationNotes === 'string' || item.customizationNotes === undefined)
          )) {
            removeIntentArray = parsedJson.map(item => ({
              itemName: item.itemName,
              quantity: (typeof item.quantity === 'number' && item.quantity > 0) ? Math.floor(item.quantity) : 1,
              customizationNotes: item.customizationNotes
            }));
          } else {
            console.warn("Parsed JSON for remove intent is not an array of the expected format:", parsedJson, "From string:", isolatedJsonString);
            conversationalText += ` (Remove processing issue with: ${isolatedJsonString.substring(0,30)}...)`;
          }
        } catch (e) {
          console.error("Failed to parse remove intent JSON:", e, "JSON string:", isolatedJsonString, "Raw bot text:", rawText);
          conversationalText += ` (Remove processing error: ${isolatedJsonString.substring(0,30)}...)`;
        }
      }
    } else if (suggestionMarkerIndex !== -1) {
      conversationalText = rawText.substring(0, suggestionMarkerIndex).trim();
      const textAfterMarker = rawText.substring(suggestionMarkerIndex + SUGGESTION_MARKER.length);
      const isolatedJsonString = cleanJsonString(textAfterMarker);

      if (isolatedJsonString) {
        try {
          const parsedJson = JSON.parse(isolatedJsonString);
          if (Array.isArray(parsedJson) && parsedJson.every(item => typeof item.id === 'string' && typeof item.reason === 'string')) {
            suggestions = parsedJson as SuggestedItem[];
          } else {
            console.warn("Parsed JSON for suggestions is not in the expected format:", parsedJson, "From string:", isolatedJsonString);
            conversationalText += " (Suggestion format issue.)";
          }
        } catch (e) {
          console.error("Failed to parse suggestions JSON:", e, "JSON string:", isolatedJsonString, "Raw bot text:", rawText);
          conversationalText += ` (Suggestion format issue: ${isolatedJsonString.substring(0,30)}...)`;
        }
      }
    }

    return {
      text: conversationalText,
      suggestions: suggestions,
      orderIntent: orderIntentArray,
      removeIntent: removeIntentArray,
      checkoutIntent: checkoutIntentFlag,
    };

  } catch (error) {
    console.error("Error calling Gemini API in sendMessageToBot:", error);
    if (error instanceof Error) {
      if (error.message.includes('API key not valid')) { 
        throw new Error("The API key is invalid or has insufficient permissions. Please check your configuration.");
      }
      throw new Error(`Chat service error during message sending: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the chat service during message sending.');
  }
};
