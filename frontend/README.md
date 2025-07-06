# WFH Attendance Frontend

This is the frontend application for the WFH Attendance system with authentication.

## Features

- **Authentication System**: Login/logout functionality with JWT cookies
- **Protected Routes**: Dashboard is only accessible to authenticated users
- **Responsive Design**: Built with React Bootstrap for mobile-friendly interface
- **User Management**: Display user information and logout functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- The auth service running on localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will run on `http://localhost:3002`

### Authentication Flow

1. **Login**: Users must log in at `/login` with their email and password
2. **Authentication**: The system uses JWT cookies (`wfh-attendance-auth`) for session management
3. **Protected Routes**: Unauthenticated users are redirected to `/login`
4. **Logout**: Users can logout using the button in the navigation bar

### API Endpoints

The frontend communicates with the auth service at `http://localhost:3000`:

- `POST /auth/login` - User login
- `GET /auth/verify` - Verify authentication status
- `POST /auth/logout` - User logout

### Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx      # Login form component
│   └── dashboard/
│       └── Dashboard.tsx      # Main dashboard with logout
├── context/
│   └── AuthContext.tsx        # Authentication context provider
└── App.tsx                    # Main app with routing
```

## Available Scripts

- `npm start` - Runs the app in development mode on port 3002
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## Environment Variables

The app is configured to run on port 3002 by default. You can modify this in the `package.json` start script if needed.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
