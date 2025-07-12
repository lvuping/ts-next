#!/bin/bash

echo "Testing Note Application Functionality"
echo "======================================="

# Test 1: Check home page redirects to login
echo -e "\n1. Testing home page redirect..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "Home page status: $STATUS"

# Test 2: Check notes page (should redirect to login if not authenticated)
echo -e "\n2. Testing notes page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/notes)
echo "Notes page status: $STATUS"

# Test 3: Check note creation page
echo -e "\n3. Testing note creation page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/notes/new)
echo "Note creation page status: $STATUS"

# Test 4: Check specific note pages
echo -e "\n4. Testing specific note pages..."
for id in "1757896800000-test1" "1757896800001-test2" "1757896800002-test3" "1757896800003-test4"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/notes/view/$id)
  echo "Note $id view page status: $STATUS"
done

# Test 5: Check edit pages
echo -e "\n5. Testing edit pages..."
for id in "1757896800000-test1" "1757896800001-test2"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/notes/edit/$id)
  echo "Note $id edit page status: $STATUS"
done

# Test 6: Check API endpoints
echo -e "\n6. Testing API endpoints..."
echo "GET /api/notes (should fail without auth):"
curl -s http://localhost:3000/api/notes | jq '.'

echo -e "\nGET /api/notes/1757896800000-test1 (should fail without auth):"
curl -s http://localhost:3000/api/notes/1757896800000-test1 | jq '.'

# Test 7: Check database integrity
echo -e "\n7. Checking database integrity..."
sqlite3 notes.db "SELECT COUNT(*) as total_notes FROM notes;"
sqlite3 notes.db "SELECT COUNT(*) as total_tags FROM tags;"
sqlite3 notes.db "SELECT COUNT(*) as total_note_tags FROM note_tags;"

# Test 8: Check content formats
echo -e "\n8. Checking content formats..."
sqlite3 notes.db "SELECT id, title, content_format, favorite FROM notes;"

echo -e "\nAll tests completed!"