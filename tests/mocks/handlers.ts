import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for mocking API requests in tests
 * Add your API endpoint mocks here
 */
export const handlers = [
  // Example: Mock dashboard API
  // http.get('/api/dashboard', () => {
  //   return HttpResponse.json({
  //     totalDecks: 5,
  //     totalFlashcards: 25,
  //     studySessions: 3,
  //     reviewsDue: 10,
  //   });
  // }),

  // Add more handlers as needed for your tests
];
