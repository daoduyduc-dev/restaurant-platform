# 🚀 Deployment Guide

Complete guide to deploy the Restaurant Platform to production.

## Prerequisites Checklist

- [ ] Java 21 installed and configured
- [ ] PostgreSQL 12+ installed
- [ ] Node.js 18+ installed
- [ ] Git repository cloned
- [ ] All environment variables configured
- [ ] SSL certificate ready (if needed)
- [ ] Backup strategy planned

## Phase 1: Environment Preparation

### 1.1 Production Database Setup

```sql
-- Connect to PostgreSQL as admin
psql -U postgres -d postgres

-- Create database
CREATE DATABASE restaurant_db_prod;

-- Create dedicated user
CREATE USER restaurant_admin WITH PASSWORD 'your_very_secure_password_32_chars_min';

-- Grant privileges
ALTER USER restaurant_admin CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE restaurant_db_prod TO restaurant_admin;

-- Connect to new database
\c restaurant_db_prod

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO restaurant_admin;
```

### 1.2 Server Configuration

```bash
# Linux/Ubuntu Example
sudo apt-get update
sudo apt-get install -y openjdk-21-jdk-headless postgresql postgresql-contrib nginx

# Create application user
sudo useradd -m -s /bin/bash restaurant-user
sudo usermod -aG sudo restaurant-user

# Create application directories
sudo mkdir -p /opt/restaurant-platform
sudo mkdir -p /var/log/restaurant-platform
sudo mkdir -p /opt/restaurant-platform/config
sudo mkdir -p /opt/restaurant-platform/uploads

# Set permissions
sudo chown -R restaurant-user:restaurant-user /opt/restaurant-platform
sudo chown -R restaurant-user:restaurant-user /var/log/restaurant-platform
sudo chmod 750 /opt/restaurant-platform
```

## Phase 2: Application Configuration

### 2.1 Backend Configuration File

Create `/opt/restaurant-platform/config/application-prod.properties`:

```properties
# ============================
# Production Configuration
# ============================

# Server
server.port=8080
server.servlet.context-path=/api
server.compression.enabled=true
server.compression.min-response-size=1024
server.tomcat.max-connections=1000
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=10

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/restaurant_db_prod
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL10Dialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.generate_statistics=false
spring.jpa.show-sql=false

# Mail (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
spring.mail.from=${MAIL_FROM:noreply@restaurant-platform.local}

# JWT Security
jwt.secret=${JWT_SECRET}
jwt.access-token-expiry=900000
jwt.refresh-token-expiry=604800000

# CORS
cors.allowed-origins=https://your-domain.com,https://app.your-domain.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.max-age=3600

# Logging
logging.level.root=WARN
logging.level.com.restaurant.platform=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.file.name=/var/log/restaurant-platform/app.log
logging.file.max-size=10MB
logging.file.max-history=30

# Application
app.frontend.url=https://app.your-domain.com
app.name=Restaurant Platform
app.version=1.0.0

# Actuator (Health Checks)
management.endpoints.web.exposure.include=health,metrics,prometheus
management.endpoint.health.show-details=when-authorized
management.metrics.enable.jvm=true
management.metrics.enable.process=true
management.metrics.enable.logback=true

# Redis (Optional - for caching/sessions)
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}
spring.data.redis.password=${REDIS_PASSWORD:}
spring.cache.type=redis
spring.cache.redis.time-to-live=600000

# VNPay Payment Gateway
vnpay.api.url=https://api.vnpayment.vn
vnpay.merchant.id=${VNPAY_MERCHANT_ID}
vnpay.hash.secret=${VNPAY_HASH_SECRET}
vnpay.return.url=https://your-domain.com/payment/vnpay/callback

# Momo Payment Gateway
momo.api.url=https://api.momo.vn
momo.partner.code=${MOMO_PARTNER_CODE}
momo.access.key=${MOMO_ACCESS_KEY}
momo.secret.key=${MOMO_SECRET_KEY}
momo.return.url=https://your-domain.com/payment/momo/callback
```

### 2.2 Environment Variables

Set these environment variables on your production server:

