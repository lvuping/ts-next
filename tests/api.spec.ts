import { test, expect } from '@playwright/test';

test.describe('API Routes', () => {
  let authCookie: string;

  test.beforeAll(async ({ request }) => {
    // Get auth cookie
    const loginResponse = await request.post('/api/auth', {
      data: { password: 'changeme123' }
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const cookies = loginResponse.headers()['set-cookie'];
    authCookie = cookies;
  });

  test('GET /api/notes - should return notes list', async ({ request }) => {
    const response = await request.get('/api/notes', {
      headers: {
        'Cookie': authCookie
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const notes = await response.json();
    expect(Array.isArray(notes)).toBeTruthy();
  });

  test('POST /api/notes - should create a new note', async ({ request }) => {
    const noteData = {
      title: 'API Test Note',
      content: 'console.log("API test");',
      language: 'javascript',
      category: 'Backend',
      tags: ['api', 'test'],
      favorite: false
    };

    const response = await request.post('/api/notes', {
      headers: {
        'Cookie': authCookie
      },
      data: noteData
    });
    
    expect(response.ok()).toBeTruthy();
    const note = await response.json();
    expect(note.title).toBe(noteData.title);
    expect(note.id).toBeTruthy();
  });

  test('GET /api/notes/[id] - should get single note', async ({ request }) => {
    // First create a note
    const createResponse = await request.post('/api/notes', {
      headers: {
        'Cookie': authCookie
      },
      data: {
        title: 'Note to Get',
        content: 'const test = true;',
        language: 'javascript',
        category: 'Backend',
        tags: [],
        favorite: false
      }
    });
    
    const createdNote = await createResponse.json();
    
    // Get the note
    const response = await request.get(`/api/notes/${createdNote.id}`, {
      headers: {
        'Cookie': authCookie
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const note = await response.json();
    expect(note.id).toBe(createdNote.id);
    expect(note.title).toBe('Note to Get');
  });

  test('PUT /api/notes/[id] - should update a note', async ({ request }) => {
    // First create a note
    const createResponse = await request.post('/api/notes', {
      headers: {
        'Cookie': authCookie
      },
      data: {
        title: 'Note to Update',
        content: 'const original = true;',
        language: 'javascript',
        category: 'Backend',
        tags: [],
        favorite: false
      }
    });
    
    const createdNote = await createResponse.json();
    
    // Update the note
    const updateData = {
      ...createdNote,
      title: 'Updated Note',
      content: 'const updated = true;'
    };
    
    const response = await request.put(`/api/notes/${createdNote.id}`, {
      headers: {
        'Cookie': authCookie
      },
      data: updateData
    });
    
    expect(response.ok()).toBeTruthy();
    const updatedNote = await response.json();
    expect(updatedNote.title).toBe('Updated Note');
    expect(updatedNote.content).toBe('const updated = true;');
  });

  test('DELETE /api/notes/[id] - should delete a note', async ({ request }) => {
    // First create a note
    const createResponse = await request.post('/api/notes', {
      headers: {
        'Cookie': authCookie
      },
      data: {
        title: 'Note to Delete',
        content: 'const toDelete = true;',
        language: 'javascript',
        category: 'Backend',
        tags: [],
        favorite: false
      }
    });
    
    const createdNote = await createResponse.json();
    
    // Delete the note
    const response = await request.delete(`/api/notes/${createdNote.id}`, {
      headers: {
        'Cookie': authCookie
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    // Verify it's deleted
    const getResponse = await request.get(`/api/notes/${createdNote.id}`, {
      headers: {
        'Cookie': authCookie
      }
    });
    
    expect(getResponse.status()).toBe(404);
  });

  test('POST /api/notes/[id]/favorite - should toggle favorite', async ({ request }) => {
    // First create a note
    const createResponse = await request.post('/api/notes', {
      headers: {
        'Cookie': authCookie
      },
      data: {
        title: 'Note to Favorite',
        content: 'const favorite = false;',
        language: 'javascript',
        category: 'Backend',
        tags: [],
        favorite: false
      }
    });
    
    const createdNote = await createResponse.json();
    expect(createdNote.favorite).toBe(false);
    
    // Toggle favorite
    const response = await request.post(`/api/notes/${createdNote.id}/favorite`, {
      headers: {
        'Cookie': authCookie
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const updatedNote = await response.json();
    expect(updatedNote.favorite).toBe(true);
  });

  test('GET /api/notes/metadata - should return categories and tags', async ({ request }) => {
    const response = await request.get('/api/notes/metadata', {
      headers: {
        'Cookie': authCookie
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const metadata = await response.json();
    expect(metadata.categories).toBeTruthy();
    expect(metadata.tags).toBeTruthy();
    expect(Array.isArray(metadata.categories)).toBeTruthy();
    expect(Array.isArray(metadata.tags)).toBeTruthy();
  });

  test('API routes should require authentication', async ({ request }) => {
    // Test without auth cookie
    const endpoints = [
      '/api/notes',
      '/api/notes/123',
      '/api/notes/metadata'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(401);
    }
  });
});