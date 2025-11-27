# VeriFlow Solutions

A Power Platform-style document verification application prototype built for the jimfolio monorepo. VeriFlow Solutions demonstrates a complete document verification workflow with team member and management interfaces.

## Company Overview

**VeriFlow Solutions** is a fictional document verification company that provides authentication services for customer-submitted documents. The application showcases modern web development practices using Next.js, Prisma, and Power Platform-inspired UI design.

## Features

### Team Member Functionality
- **Check Requests**: Submit new document verification requests
- **Check Management**: View and update verification status with color-coded results
- **Personal Dashboard**: Track daily progress against benchmarks
- **Time Tracking**: Log productive vs non-productive work hours
- **Result Recording**: Mark checks as Genuine, Inconclusive, False, or Unable to Verify

### Management Functionality
- **Team Oversight**: Monitor individual and team performance metrics
- **Staff Planning**: Track daily benchmarks (10 checks/day) with productivity adjustments
- **Capacity Forecasting**: Plan staffing levels for the next 30 days
- **Performance Analytics**: Visual charts and reports on throughput and results
- **Productivity Reporting**: Analyze productive vs non-productive time breakdowns

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Prisma ORM with SQLite (for prototype)
- **Styling**: TailwindCSS with Power Platform/Fluent UI design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout

## Project Structure

```
apps/veriflow/
├── app/
│   ├── (team)/                    # Team member routes
│   │   ├── dashboard/            # Personal dashboard
│   │   ├── request-check/        # New check request form
│   │   └── my-checks/            # User's verification checks
│   ├── (management)/             # Management routes
│   │   ├── team-overview/        # Team performance overview
│   │   ├── staff-planning/       # Staff productivity planning
│   │   └── capacity-forecast/    # Capacity forecasting
│   ├── api/                      # API routes
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                       # Power Platform styled components
│   ├── forms/                    # Form components
│   ├── charts/                   # Chart components
│   └── tables/                   # Data table components
├── lib/
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Utility functions
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.js                  # Sample data
└── public/
```

## Data Model

### Core Entities

- **StaffMember**: User accounts with roles and activity status
- **VerificationCheck**: Document verification requests with status tracking
- **DailyProductivity**: Daily time tracking and benchmark adjustments
- **CapacityForecast**: Future capacity planning and projections

### Verification Results

- **GENUINE** (Green #107C10): Document verified as authentic
- **INCONCLUSIVE** (Orange #CA5010): Unable to definitively verify
- **FALSE** (Red #D13438): Document identified as fraudulent
- **UNABLE_TO_VERIFY** (Gray #605E5C): Technical issues preventing verification

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the app directory:
```bash
cd apps/veriflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

### Team Member
- Access to personal dashboard and check management
- Can request new verification checks
- Track personal productivity and time
- View assigned checks and update results

### Manager
- All team member permissions
- View team performance metrics
- Monitor staff productivity against benchmarks
- Access basic capacity planning tools

### Senior Manager
- All manager permissions
- Advanced capacity forecasting
- 30-day planning and staffing projections
- Strategic analytics and reporting

## Testing the App

After starting the development server, you can test the following workflows:

### Team Member Workflow
1. Navigate to `http://localhost:3000/team/dashboard`
2. Click "Request New Check" to create a verification request
3. Fill out the form with customer details and submit
4. Go to "My Checks" to view your submitted requests
5. Use search and filter functionality to find specific checks

### Management Workflow
1. Navigate to `http://localhost:3000/management/team-overview`
2. View team performance metrics and analytics charts
3. Go to "Staff Planning" to see individual productivity trends
4. Visit "Capacity Forecast" to plan future staffing levels
5. Use the "Update Staffing" button to modify capacity forecasts

### Sample Data
The database is pre-seeded with:
- 5 staff members (3 team members, 1 manager, 1 senior manager)
- Sample verification checks with various statuses
- 30 days of capacity forecasts
- Daily productivity records

### API Endpoints
- `GET /api/checks` - List all verification checks
- `POST /api/checks` - Create new verification check
- `GET /api/analytics` - Get team analytics data
- `GET /api/staff-planning` - Get staff planning data
- `POST /api/staff-planning` - Update productivity records
- `GET /api/capacity-forecast` - Get capacity forecast data
- `POST /api/capacity-forecast` - Update staffing forecasts

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with sample data

### Power Platform Styling

The application follows Microsoft Power Platform design patterns:
- Fluent UI color scheme and typography
- Card-based layouts with consistent spacing
- Semantic color coding for status indicators
- Responsive grid systems
- Accessible form components

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## Deployment

This app is designed to deploy to Vercel or similar Next.js hosting platforms. The database can be migrated to PostgreSQL for production use.

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Maintain Power Platform UI consistency
4. Add appropriate tests for new features
5. Update documentation for significant changes

## License

This project is part of the jimfolio monorepo.