```bash
# Database
export DB_USERNAME=restaurant_admin
export DB_PASSWORD=your_very_secure_password_32_chars_min

# Mail
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your_app_specific_password_from_google
export MAIL_FROM=noreply@restaurant-platform.com

# JWT
export JWT_SECRET=your_very_long_random_secret_key_at_least_32_chars_here

# CORS
export CORS_ALLOWED_ORIGINS=https://your-domain.com,https://app.your-domain.com

# Payment Gateways
export VNPAY_MERCHANT_ID=your_vnpay_merchant_id
export VNPAY_HASH_SECRET=your_vnpay_hash_secret
export MOMO_PARTNER_CODE=your_momo_partner_code
export MOMO_ACCESS_KEY=your_momo_access_key
export MOMO_SECRET_KEY=your_momo_secret_key

# Redis (optional)
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=your_redis_password

# Frontend URL
export FRONTEND_URL=https://your-domain.com
```

### 2.3 Generate JWT Secret

```bash
# Generate a secure random key (Unix/Linux)
openssl rand -base64 32

# Or use Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use Java
java -jar -c "import java.util.Base64; System.out.println(Base64.getEncoder().encodeToString(new java.security.SecureRandom().generateSeed(32)));"
```

## Phase 3: Build & Package

### 3.1 Build Backend

```bash
cd /path/to/restaurant-platform

# Clean build
mvn clean install -DskipTests -Dspring.profiles.active=prod

# Create executable JAR
mvn spring-boot:repackage
```

### 3.2 Build Frontend

```bash
cd /path/to/restaurant-platform/frontend

# Install dependencies
npm ci  # Use ci instead of install for production

# Build
npm run build

# Output will be in dist/ folder
```

### 3.3 Create Deployment Package

```bash
# Backend
cp target/restaurant-platform-0.0.1-SNAPSHOT.jar /opt/restaurant-platform/
cp /path/to/application-prod.properties /opt/restaurant-platform/config/

# Frontend
cp -r frontend/dist/* /var/www/restaurant-platform/
```

## Phase 4: Systemd Service Setup (Linux)

Create `/etc/systemd/system/restaurant-platform.service`:

```ini
[Unit]
Description=Restaurant Platform Application
After=network.target postgres.service
Wants=postgres.service

[Service]
Type=simple
User=restaurant-user
WorkingDirectory=/opt/restaurant-platform
Environment="SPRING_CONFIG_LOCATION=file:/opt/restaurant-platform/config/application-prod.properties"
Environment="JAVA_OPTS=-Xms512m -Xmx2g -XX:+UseG1GC"
ExecStart=/usr/lib/jvm/java-21-openjdk-amd64/bin/java \
    -Dspring.profiles.active=prod \
    -Dspring.config.location=file:/opt/restaurant-platform/config/application-prod.properties \
    -jar /opt/restaurant-platform/restaurant-platform-0.0.1-SNAPSHOT.jar

Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=restaurant-platform

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable restaurant-platform
sudo systemctl start restaurant-platform
sudo systemctl status restaurant-platform
```

## Phase 5: Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/restaurant-platform`:

```nginx
# Upstream backend
upstream restaurant_backend {
    server localhost:8080 fail_timeout=0;
    keepalive 32;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com *.your-domain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Certificates (from Let's Encrypt or your CA)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    gzip_min_length 1024;

    # API Endpoints
    location /api/ {
        proxy_pass http://restaurant_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /ws {
        proxy_pass http://restaurant_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Upgrade websocket;
        proxy_http_version 1.1;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Frontend
    location / {
        alias /var/www/restaurant-platform/;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        alias /var/www/restaurant-platform/$uri;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://restaurant_backend;
        access_log off;
    }
}

# Subdomain for app
server {
    listen 443 ssl http2;
    server_name app.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        alias /var/www/restaurant-platform/;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/restaurant-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Phase 6: SSL Certificate Setup

Using Let's Encrypt (recommended):

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx \
    -d your-domain.com \
    -d app.your-domain.com \
    -d www.your-domain.com \
    --email your-email@example.com \
    --agree-tos \
    --non-interactive

# Auto-renewal (cron job)
sudo certbot renew --quiet
```

## Phase 7: Database Backup Strategy

### Daily Backup Script

Create `/opt/restaurant-platform/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/restaurant-platform/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="restaurant_db_prod"
DB_USER="restaurant_admin"

mkdir -p $BACKUP_DIR

# Full dump
pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/backup_full_$TIMESTAMP.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_full_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_full_$TIMESTAMP.sql.gz"
```

Add to crontab:

