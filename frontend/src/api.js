// api.js
const API_BASE_URL = 'http://localhost:8000';

/**
 * Sends a generation request to the FastAPI backend.
 * @param {Object} params
 * @param {string} params.inputText - The user topic or brand description.
 * @param {string} params.inputType - Either 'topic' or 'brand_description'.
 * @param {string} params.platform - 'linkedin', 'twitter', or 'instagram'.
 * @param {string} params.mode - 'single' or 'calendar'.
 * @param {number} [params.days] - Number of days for content calendar (1-30).
 * @returns {Promise<Object|Array>} Resolves to a single post object or an array of calendar days.
 */
export async function generateContent({ inputText, inputType, platform, mode, days }) {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input_text: inputText,
      input_type: inputType,
      platform: platform,
      mode: mode,
      days: mode === 'calendar' ? parseInt(days, 10) : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An error occurred while generating content.');
  }

  return response.json();
}

/**
 * Sends a regeneration/refinement request to the FastAPI backend.
 * @param {Object} params
 * @param {string} params.originalPost - The text content of the post to refine.
 * @param {string} params.platform - 'linkedin', 'twitter', or 'instagram'.
 * @param {string} params.refineInstructions - The refinement instruction (e.g. 'shorter', 'more funny').
 * @returns {Promise<Object>} Resolves to the refined post object.
 */
export async function regenerateContent({ originalPost, platform, refineInstructions }) {
  const response = await fetch(`${API_BASE_URL}/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      original_post: originalPost,
      platform: platform,
      refine_instructions: refineInstructions,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An error occurred while refining content.');
  }

  return response.json();
}
