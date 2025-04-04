# MixTrip - Travel Route Planning Application

A web application that allows users to create, share, and explore travel routes. Users can create detailed trip itineraries, share them with friends, and remix routes created by other users to customize them for their own travels.

## Features

- User authentication (register, login, profile management)
- Create detailed travel itineraries with daily activities
- Share trips publicly or keep them private
- Remix/fork trips from other users
- Comment on trips
- Search and explore trips created by the community
- Follow other users
- Interactive maps with Google Maps API integration

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript, EJS templates
- **Authentication**: JWT, Passport.js
- **Maps**: Google Maps API
- **Other Tools**: Mongoose, bcrypt, multer, etc.

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/witoonp/mixtrip.git
   cd mixtrip
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   SESSION_SECRET=your_session_secret
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the application
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

## Project Structure

```
mixtrip/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── public/         # Static assets
│   │   ├── css/        # Stylesheets
│   │   ├── js/         # JavaScript files
│   │   └── images/     # Images
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── views/          # EJS templates
│       ├── layouts/    # Layout templates
│       └── partials/   # Reusable components
└── index.js            # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/password` - Update password
- `GET /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `GET /api/users/:id/trips` - Get a user's trips
- `PUT /api/users/:id/follow` - Follow a user
- `PUT /api/users/:id/unfollow` - Unfollow a user

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get a specific trip
- `POST /api/trips` - Create a new trip
- `PUT /api/trips/:id` - Update a trip
- `DELETE /api/trips/:id` - Delete a trip
- `POST /api/trips/:id/fork` - Fork/remix a trip
- `PUT /api/trips/:id/like` - Like a trip
- `PUT /api/trips/:id/unlike` - Unlike a trip

### Comments
- `GET /api/trips/:id/comments` - Get comments for a trip
- `POST /api/trips/:id/comments` - Add a comment to a trip
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment
- `PUT /api/comments/:id/like` - Like a comment
- `PUT /api/comments/:id/unlike` - Unlike a comment

## License

MIT
