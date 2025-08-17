# Healthcare E-commerce Platform

A comprehensive healthcare e-commerce platform built with React, TypeScript, Node.js, and MongoDB. This platform provides medication sales, appointment booking, health news, and user management features.

## 🚀 Features

### Core E-commerce Features
- **Product Catalog**: Browse medications, medical devices, and health supplements
- **Shopping Cart**: Add items, manage quantities, and view cart
- **Order Processing**: Complete checkout with multiple payment methods
- **Order History**: Track order status and view past purchases
- **User Authentication**: Secure login/register with JWT tokens

### Healthcare Services
- **Appointment Booking**: Schedule medical appointments with different departments
- **Available Time Slots**: Real-time availability checking
- **Appointment Management**: View, update, and cancel appointments
- **Prescription Upload**: Upload prescription images during checkout

### Health Information
- **Health News**: Comprehensive health articles and medical information
- **News Categories**: Filter by nutrition, exercise, mental health, etc.
- **Featured Articles**: Highlighted health content
- **Search & Filter**: Find relevant health information quickly

### User Management
- **Profile Management**: Update personal information and profile picture
- **Address Management**: Save multiple delivery addresses
- **Payment Methods**: Manage preferred payment options
- **Order Tracking**: Real-time order status updates

### Payment Integration
- **Multiple Payment Methods**:
  - Cash on Delivery
  - Credit/Debit Cards
  - MoMo Wallet
  - ZaloPay
  - ShopeePay
  - Bank Transfer

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Database Models
- **User Model**: User profiles, addresses, payment preferences
- **Product Model**: Medication information, pricing, availability
- **Order Model**: Order processing, payment status, shipping
- **Appointment Model**: Booking system, time slots, departments
- **Health News Model**: Articles, categories, engagement metrics

## 📁 Project Structure

```
Health_Care_Product/
├── src/                          # Frontend source code
│   ├── components/               # Reusable React components
│   ├── context/                  # React Context providers
│   ├── pages/                    # Page components
│   ├── services/                 # API service functions
│   └── types/                    # TypeScript type definitions
├── controllers/                  # Backend route controllers
├── models/                       # MongoDB schemas
├── routes/                       # Express.js routes
├── middlewares/                  # Custom middleware functions
├── config/                       # Database and app configuration
└── utils/                        # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Health_Care_Product
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/healthcare
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start the development server**
   ```bash
   # Start backend server
   npm run dev
   
   # In another terminal, start frontend
   cd src && npm run dev
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/categories/all` - Get all product categories

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:orderId` - Get order details
- `PATCH /api/v1/orders/:orderId/cancel` - Cancel order

### Appointments
- `POST /api/v1/appointments` - Book appointment
- `GET /api/v1/appointments` - Get user appointments
- `GET /api/v1/appointments/available-slots` - Get available time slots
- `PUT /api/v1/appointments/:appointmentId` - Update appointment
- `PATCH /api/v1/appointments/:appointmentId/cancel` - Cancel appointment

### Health News
- `GET /api/v1/health-news` - Get all articles
- `GET /api/v1/health-news/featured` - Get featured articles
- `GET /api/v1/health-news/:slug` - Get article by slug
- `POST /api/v1/health-news/:id/like` - Like article

## 🎯 Key Features Implementation

### Order Processing
- Real-time cart management
- Multiple payment method support
- Prescription upload for prescription drugs
- Order status tracking
- Shipping address management

### Appointment System
- Department-based booking
- Time slot availability checking
- Priority levels (low, medium, high, emergency)
- Appointment status management
- Patient information tracking

### Health News Platform
- Article categorization
- Search and filter functionality
- Like and view tracking
- Featured articles system
- SEO-friendly URLs

### User Experience
- Responsive design for all devices
- Loading states and error handling
- Form validation
- Real-time updates
- Intuitive navigation

## 🔧 Configuration

### Database Setup
The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `products` - Product catalog
- `orders` - Order management
- `appointments` - Appointment bookings
- `healthnews` - Health articles

### Environment Variables
- `PORT` - Server port (default: 8080)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT token secret
- `NODE_ENV` - Environment (development/production)

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Vercel, or AWS

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a healthcare platform, so ensure all medical information and features comply with local healthcare regulations and standards.
