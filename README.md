# Samudra Ledger - Blue Carbon Registry

India's first transparent blue carbon registry powered by blockchain technology and AI-driven verification.

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── dashboards/      # Role-specific dashboard components
│   │   ├── BuyerDashboard/
│   │   ├── NCCRVerifier/
│   │   ├── ProjectManager/
│   │   └── PublicDashboard/
│   ├── AuthForm.tsx     # Authentication component
│   ├── LandingPage.tsx  # Landing page
│   ├── WalletConnect.tsx # Blockchain wallet integration
│   └── index.ts         # Component exports
├── hooks/               # Custom React hooks
│   └── useAuth.ts       # Authentication hook
├── services/            # Business logic and API calls
│   ├── api.ts          # Frontend API service
│   └── blockchain.ts   # Blockchain integration
├── config/              # Configuration files
│   └── supabase.ts     # Supabase client configuration
├── types/               # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/               # Utility functions
│   └── index.ts        # Helper functions
├── styles/              # Global styles
│   └── globals.css     # Tailwind CSS and custom styles
└── supabase/           # Supabase edge functions
    └── functions/
        └── make-server-a82c4acb/  # Backend API
```

## Features

- **Multi-role Authentication**: Project Managers, NCCR Verifiers, and Buyers
- **Blockchain Integration**: Avalanche network for transparent transactions
- **AI/ML Verification**: Automated project verification using machine learning
- **Carbon Credit Marketplace**: Purchase and retire verified carbon credits
- **Real-time Monitoring**: Track project status and verification progress

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Supabase Edge Functions (Deno/Hono)
- **Database**: Supabase with KV store
- **Blockchain**: Avalanche (Fuji Testnet)
- **Build Tool**: Vite

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application.

## User Roles

### Project Manager
- Register blue carbon restoration projects
- Submit MRV (Monitoring, Reporting, Verification) data
- Track project status and verification progress

### NCCR Verifier
- Review ML-processed MRV data
- Approve or reject carbon credit issuance
- Access comprehensive project analysis tools

### Buyer
- Browse and purchase verified carbon credits
- Retire credits for carbon offsetting
- View retirement certificates and history

## Development

The codebase follows clean architecture principles with clear separation of concerns:

- **Components**: Modular, reusable React components
- **Services**: Business logic and external API interactions
- **Hooks**: Reusable stateful logic
- **Types**: Centralized TypeScript definitions
- **Utils**: Pure utility functions

## Deployment

The application is designed to work with:
- **Frontend**: Any static hosting (Vercel, Netlify, etc.)
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL with KV store
- **Blockchain**: Avalanche network