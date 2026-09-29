# TakeHome Financial Assistant - Frontend

A modern, responsive React-based chat interface for the TakeHome Financial Wellness Assistant. This UI connects to the enhanced chatbot backend to provide users with intelligent financial insights, bill management, and paycheck information.

## Features

- **Modern Chat Interface**: Clean, intuitive design with smooth animations
- **Real-time Messaging**: Instant responses from the AI assistant
- **Smart Suggestions**: Context-aware question suggestions after each response
- **Technical Transparency**: Expandable sections showing executed SQL queries and raw data
- **Source Attribution**: Clear indication of whether responses come from Database or Knowledge Base
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages with helpful suggestions

## Technology Stack

- **React 19.2.4**: Modern React with hooks
- **Vite 8.0.4**: Fast build tool and dev server
- **CSS3**: Custom styling with animations and transitions
- **Fetch API**: For backend communication

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8002`

## Installation

1. Navigate to the UI directory:
```bash
cd takehome-chatbot
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Backend Integration

The frontend connects to the backend API at `http://localhost:8002/chat`.

### API Request Format

```json
{
  "message": "What are my total bills?"
}
```

### API Response Format

```json
{
  "status": "success",
  "bot_response": "Your total bills are $1,234.56...",
  "suggested_questions": ["When is my next paycheck?", "Show me overdue bills"],
  "citations": [],
  "executed_sql": "SELECT total_bills_amount FROM snapshot_summary...",
  "raw_data": [{"total_bills_amount": 1234.56}]
}
```

## Features Breakdown

### 1. Chat Interface

- **Message History**: Scrollable conversation history
- **User/Bot Avatars**: Visual distinction between user and bot messages
- **Typing Indicator**: Animated dots while waiting for response
- **Auto-scroll**: Automatically scrolls to latest message

### 2. Smart Suggestions

After each bot response, users see contextual suggestions like:
- "What are my total bills?"
- "When is my next paycheck?"
- "What is my TDI?"
- "Show me overdue bills"

Clicking a suggestion sends it as a message automatically.

### 3. Technical Details (New Feature)

For database queries, users can expand a "Show Technical Details" section to see:
- **Executed SQL Query**: The actual SQL query that was run
- **Raw Data**: The JSON response from the database

This provides transparency and helps users understand how their data is being accessed.

### 4. Source Attribution

Each bot response shows whether it came from:
- **Database**: Direct query to financial data
- **Knowledge Base**: General financial knowledge from PDFs

### 5. Error Handling

- Connection errors show helpful messages
- Failed requests provide alternative suggestions
- Backend errors are handled gracefully

## Customization

### Changing the Backend URL

Edit `src/App.jsx` and update the fetch URL:

```javascript
const response = await fetch('http://your-backend-url:port/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: textToSend })
});
```

### Styling

All styles are in `src/App.css`. Key customization points:

- **Colors**: Update color values in CSS variables
- **Layout**: Modify `.chat-window` max-width and height
- **Animations**: Adjust animation durations and easing functions
- **Typography**: Change font families and sizes

### Initial Suggestions

Edit the initial bot message in `src/App.jsx`:

```javascript
const [messages, setMessages] = useState([
  { 
    sender: 'bot', 
    text: 'Your custom welcome message',
    suggestions: [
      "Custom suggestion 1",
      "Custom suggestion 2",
      "Custom suggestion 3"
    ]
  }
]);
```

## Project Structure

```
takehome-chatbot/
├── public/
│   ├── favicon.svg          # App icon
│   └── icons.svg            # SVG icons
├── src/
│   ├── assets/              # Static assets
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── index.css            # Global styles
│   └── main.jsx             # Application entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Backend Connection Issues

**Problem**: "Error connecting to the server"

**Solution**:
1. Verify backend is running: `python main.py` in the backend directory
2. Check backend is on port 8002: `http://localhost:8002`
3. Verify CORS is enabled in backend (already configured)

### Port Already in Use

**Problem**: Vite can't start because port 5173 is in use

**Solution**:
```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Build Errors

**Problem**: Build fails with dependency errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Hot Reload

Vite provides instant hot module replacement (HMR). Changes to React components will update in the browser without losing state.

### React DevTools

Install React DevTools browser extension for debugging:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Console Logging

The app logs connection errors to the console. Open browser DevTools (F12) to see detailed error messages.

## Performance

- **Initial Load**: ~50KB gzipped (production build)
- **API Response Time**: Depends on backend (typically 1-3 seconds)
- **Animations**: 60fps smooth animations using CSS transforms

## Security

- **No Sensitive Data Storage**: Messages are not persisted locally
- **HTTPS Ready**: Works with HTTPS backends (update URL)
- **XSS Protection**: React automatically escapes user input
- **CORS**: Backend must have CORS enabled (already configured)

## Future Enhancements

Potential improvements for future versions:

1. **Message Persistence**: Save conversation history to localStorage
2. **Dark Mode**: Toggle between light and dark themes
3. **Voice Input**: Speech-to-text for hands-free interaction
4. **Export Chat**: Download conversation as PDF or text
5. **Multi-language Support**: Internationalization (i18n)
6. **Typing Indicators**: Show when bot is "typing"
7. **Message Reactions**: Like/dislike responses for feedback
8. **File Upload**: Upload financial documents for analysis

## Contributing

When making changes:

1. Follow React best practices
2. Maintain consistent code style
3. Test on multiple browsers
4. Update this README if adding features
5. Ensure backward compatibility with backend API

## License

[Your License Here]

## Support

For issues or questions:
- Check the troubleshooting section above
- Review backend logs for API errors
- Verify environment variables are set correctly
- Ensure database is accessible

---

**Last Updated**: 2024
**Version**: 1.0.0
**Backend Compatibility**: Enhanced Chatbot Schema Intelligence v1.0
#   c h a t b o t U I  
 