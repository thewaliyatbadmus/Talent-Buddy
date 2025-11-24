#!/usr/bin/env bash
# Setup script for Load Balancer (Lb01)
# Usage: sudo ./setup_lb.sh

# 1. Update and Install Nginx
echo "Updating package list..."
apt-get update -y
echo "Installing Nginx..."
apt-get install nginx -y

# 2. Copy Load Balancer Config
echo "Configuring Load Balancer..."

# Check if lb.conf exists in current directory
if [ ! -f "deployment/lb.conf" ]; then
    echo "Error: deployment/lb.conf not found! Please ensure you are running this from the project root."
    exit 1
fi

cp deployment/lb.conf /etc/nginx/sites-available/talent-buddy-lb

# 3. Enable Site and Restart
ln -sf /etc/nginx/sites-available/talent-buddy-lb /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "Restarting Nginx..."
service nginx restart

echo "Load Balancer setup complete!"
