#!/bin/bash

echo "🚀 Starting Arzuma Project Setup..."

# Create .env file from example if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp backend/env.example backend/.env
    echo "✅ .env file created. Please edit it with your specific values."
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser (optional)
echo "👤 Do you want to create a superuser? (y/n)"
read -r create_superuser
if [ "$create_superuser" = "y" ] || [ "$create_superuser" = "Y" ]; then
    docker-compose exec backend python manage.py createsuperuser
fi

echo "✅ Setup completed successfully!"
echo "🌐 Your application should be available at: http://YOUR_VPS_IP"
echo "📊 Check container status with: docker-compose ps"
echo "📋 View logs with: docker-compose logs -f" 