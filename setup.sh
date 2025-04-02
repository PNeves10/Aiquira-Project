#!/bin/bash

# Create necessary directories
mkdir -p backend/src/{config,controllers,middleware,models,routes,utils}
mkdir -p frontend/src/{components,hooks,pages,services,styles,utils}
mkdir -p ai-services/src/{models,routes,services,utils}

# Navigate to backend directory and install dependencies
cd backend
npm install express @types/express
npm install cors @types/cors
npm install helmet @types/helmet
npm install morgan @types/morgan
npm install dotenv @types/dotenv
npm install bcryptjs @types/bcryptjs
npm install jsonwebtoken @types/jsonwebtoken
npm install express-validator
npm install pg @types/pg
npm install mongoose @types/mongoose
npm install swagger-jsdoc @types/swagger-jsdoc
npm install swagger-ui-express @types/swagger-ui-express
npm install express-rate-limit
npm install winston @types/winston
npm install --save-dev typescript @types/node ts-node nodemon
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint

# Navigate to frontend directory and install dependencies
cd ../frontend
npm install next react react-dom
npm install @headlessui/react @heroicons/react
npm install @tanstack/react-query
npm install axios
npm install react-hook-form @hookform/resolvers zod
npm install next-auth
npm install next-i18next react-i18next
npm install tailwindcss postcss autoprefixer
npm install chart.js react-chartjs-2
npm install date-fns react-datepicker @types/react-datepicker
npm install react-dropzone
npm install react-hot-toast
npm install --save-dev typescript @types/node @types/react @types/react-dom
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint eslint-config-next

# Navigate to ai-services directory and install dependencies
cd ../ai-services
pip install -r requirements.txt

# Return to root directory
cd ..

# Create PostgreSQL database tables
cat << EOF > backend/src/config/init.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id),
    seller_id INTEGER REFERENCES users(id),
    buyer_id INTEGER REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    asset_id INTEGER REFERENCES assets(id),
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_valuations (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id),
    valuation_amount DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    factors JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
EOF

echo "Setup completed successfully!" 