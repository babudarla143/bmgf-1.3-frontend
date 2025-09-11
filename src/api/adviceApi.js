import axios from 'axios';

/**
 * Fetches agricultural advice from the backend API.
 * @param {Object} params - Crop details.
 * @param {string} params.crop - Name of the crop.
 * @param {string} params.stage - Growth stage of the crop.
 * @param {string} params.location - Location of the farm.
 * @param {string} params.date - Selected date in YYYY-MM-DD format.
 * @returns {Object|null} - The response data containing advice or null on failure.
 */

// Corrected getAdvice with trailing slash
export const getAdvice = async ({ crop, stage, date, village }) => {
  try {
    const res = await axios.post(
      'https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/advice/get_advice',
      {
        crop,
        stage,
        date,
        village,
      },
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("Response from getAdvice:", res.data);
    if (res.data?.advice_list?.length > 0) {
      console.log("Advice received:", res.data.advice_list);
      localStorage.setItem('get_advice', JSON.stringify(res.data.advice_list));
      return res.data;
    } else {
      console.warn('No advice returned from server.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching advice:', error);
    return null;
  }
};
