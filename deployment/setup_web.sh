#!/usr/bin/env bash
# Setup script for Web01 and Web02
# Usage: sudo ./setup_web.sh

# 1. Update and Install Nginx (Skipped if already installed)
# echo "Updating package list..."
# apt-get update -y
# echo "Installing Nginx..."
# apt-get install nginx -y

# 2. Setup Directory Structure
echo "Setting up web directory..."
mkdir -p /var/www/html/talent-buddy

# 3. Copy Application Files
# Assuming the script is run from the root of the repo or files are present
# In a real scenario, you might git clone here. 
# For this assignment, we assume files are transferred to /tmp or similar.
echo "Copying application files..."

# NOTE: You must ensure these files exist in the current directory where you run the script
# or update the source path accordingly.
cp index.html /var/www/html/talent-buddy/
cp style.css /var/www/html/talent-buddy/
cp script.js /var/www/html/talent-buddy/

# 4. Configure Nginx
echo "Configuring Nginx..."
# Ensure permissions are correct
chown -R www-data:www-data /var/www/html/talent-buddy
chmod -R 755 /var/www/html/talent-buddy

cat > /etc/nginx/sites-available/talent-buddy <<EOF
server {
    listen 80;
    server_name thewaliyatbadmus.tech www.thewaliyatbadmus.tech;

    root /var/www/html/talent-buddy;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

# 5. Enable Site and Restart
ln -sf /etc/nginx/sites-available/talent-buddy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "Restarting Nginx..."
service nginx restart

echo "Web server setup complete! Access it via http://localhost or your server IP."
