import { authApi, openverseApi, recentSearchesService } from './api';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  describe('authApi', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const mockResponse = {
          user: {
            _id: 'test-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          token: 'test-token',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        });

        const userData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        };

        const result = await authApi.register(userData);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/register'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(userData),
          })
        );

        expect(result).toEqual(mockResponse);
      });

      it('should throw an error when registration fails', async () => {
        const errorMessage = 'Email already exists';
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: jest.fn().mockResolvedValue({ message: errorMessage }),
        });

        const userData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'existing@example.com',
          password: 'password123',
        };

        await expect(authApi.register(userData)).rejects.toThrow(errorMessage);
      });
    });

    describe('login', () => {
      it('should login a user successfully', async () => {
        const mockResponse = {
          user: {
            _id: 'test-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          token: 'test-token',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        });

        const credentials = {
          email: 'john@example.com',
          password: 'password123',
        };

        const result = await authApi.login(credentials);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(credentials),
          })
        );

        expect(result).toEqual(mockResponse);
      });

      it('should throw an error when login fails', async () => {
        const errorMessage = 'Invalid credentials';
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: jest.fn().mockResolvedValue({ message: errorMessage }),
        });

        const credentials = {
          email: 'wrong@example.com',
          password: 'wrongpassword',
        };

        await expect(authApi.login(credentials)).rejects.toThrow(errorMessage);
      });
    });
  });

  describe('openverseApi', () => {
    const mockToken = 'test-token';

    describe('searchImages', () => {
      it('should search for images successfully', async () => {
        const mockResponse = {
          result_count: 2,
          page_count: 1,
          results: [
            { id: 'image1', title: 'Test Image 1' },
            { id: 'image2', title: 'Test Image 2' },
          ],
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        });

        const params = { q: 'nature', license: 'by' as const };
        const result = await openverseApi.searchImages(params, mockToken);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/openverse/images?q=nature&license=by'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });
    });

    describe('getImage', () => {
      it('should get image details successfully', async () => {
        const mockResponse = {
          id: 'image1',
          title: 'Test Image',
          url: 'http://example.com/image.jpg',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await openverseApi.getImage('image1', mockToken);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/openverse/images/image1'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('recentSearchesService', () => {
    describe('addRecentSearch', () => {
      it('should add a search to recent searches', () => {
        const type = 'image';
        const query = 'nature';
        
        const result = recentSearchesService.addRecentSearch(type, query);
        
        expect(result.length).toBe(1);
        expect(result[0].type).toBe(type);
        expect(result[0].query).toBe(query);
        
        // Verify stored in localStorage
        const storedSearches = JSON.parse(window.localStorage.getItem('recentSearches') || '[]');
        expect(storedSearches.length).toBe(1);
      });

      it('should limit number of recent searches', () => {
        // Add more than the limit
        for (let i = 0; i < 15; i++) {
          recentSearchesService.addRecentSearch('image', `query${i}`);
        }
        
        const result = recentSearchesService.getRecentSearches();
        
        // Should be limited to MAX_RECENT_SEARCHES (10)
        expect(result.length).toBe(10);
        
        // Should be in reverse order (most recent first)
        expect(result[0].query).toBe('query14');
      });
    });

    describe('deleteRecentSearch', () => {
      it('should delete a search from recent searches', () => {
        // Add a search
        const searches = recentSearchesService.addRecentSearch('image', 'nature');
        const searchId = searches[0].id;
        
        // Delete it
        const result = recentSearchesService.deleteRecentSearch(searchId);
        
        expect(result.length).toBe(0);
        
        // Verify localStorage updated
        const storedSearches = JSON.parse(window.localStorage.getItem('recentSearches') || '[]');
        expect(storedSearches.length).toBe(0);
      });
    });

    describe('clearRecentSearches', () => {
      it('should clear all recent searches', () => {
        // Add some searches
        recentSearchesService.addRecentSearch('image', 'nature');
        recentSearchesService.addRecentSearch('audio', 'music');
        
        // Clear them
        recentSearchesService.clearRecentSearches();
        
        const result = recentSearchesService.getRecentSearches();
        expect(result.length).toBe(0);
        
        // Verify localStorage cleared
        expect(window.localStorage.getItem('recentSearches')).toBeNull();
      });
    });
  });
});