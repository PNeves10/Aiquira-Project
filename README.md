# AIQuira - AI-Powered Asset Management Platform

AIQuira is a modern asset management platform that leverages artificial intelligence to provide intelligent insights, predictive analytics, and automated due diligence for asset transactions.

## Features

### 1. Predictive Valuation Analysis
- Real-time market value predictions using machine learning models
- Historical price trend analysis with confidence scoring
- Key factor impact analysis and visualization
- Interactive market trend charts with historical and predicted values
- Confidence-based recommendations for buy/sell decisions

### 2. Intelligent Matching System
- Smart matching between buyers and sellers based on preferences
- Similarity scoring with detailed factor analysis
- Bar chart visualization of matching factors
- Comparable asset recommendations
- Match confidence scoring
- Automated recommendations based on match quality

### 3. Automated Due Diligence
- Document analysis and verification
- Risk assessment and scoring
- Radar chart visualization of due diligence metrics
- Compliance checking
- Financial health analysis
- Market position evaluation
- Competitor analysis
- Automated report generation

## Technical Stack

### Frontend
- Next.js 13 with TypeScript
- React Query for data fetching
- Chart.js for data visualization
  - Line charts for market trends
  - Bar charts for matching analysis
  - Radar charts for due diligence metrics
- Framer Motion for animations
- Tailwind CSS for styling

### Backend
- Python with FastAPI
- Machine Learning models for predictions
- Document processing with OCR
- Natural Language Processing for text analysis

## Getting Started

### Prerequisites
- Node.js 18.x or later
- Python 3.9 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aiquira.git
cd aiquira
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/aiquira
OPENAI_API_KEY=your_openai_api_key
```

5. Start the development servers:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
uvicorn main:app --reload
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

## Visualization Components

### MarketTrendsChart
- Displays historical price trends
- Shows predicted future values
- Includes confidence intervals
- Interactive tooltips with detailed information

### MatchingScoreChart
- Bar chart visualization of matching factors
- Overall match score display
- Confidence level indicators
- Detailed factor explanations

### DueDiligenceChart
- Radar chart for comprehensive assessment
- Risk, compliance, and financial health metrics
- Issue tracking and reporting
- Overall health score calculation

## Portuguese Market Integration

The platform includes specialized features for the Portuguese real estate market:

### Compliance and Regulations
- Integration with Portuguese property registry systems
- Notary document verification and tracking
- Cadastral data validation
- IMI (Municipal Property Tax) status monitoring
- Compliance with Portuguese real estate regulations

### Local System Integrations
- Property Registry (Registo Predial)
- Cadastral System (Cadastro)
- Notary System (Notários)
- Tax Authority (Autoridade Tributária)

### Required Documents
- Property Registry Certificate
- Notary Deed
- Cadastral Certificate
- IMI Payment Receipt
- Energy Certificate
- Technical Data Sheet

### Market-Specific Features
- Portuguese property valuation methods
- Local market trend analysis
- Regional compliance requirements
- Portuguese legal framework integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the GPT models used in analysis
- Chart.js for the visualization library
- The open-source community for various tools and libraries used in this project

## Support

For support, email support@aiquira.com or join our Slack channel. 