```bash
# Daily at 2 AM
0 2 * * * /opt/restaurant-platform/backup.sh

# Weekly to remote (S3, etc.)
0 3 * * 0 aws s3 cp /opt/restaurant-platform/backups/ s3://my-bucket/backups/ --recursive
```

## Phase 8: Monitoring & Logging

### Application Metrics

Access Prometheus metrics:
```
https://your-domain.com/api/actuator/metrics
```

### Log Rotation

Create `/etc/logrotate.d/restaurant-platform`:

```
/var/log/restaurant-platform/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 restaurant-user restaurant-user
    sharedscripts
    postrotate
        systemctl reload restaurant-platform > /dev/null 2>&1 || true
    endscript
}
```

### Monitoring Tools (Recommended)

- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **ELK Stack** - Log aggregation (Elasticsearch, Logstash, Kibana)
- **DataDog** - Full-stack monitoring
- **New Relic** - APM

## Phase 9: Security Hardening

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp from 127.0.0.1  # PostgreSQL from localhost only
sudo ufw enable
```

### PostgreSQL Security

```sql
-- Disable unnecessary extensions
DROP EXTENSION IF EXISTS plpgsql;

-- Restrict user privileges
REVOKE ALL ON DATABASE restaurant_db_prod FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Audit logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_error_statement = 'ERROR';
SELECT pg_reload_conf();
```

### Application Security

```properties
# Disable Swagger in production
springdoc.api-docs.enabled=false
springdoc.swagger-ui.enabled=false

# Disable actuator endpoints in production
management.endpoints.web.exposure.include=health

# Enforce HTTPS only
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
```

## Phase 10: Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_tables_status ON tables(status);

-- Analyze tables
ANALYZE orders;
ANALYZE reservations;
ANALYZE tables;
ANALYZE menu_items;
```

### Application Performance

```properties
# Connection pooling
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# Caching
spring.cache.type=redis
spring.cache.redis.time-to-live=600000

# HTTP/2
server.http2.enabled=true

# Gzip compression
server.compression.enabled=true
server.compression.min-response-size=1024
```

## Phase 11: Post-Deployment Verification

### Checklist

```bash
# Backend health check
curl -k https://your-domain.com/api/actuator/health

# Frontend accessibility
curl -k https://your-domain.com/

# Database connectivity
psql -h localhost -U restaurant_admin -d restaurant_db_prod -c "SELECT 1"

# Redis connectivity (if enabled)
redis-cli ping

# WebSocket connectivity
wscat -c wss://your-domain.com/ws

# SSL certificate validation
openssl s_client -connect your-domain.com:443

# Check logs
tail -f /var/log/restaurant-platform/app.log
journalctl -u restaurant-platform -f
```

### Performance Test

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://your-domain.com/api/health

# Or with wrk
wrk -t4 -c100 -d30s https://your-domain.com/api/
```

## Rollback Procedure

If deployment fails:

```bash
# Stop current version
sudo systemctl stop restaurant-platform

# Restore from backup
pg_restore -d restaurant_db_prod < backup_full_previous.sql.gz

# Restore previous JAR
cp /opt/restaurant-platform/backups/restaurant-platform-previous.jar /opt/restaurant-platform/

# Restart
sudo systemctl start restaurant-platform
```

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancer**: Use Nginx upstream or AWS ELB
2. **Database Replication**: PostgreSQL streaming replication
3. **Caching Layer**: Redis/Memcached
4. **CDN**: CloudFlare or AWS CloudFront for static assets

### Vertical Scaling

```bash
# Increase JVM memory
JAVA_OPTS="-Xms2g -Xmx8g -XX:+UseG1GC"

# Database connection pool
spring.datasource.hikari.maximum-pool-size=50
```

## Support & Troubleshooting

### Common Issues

**Issue**: Application fails to connect to database
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify connection parameters
psql -h localhost -U restaurant_admin -d restaurant_db_prod
```

**Issue**: WebSocket connection fails
```bash
# Check Nginx WebSocket configuration
sudo nginx -T | grep Upgrade

# Verify service is running
sudo systemctl status restaurant-platform
```

**Issue**: Email not sending
```bash
# Verify Gmail app password is set
echo $MAIL_PASSWORD

# Check mail logs
grep "mail" /var/log/restaurant-platform/app.log
```

---

**Last Updated**: 2026-04-02  
**Status**: Production-Ready  
**Support**: See README.md for more information
