#!/bin/bash
echo "🚀 Setting up Astro Command Center for development..."

# Install concurrently for running both servers
npm install -g concurrently

# Install nodemon for backend development
npm install -g nodemon

# Setup database with initial data
echo "📦 Seeding database with cosmic data..."
npm run cosmic:setup

echo "✨ Setup complete! Run 'npm run cosmic:dev' to start development servers"