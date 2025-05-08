# Expense Tracker

A full-stack web application for tracking personal expenses and budgets. Built with Node.js, Express, MySQL, and vanilla JavaScript.

## Features

- User authentication and authorization
- Track expenses with categories and payment methods
- Set and manage monthly budgets
- View expense trends and category-wise breakdown
- Dashboard with summary cards and charts
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Chart.js

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd expense-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=expense_tracker
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. Create the database and tables:
   ```bash
   mysql -u your_username -p < db/schema.sql
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open `http://localhost:3000` in your browser

## Project Structure

```
expense-tracker/
├── public/             # Frontend files
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── *.html         # HTML pages
├── routes/            # Express routes
├── db/               # Database configuration and schema
├── middleware/       # Custom middleware
├── .env             # Environment variables
├── .gitignore       # Git ignore file
├── package.json     # Project dependencies
└── server.js        # Entry point
```

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user

### Expenses
- GET `/expenses` - Get all expenses
- POST `/expenses` - Add new expense
- DELETE `/expenses/:id` - Delete expense

### Budgets
- GET `/budgets` - Get all budgets
- POST `/budgets` - Add new budget
- DELETE `/budgets/:id` - Delete budget

### Categories
- GET `/categories` - Get all categories
- POST `/categories` - Add new category
- DELETE `/categories/:id` - Delete category

### Payment Methods
- GET `/payment-methods` - Get all payment methods
- POST `/payment-methods` - Add new payment method
- DELETE `/payment-methods/:id` - Delete payment method

### Summary
- GET `/summary/dashboard` - Get dashboard summary
- GET `/summary` - Get monthly summary

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 