<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# BRIO - Aviation-Focused Infotainment Platform

A comprehensive React-based infotainment system featuring aviation news, media streaming, productivity tools, security features, and more. Built with modern web technologies and designed for seamless user experience.

View your app in AI Studio: https://ai.studio/apps/df1248b6-187f-465b-a7cc-85ad24e331f2

## Features

### 📰 RSS News Reader (Aviation-Focused)
- **14 curated aviation news feeds** from industry-leading sources:
  - AeroRoutes, Aero-News, SamChui, Simple Flying
  - The Aviationist, AvGeekery, Australian Aviation
  - Ex-Yu Aviation News, General Aviation News
  - Airbus, Runway Girl Network, Aviation Pros
  - Aviation Today, Flight Global
- Real-time feed synchronization with 5-minute caching
- Category filtering (All, Aviation, World News)
- Save articles for later reading

### 🎵 Media Streaming Hub
- Nightcore music player with extensive library
- RSS reader with multi-source aggregation
- Media playback controls and playlist management

### ✈️ Aviation Telemetry (Hub5)
- Aviation-specific data and telemetry features
- Industry news and updates integration

### 🔐 Security Suite (Hub6)
- User authentication with Argon2id password hashing
- AES-256-GCM encrypted vault storage
- Session management with 30-day tokens
- Rate limiting for login/signup endpoints
- Account lockout protection

### 📊 Additional Hubs
- **Social Connect (Hub1)**: Social media integration
- **Productivity & Office (Hub4)**: Productivity tools
- **Arcade Games (Hub3)**: Entertainment features
- **Clock Suite**: Comprehensive time management widgets

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS 4, Motion for animations
- **Backend**: Express.js server with TypeScript
- **Database**: SQLite with WAL mode and LiteFS support
- **APIs**: Gemini AI integration, OpenWeatherMap
- **RSS Parsing**: rss-parser library
- **Security**: hash-wasm for Argon2id, crypto for AES encryption

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun package manager
- Gemini API key (for AI features)
- OpenWeatherMap API key (optional, for weather features)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Optional environment variables:
```env
PORT=3000
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Start Production Server

```bash
npm start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | TypeScript type checking |

## Project Structure

```
/workspace
├── server.ts                 # Express server entry point
├── server/                   # Server modules
│   ├── crypto.ts            # Encryption utilities
│   ├── db.ts                # Database operations
│   ├── errors.ts            # Error handling
│   └── rateLimit.ts         # Rate limiting middleware
├── src/
│   ├── App.tsx              # Main application component
│   ├── components/          # UI components organized by hub
│   │   ├── Hub1_ConnectSocial/
│   │   ├── Hub2_MediaStreaming/
│   │   ├── Hub3_ArcadeGames/
│   │   ├── Hub4_ProductivityOffice/
│   │   ├── Hub5_AviationTelemetry/
│   │   └── Hub6_Security/
│   ├── context/             # React context providers
│   ├── services/            # API and service layers
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
│       └── rssService.ts    # RSS feed processing
├── data/                    # SQLite database files
└── dist/                    # Production build output
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Resume session

### Vault (Encrypted Storage)
- `GET /api/vault/:username` - Retrieve encrypted vault
- `PUT /api/vault/:username` - Update encrypted vault

### Utilities
- `GET /api/health` - Server health check
- `GET /api/db-status` - Database status
- `GET /api/v1/health/db` - Detailed database telemetry
- `GET /api/proxy?url=` - RSS feed proxy (CORS bypass)
- `GET /api/weather?q=` - Weather data proxy

## Security Features

- **Password Hashing**: Argon2id with secure parameters
- **Data Encryption**: AES-256-GCM for vault storage
- **Session Management**: Secure token-based sessions
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Temporary lockout after failed attempts
- **Input Validation**: Comprehensive sanitization
- **CORS Protection**: Configured cross-origin policies

## RSS Feed Configuration

Aviation RSS feeds are configured in `src/utils/rssService.ts`:

```typescript
const AVIATION_RSS_URLS = [
  'https://www.aeroroutes.com/?format=rss',
  'https://www.aero-news.net/news/rssCOMANW.xml',
  'https://samchui.com/feed/',
  // ... 11 more aviation sources
];
```

The system uses:
- 5-minute cache TTL for performance
- Concurrent fetching (max 3 parallel requests)
- Automatic retry with alternative URLs
- Source attribution and categorization

## Deployment

### Docker Deployment

```bash
docker build -t brio-app .
docker run -p 3000:3000 --env-file .env.local brio-app
```

### Fly.io Deployment

Configuration included in `fly.toml`. Deploy with:

```bash
fly launch
fly deploy
```

LiteFS is configured for distributed SQLite replication.

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.

---

*Built with ❤️ using React, TypeScript, and modern web technologies*
