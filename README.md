# Pet Project Authorization

This is a pet project focused on implementing user authentication and authorization using Express.js. It provides basic functionality for user login, registration, and access control to different parts of the application.

## Features

- User login
- User registration
- Access control for different parts of the application
- Clearing cookies

## Technologies Used

- Node.js
- Express.js
- Body-parser
- Express-session
- Express-validator
- Redis (for session storage)
- Serve-favicon
- Cookie-parser

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/pet-project-auth.git
```

2. Install dependencies:

```bash
cd pet-project-auth
npm install
```

3. Start the application:

```bash
npm start
```

## Usage

1. Access the application at `http://localhost:8000`.
2. Navigate to the login page to authenticate yourself.
3. If you don't have an account, you can register.
4. After successful login, you can access the restricted parts of the application.
5. To log out, simply clear the cookies.

## API Endpoints

- `GET /`: Landing page
- `POST /`: User login
- `GET /registration`: Registration page
- `POST /registration`: User registration
- `GET /apanel`: Access control panel (restricted)
- `GET /clearCookie`: Clear cookies

## Contributors

- [Corner324](https://github.com/Corner324)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.



## How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

---

Feel free to contribute, report issues, or suggest improvements. Happy coding! 🚀