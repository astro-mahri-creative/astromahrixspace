# Astro Command Center - Cosmic E-Commerce Platform

![Astro Command Center](/frontend/public/images/astro-command-center-banner.jpg)

A unique e-commerce platform that combines gaming mechanics with content unlocks, built for artist Astro Mahri's music and exclusive content distribution.

## Live Demo

- **Production Site**: [https://astromahri.space](https://astromahri.space)
- **Netlify Status**: [![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)

## Project Origin

This project was initially based on [Basir Jafarzadeh's Amazona e-commerce tutorial](https://github.com/basir/amazona), which provides an excellent foundation for MERN stack development. We've significantly modified and extended the original codebase to create a specialized platform for music distribution with integrated gaming mechanics.

## Unique Features

### Gaming-Based Content Unlocks

- **Frequency Match Game**: Audio-based puzzle game using Web Audio API
- **Achievement System**: Progressive unlocks based on game performance
- **Anonymous Gaming**: Play without account creation, optional login to save progress
- **Score-Based Access**: Exclusive content unlocks at specific score thresholds

### Artist-Focused E-Commerce

- **Music Streaming**: Always-available track previews
- **Digital Downloads**: High-quality music files and exclusive content
- **Dual Access Model**: Purchase immediately or unlock through gaming
- **Content Types**: Music releases, exclusive analysis episodes, future merchandise

### Cosmic Design System

- **Space Pilot Aesthetic**: Futuristic interface inspired by spacecraft controls
- **Custom Color Palette**: Razzmatazz, Byzantium, and cosmic accent colors
- **Interactive Elements**: Holographic effects, particle animations, cosmic lighting
- **Responsive Design**: Optimized for mobile gaming and desktop browsing

## Technology Stack

- **Frontend**: React 18, React Router v6, React Bootstrap
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT tokens, bcrypt password hashing
- **Payments**: Stripe integration for secure transactions
- **Gaming**: Web Audio API for frequency matching mechanics
- **Deployment**: Netlify with serverless functions
- **Database**: MongoDB Atlas (serverless tier)

## Current Product Catalog

1. **UNBOXXXED: Alpha EP** - Six-track cosmic hip-hop collection (Free streaming, $12 download)
2. **Earl's Extragalactic Analysis Collection** - Exclusive future music analysis content (Unlock via gaming or $15 purchase)

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Stripe test account
- Netlify CLI (for serverless development)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/astro-command-center.git
cd astro-command-center
```

2. **Install dependencies**

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..

# Install Netlify CLI globally
npm install -g netlify-cli
```

3. **Environment configuration**

Create `.env` in project root (for local development only) and set values in your deployment provider (Netlify) for production. Do NOT commit real secrets.

```bash
# Database
MONGODB_URI=<your-mongodb-uri>

# Authentication
JWT_SECRET=<set-in-netlify-dashboard>

# Payments
STRIPE_SECRET_KEY=<set-in-netlify-dashboard>

# PayPal (optional)
PAYPAL_CLIENT_ID=<optional-in-dashboard>

# Environment
NODE_ENV=development
```

Create `frontend/.env`:

```bash
REACT_APP_API_URL=http://localhost:8888
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
```

4. **Database seeding**

```bash
# Seed initial data (products and admin user)
npm run cosmic:setup
```

5. **Start development servers**

```bash
# Start Netlify dev environment (includes both frontend and functions)
netlify dev
```

The application will be available at:

- Frontend: `http://localhost:3000`
- API Functions: `http://localhost:8888/.netlify/functions/`

## Project Structure

```
astro-command-center/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── FrequencyMatch.js      # Game component
│   │   │   └── AchievementNotification.js
│   │   ├── screens/           # Page components
│   │   ├── utils/             # Frontend utilities
│   │   └── config/            # API configuration
├── netlify/functions/          # Serverless API functions
│   ├── api-products.js        # Product management
│   ├── api-game.js           # Gaming mechanics
│   ├── api-users.js          # User authentication
│   ├── models/               # Database models
│   └── utils/                # Backend utilities
├── backend/                   # Original Express server (for reference)
└── netlify.toml              # Netlify configuration
```

## Gaming System

### Frequency Match Mechanics

- **Objective**: Match target audio frequencies using slider controls
- **Scoring**: 20 points for perfect match (≤5Hz difference), scaling down to 0
- **Duration**: 30-second rounds with multiple frequency targets
- **Unlock Threshold**: 150+ points unlocks Earl's exclusive content collection

### Achievement Progression

- **Cosmic Cadet**: Score 100+ points (Entry level)
- **Frequency Master**: Score 150+ points (Unlocks content)
- **Dedicated Explorer**: Play 5+ games (Engagement reward)
- **Perfect Pitch**: Achieve 3+ perfect frequency matches (Skill recognition)

## API Endpoints

### Products

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)

### Gaming

- `POST /api/game/frequency-match` - Submit game score
- `GET /api/game/progress/:sessionId` - Get user progress
- `GET /api/game/unlock-status/:sessionId/:productId` - Check unlock status

### Users & Orders

- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## Deployment

### Netlify Configuration

The project uses Netlify for both frontend hosting and serverless functions. Deployment is automated via Git integration.

### Environment Variables (Production)

Set these in your Netlify dashboard under Site Settings > Environment Variables (do not commit secrets to the repo):

- `MONGODB_URI` (production database)
- `JWT_SECRET` (production secret)
- `STRIPE_SECRET_KEY` (live Stripe key)
- `NODE_ENV` with value `production`

### Domain Setup

Configure custom domain `astromahri.space` in Netlify dashboard with appropriate DNS settings.

## Development Scripts

```bash
# Local development with Netlify functions
npm run dev:netlify

# Build for production
npm run build:netlify

# Database management
npm run cosmic:setup        # Seed data
npm run data:destroy        # Clear data

# Legacy development (original Express server)
npm run cosmic:dev          # Run both Express and React
```

## Testing

### Game Functionality

- Test frequency matching across different browsers
- Verify achievement notifications
- Confirm unlock mechanics work correctly
- Validate score persistence

### E-commerce Flow

- Complete purchase process with test Stripe cards
- Verify order creation and fulfillment
- Test both guest and authenticated checkout flows

### Cross-browser Compatibility

- Chrome/Edge: Full Web Audio API support
- Firefox: Test audio context initialization
- Safari: Verify iOS compatibility for gaming
- Mobile: Touch interactions and responsive design

## Contributing

### Code Standards

- ESLint configuration for consistent code style
- React functional components with hooks
- MongoDB aggregation for complex queries
- Responsive design with React Bootstrap

### Content Updates

- Products managed through admin interface
- Achievement thresholds configurable in game constants
- Cosmic styling maintained through CSS custom properties

## Performance Considerations

- **Function Optimization**: Netlify functions use connection caching for MongoDB
- **Asset Optimization**: Images optimized for web, audio compressed for streaming
- **Bundle Splitting**: React lazy loading for game components
- **Caching Strategy**: Static assets cached with long expiration headers

## Security Features

- JWT token authentication with secure httpOnly cookies
- Input validation and sanitization for all user data
- CORS configuration for API security
- Stripe-hosted payment processing (no card data storage)
- Rate limiting on gaming endpoints to prevent abuse

## Known Limitations

- Single game implementation (frequency matching only)
- Web Audio API requires user interaction to initialize
- No real-time features (leaderboards, live notifications)
- Limited content management interface

## Future Roadmap

- Additional game mechanics (Star Navigation, Circuit Building)
- Real-time leaderboards with WebSocket integration
- Advanced achievement system with social sharing
- Mobile app development with Capacitor
- Multi-artist platform expansion

## Support

- **Documentation**: [Project Wiki](https://github.com/your-username/astro-command-center/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/astro-command-center/issues)
- **Contact**: [astromahri.space/contact](https://astromahri.space/contact)

## License

This project is based on the original Amazona tutorial by Basir Jafarzadeh and has been extensively modified for artist-specific use. Please respect the original educational nature of the base code while acknowledging the significant customizations for this unique gaming-commerce platform.

## Acknowledgments

- **Original Tutorial**: [Basir Jafarzadeh's Amazona Tutorial](https://github.com/basir/amazona)
- **Design Inspiration**: Astro Mahri's cosmic aesthetic and Future Hooman philosophy
- **Gaming Concept**: Integration of Web Audio API for educational music interaction
- **Community**: Open source contributors and the MERN stack ecosystem
