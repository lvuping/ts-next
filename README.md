# Notes PKM - Personal Knowledge Management

A modern, feature-rich note-taking application built with Next.js 15, designed specifically for developers to manage code snippets and technical knowledge.

## 🚀 Features

### Core Functionality
- **Code Snippet Management**: Store, organize, and search through your code snippets
- **Syntax Highlighting**: Beautiful code highlighting powered by Shiki
- **Multi-Language Support**: Support for 20+ programming languages
- **Categories & Tags**: Organize notes with categories and custom tags
- **Favorites**: Mark important notes as favorites for quick access
- **Templates**: Pre-defined templates for common code patterns

### Enhanced Features
- **🔍 Advanced Search**: Real-time fuzzy search with keyboard shortcuts (Ctrl+K or /)
- **📊 Statistics Dashboard**: Visual insights about your notes collection
- **🌓 Dark/Light Mode**: Theme support with system preference detection
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⌨️ Keyboard Shortcuts**: 
  - `Ctrl+K` or `/`: Open search
  - `Ctrl+N`: Create new note
  - `Ctrl+Shift+S`: Toggle statistics
- **🤖 AI Assistant**: Powered by Google Gemini for code suggestions and modifications
- **📝 Markdown Support**: Preview notes with markdown formatting
- **🔐 Password Protection**: Simple authentication system
- **🎨 Unified UI/UX**: Consistent layout between note creation and viewing modes
- **📐 Optimized Editor**: Large content area with best practices for note-taking apps
- **🗂️ Category Management**: Customizable categories with icons and colors

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript
- **Database**: SQLite with better-sqlite3
- **Data Storage**: SQLite database + JSON file backup
- **Syntax Highlighting**: Shiki
- **Search**: Fuse.js for fuzzy search
- **Theme**: next-themes for dark mode support
- **Testing**: Playwright for E2E tests
- **AI Integration**: Google Gemini API

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notes-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set:
- `APP_PASSWORD`: Your authentication password (default: changeme123)
- `GEMINI_API_KEY`: (Optional) Google Gemini API key for AI features

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🧪 Testing

Run integration tests:
```bash
pnpm test
```

Run tests with UI:
```bash
pnpm test:ui
```

## 📝 Usage

### Creating Notes
1. Click "New Note" or press `Ctrl+N`
2. Fill in the title, select language and category
3. Paste or write your code
4. Add relevant tags
5. Click "Create Note"

### Searching Notes
1. Press `Ctrl+K` or `/` to open search
2. Type to search by title, content, tags, or category
3. Use arrow keys to navigate results
4. Press Enter to open selected note

### AI Assistant
When editing a note:
1. Type your modification request in the AI assistant field
2. Click "Assist" or press Enter
3. The AI will modify your code based on the request

### View Modes
- **Detailed View**: Shows code preview in cards
- **Card View**: Compact cards without code preview
- **Compact View**: Table format for maximum density

## 📄 API Routes

- `POST /api/auth`: Login
- `DELETE /api/auth`: Logout
- `GET /api/notes`: Get all notes (with filters)
- `POST /api/notes`: Create note
- `GET /api/notes/[id]`: Get single note
- `PUT /api/notes/[id]`: Update note
- `DELETE /api/notes/[id]`: Delete note
- `POST /api/notes/[id]/favorite`: Toggle favorite
- `GET /api/notes/metadata`: Get categories and tags
- `POST /api/llm/assist`: AI code assistance

## 🔒 Security

- Password-based authentication with HTTP-only cookies
- Session duration: 7 days
- Secure cookies in production
- File-based lock mechanism prevents data corruption

## 🎨 Customization

### Adding Languages
Edit the `LANGUAGES` array in:
- `/app/notes/new/page.tsx`
- `/app/notes/edit/[id]/page.tsx`

### Managing Categories
1. Navigate to `/categories` or click the settings icon in the sidebar
2. Create new categories with custom names, colors, and icons
3. Edit existing categories to change their appearance
4. Categories are now stored in SQLite database for better performance

### Themes
The app uses CSS variables for theming. Modify `/app/globals.css` to customize colors.

## 🎯 Recent Updates (December 2024)

- ✅ Unified layout between note creation and viewing modes
- ✅ Expanded content editor with improved UX (600px minimum height)
- ✅ Category icons now follow Shadcn design system
- ✅ SQLite database integration for better performance
- ✅ Enhanced AI assistant with code diff viewer
- ✅ Improved responsive design for mobile devices

## 📈 Future Improvements

- [ ] User accounts with multi-user support
- [ ] Note sharing and collaboration features
- [ ] Export to various formats (PDF, Markdown, JSON, etc.)
- [ ] Version history and revision tracking
- [ ] Code execution sandbox
- [ ] Browser extension for quick capture
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Integration with GitHub Gists
- [ ] Backup and sync to cloud services
- [ ] Code snippet marketplace
- [ ] Enhanced AI features (auto-tagging, smart categorization)
- [ ] Performance optimization with virtual scrolling
- [ ] Offline support with PWA

## 🚀 Performance

- Fast page loads with Next.js optimizations
- SQLite database for efficient data queries
- Lazy loading for code syntax highlighting
- Optimized bundle size with dynamic imports
- Production build serves static assets efficiently

## 🔧 Development

### Project Structure
```
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── layout/      # Layout components
│   ├── notes/       # Note-specific components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions and database
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

### Best Practices
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Keep components small and focused
- Use server components where possible

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is open source and available under the MIT License.