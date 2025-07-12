# SubTracker Pro

A comprehensive subscription and warranty management application built with React, Express.js, and PostgreSQL. Track your subscriptions, manage warranties, and receive timely reminders for renewals and expirations.

## 🌟 Features

### Core Functionality
- **Phone-based OTP Authentication** - Secure login using phone number verification
- **Subscription Management** - Track recurring services, billing cycles, and renewal dates
- **Enhanced Warranty Tracking** - Complete warranty management with vendor information, documents, and claim tracking
- **Smart Reminders** - Configurable notifications via email, SMS, and push notifications
- **Dashboard Analytics** - Overview of active subscriptions, monthly spending, and upcoming renewals

### Advanced Features
- **Theme System** - Dark/light mode with seamless switching
- **Bulk Operations** - Multi-select and batch actions for efficient management
- **Advanced Search** - Comprehensive filtering with multiple criteria
- **Data Backup & Restore** - Export/import functionality for data protection
- **Warranty Claims Management** - Track claims, vendor responses, and resolutions
- **Transfer Capabilities** - Warranty transfer functionality with documentation

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Zustand** for client state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for database operations
- **PostgreSQL** via Neon Database
- **SendGrid** for email notifications
- **SMS Service** integration ready

### Development Tools
- **Hot Module Replacement** via Vite
- **ESBuild** for production builds
- **Drizzle Kit** for database migrations
- **TypeScript** for full-stack type safety

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon Database recommended)
- SendGrid API key (optional, for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd subtracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Database connection
   DATABASE_URL=your_postgresql_connection_string
   
   # Email notifications (optional)
   SENDGRID_API_KEY=your_sendgrid_api_key
   
   # Automatically configured by Replit/Neon:
   PGHOST=your_pg_host
   PGPORT=your_pg_port
   PGUSER=your_pg_user
   PGPASSWORD=your_pg_password
   PGDATABASE=your_pg_database
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   ├── pages/          # Application pages/routes
│   │   └── App.tsx         # Main application component
├── server/                 # Express backend
│   ├── services/           # Business logic services
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data access layer
│   └── db.ts               # Database configuration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle schemas and types
└── components.json         # Shadcn/ui configuration
```

## 🔐 Authentication System

### Phone-based OTP Flow
1. **Request OTP**: User enters phone number
2. **Generate OTP**: Server generates 6-digit code (logged to console in development)
3. **Verify OTP**: User enters OTP for verification
4. **User Creation**: Automatic user creation/retrieval based on phone number
5. **Session Management**: Persistent authentication via Zustand with localStorage

### Development Mode
- OTPs are logged to the server console
- Any 6-digit code is accepted for testing
- 5-minute OTP expiration for security

## 📊 Data Models

### Core Entities
- **Users**: Phone number, verification status, profile information
- **Subscriptions**: Service details, billing cycles, renewal dates, categories
- **Warranties**: Product info, vendor details, purchase/expiration dates, documents
- **Reminders**: Configurable notifications with multiple delivery methods
- **Warranty Claims**: Claim tracking, vendor communication, resolution status

### Database Schema
All schemas are defined in `shared/schema.ts` using Drizzle ORM with proper relationships and type safety.

## 🔔 Notification System

### Supported Channels
- **Email**: SendGrid integration for email notifications
- **SMS**: Service integration ready (currently logs to console)
- **Push**: Browser notifications for in-app alerts

### Reminder Configuration
- **Customizable Intervals**: 7, 3, 1 days before expiration (configurable)
- **Smart Scheduling**: Automatic reminder creation for subscriptions and warranties
- **Notification History**: Track sent notifications and delivery status

## 🎨 UI/UX Features

### Theme System
- **Dark/Light Mode**: Seamless theme switching
- **CSS Custom Properties**: Consistent color system
- **Persistent Preferences**: Theme choice saved across sessions

### Advanced Interactions
- **Bulk Operations**: Multi-select with batch actions
- **Advanced Search**: Multi-field filtering with operators
- **Data Management**: Backup/restore functionality
- **Responsive Design**: Mobile-first approach

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server with hot reloading

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (if configured)

# Production
npm run build        # Build for production
npm start           # Start production server
```

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Atomic design principles

### Testing
- **Authentication Flow**: OTP generation and verification
- **CRUD Operations**: Full data management testing
- **UI Components**: Component functionality verification

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Ensure all environment variables are configured
- Database should be accessible from production environment
- SendGrid API key required for email notifications

### Replit Deployment
This project is optimized for Replit deployment with:
- Automatic environment variable configuration
- Integrated database provisioning
- One-click deployment setup

## 📈 Performance Optimizations

### Frontend
- **Code Splitting**: Dynamic imports for route-based splitting
- **Query Caching**: TanStack Query for efficient data fetching
- **Bundle Optimization**: Vite's automatic optimizations

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Query result caching where appropriate

## 🔒 Security Features

### Authentication
- **OTP Verification**: Time-limited one-time passwords
- **Session Management**: Secure token-based authentication
- **Phone Verification**: Required phone number verification

### Data Protection
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **CORS Configuration**: Proper cross-origin request handling

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use semantic commit messages
- Ensure all tests pass
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
- **Authentication Problems**: Check OTP in server console logs
- **Database Errors**: Verify DATABASE_URL and run `npm run db:push`
- **Email Notifications**: Ensure SENDGRID_API_KEY is configured

### Getting Help
- Check the server console for detailed error logs
- Review the authentication flow in development mode
- Ensure all environment variables are properly set

## 🎯 Roadmap

### Planned Features
- **Mobile App**: React Native companion app
- **API Integrations**: Automatic subscription detection
- **Analytics Dashboard**: Usage patterns and insights
- **Team Collaboration**: Shared warranty management
- **Advanced Reporting**: Export capabilities and insights

---

Built with ❤️ using modern web technologies for efficient subscription and warranty management.
