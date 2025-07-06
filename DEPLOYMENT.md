# 🚀 Arzuma Project Deployment Guide

## 📋 Prerequisites

- Hostinger VPS with root access
- Domain name (optional but recommended)
- Basic knowledge of Linux commands

## 🛠️ Step-by-Step Deployment

### 1. Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2. Update System

```bash
apt update && apt upgrade -y
```

### 3. Install Docker

```bash
# Install required packages
apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update and install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Start Docker
systemctl enable --now docker
```

### 4. Install Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 5. Upload Project Files

#### Option A: Using Git

```bash
cd /root
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git arzuma
cd arzuma
```

#### Option B: Using SCP (from local machine)

```bash
scp -r /path/to/your/arzuma root@YOUR_VPS_IP:/root/
```

### 6. Configure Environment

```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit environment file
nano backend/.env
```

Update the following values in `backend/.env`:

- `SECRET_KEY`: Generate a new secret key
- `ALLOWED_HOSTS`: Add your domain and VPS IP
- Database credentials (if you want to change defaults)

### 7. Deploy the Application

#### Option A: Using Setup Script (Recommended)

```bash
chmod +x setup.sh
./setup.sh
```

#### Option B: Manual Deployment

```bash
# Build and start containers
docker-compose up --build -d

# Wait for services to be ready
sleep 30

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

### 8. Configure Domain (Optional)

1. Go to Hostinger control panel
2. Navigate to your domain's DNS settings
3. Add/update A records:

   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP
   TTL: 3600

   Type: A
   Name: www
   Value: YOUR_VPS_IP
   TTL: 3600
   ```

### 9. Test the Application

```bash
# Check if containers are running
docker-compose ps

# Test the application
curl http://YOUR_VPS_IP
```

## 🔧 Services Overview

- **PostgreSQL**: Database server (port 5432)
- **Redis**: Cache and WebSocket support (port 6379)
- **Backend**: Django application (port 8000)
- **Frontend**: React application (port 80)
- **Nginx**: Reverse proxy (port 80)

## 📊 Useful Commands

### Check Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Maintenance

```bash
# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update application
git pull
docker-compose up --build -d
```

### Database Operations

```bash
# Create database backup
docker-compose exec backend python manage.py dumpdata > backup.json

# Restore database
docker-compose exec backend python manage.py loaddata backup.json

# Access PostgreSQL
docker-compose exec postgres psql -U arzuma_user -d arzuma_db
```

### Troubleshooting

```bash
# Rebuild containers from scratch
docker-compose down
docker system prune -a
docker-compose up --build -d

# Check disk usage
df -h

# Check memory usage
free -h
```

## 🔒 Security Considerations

1. **Change default passwords** in `.env` file
2. **Use strong SECRET_KEY**
3. **Enable HTTPS** with Let's Encrypt
4. **Regular backups** of database and media files
5. **Keep system updated**

## 📞 Support

If you encounter any issues:

1. Check container logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all ports are accessible
4. Check DNS propagation if using domain

## 🎉 Success!

Your Arzuma application should now be running successfully on your Hostinger VPS with PostgreSQL database!
