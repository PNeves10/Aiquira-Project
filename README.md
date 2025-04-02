# AIQuira - AI-Powered M&A Platform

AIQuira is a modern M&A platform that leverages artificial intelligence to provide intelligent asset valuation, document analysis, and market insights.

## Features

- 🤖 AI-powered asset valuation
- 📄 Intelligent document analysis
- 📊 Market trend analysis
- 🔒 Secure authentication and authorization
- 📱 Responsive web interface
- 🌐 RESTful API
- 📈 Real-time analytics
- 🔍 Advanced search and filtering

## Tech Stack

### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- React Query
- Storybook
- Jest & Playwright for testing

### Backend
- FastAPI
- Python 3.9+
- OpenAI GPT-4
- JWT Authentication
- PostgreSQL
- Redis
- Celery
- Sentry for error tracking

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL
- Redis
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aiquira.git
cd aiquira
```

2. Set up the backend:
```bash
cd ai-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the frontend:
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

1. Start the backend server:
```bash
cd ai-services
uvicorn src.app:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Start Storybook:
```bash
cd frontend
npm run storybook
```

### Testing

1. Run backend tests:
```bash
cd ai-services
pytest
```

2. Run frontend tests:
```bash
cd frontend
npm test
```

3. Run end-to-end tests:
```bash
cd frontend
npm run test:e2e
```

## API Documentation

The API documentation is available at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`
- OpenAPI JSON: `http://localhost:8000/api/openapi.json`

## Component Documentation

Component documentation is available in Storybook:
```bash
cd frontend
npm run storybook
```

## Security

- JWT-based authentication
- Rate limiting
- CORS protection
- Security headers
- Input validation
- Request size limits
- XSS protection
- CSRF protection

## Monitoring

- Sentry for error tracking
- Custom logging
- Performance monitoring
- Request tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for GPT-4
- FastAPI team for the amazing framework
- Next.js team for the React framework
- All contributors and maintainers

## Support

For support, email support@aiquira.com or join our Slack channel. 