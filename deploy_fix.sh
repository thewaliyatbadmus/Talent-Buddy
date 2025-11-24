#!/usr/bin/env bash

# Fix Deployment Script
# This script will:
# 1. Ask for your server IPs.
# 2. Update the local haproxy.cfg with your Web IPs.
# 3. Upload and run the fixes on your servers.

set -e

echo "--- Immediate Fix Deployment ---"

# 1. Gather Info
read -p "Enter Web Server 1 IP: " WEB1_IP
read -p "Enter Web Server 2 IP: " WEB2_IP
read -p "Enter Load Balancer IP: " LB_IP
read -p "Enter SSH Username (e.g., ubuntu): " SSH_USER

# 2. Update HAProxy Config locally
echo "Updating haproxy.cfg with your Web IPs..."
sed -i.bak "s/192.168.1.101/$WEB1_IP/g" deployment/haproxy.cfg
sed -i.bak "s/192.168.1.102/$WEB2_IP/g" deployment/haproxy.cfg

# 3. Deploy to Web Servers
echo "Deploying to Web Server 1 ($WEB1_IP)..."
scp deployment/setup_web.sh $SSH_USER@$WEB1_IP:/tmp/
ssh -t $SSH_USER@$WEB1_IP "sudo bash /tmp/setup_web.sh"

echo "Deploying to Web Server 2 ($WEB2_IP)..."
scp deployment/setup_web.sh $SSH_USER@$WEB2_IP:/tmp/
ssh -t $SSH_USER@$WEB2_IP "sudo bash /tmp/setup_web.sh"

# 4. Deploy to Load Balancer
echo "Deploying to Load Balancer ($LB_IP)..."
scp deployment/haproxy.cfg $SSH_USER@$LB_IP:/tmp/haproxy.cfg
ssh -t $SSH_USER@$LB_IP "sudo cp /tmp/haproxy.cfg /etc/haproxy/haproxy.cfg && sudo service haproxy restart"

echo "--- Fix Deployed! ---"
echo "Please check https://thewaliyatbadmus.tech"
