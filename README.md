# Puppet - Resume Tailoring Application

A full-stack application that helps users tailor their resumes using AI and LinkedIn integration.

## Project Structure

```
puppet/
├── backend/         # Node.js + Express backend
└── frontend/        # React + Vite frontend
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- LinkedIn Developer Account (for LinkedIn integration)
- Environment variables properly configured

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=your_linkedin_callback_url
```

### Frontend (.env)
```
VITE_API_URL=your_backend_api_url
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
```

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Start the development servers:
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm run dev
   ```

## Deployment to Render

This application is configured for deployment on Render as a single web service.

### Deployment Steps

1. Push your code to a Git repository
2. Create a new Web Service on Render
3. Connect your repository
4. Use the following settings:
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment Variables: Add all required environment variables in Render dashboard

### Important Notes

- The application uses a disk volume for file uploads
- Frontend is built and served through the backend in production
- CORS is configured to allow only specific origins in production
- Make sure to set all environment variables in Render dashboard

## Features

- User authentication
- LinkedIn integration
- Resume upload and management
- AI-powered resume tailoring
- PDF parsing and text extraction

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 