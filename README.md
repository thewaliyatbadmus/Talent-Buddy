# Talent Buddy

Talent Buddy is a simple, clean web application designed to help students and junior developers find internships and entry-level jobs. It pulls live data from *The Muse API* to show real opportunities, allowing users to search, filter, and save the jobs they like.

I built this project to solve a real problem: job boards are often cluttered and overwhelming. Talent Buddy focuses strictly on early-career roles with a minimalist black-and-white design that's easy on the eyes.
Youtube Demo - https://youtu.be/0ohvDw6XgnA
[IMPORTANT!] Github page - https://thewaliyatbadmus.github.io/Talent-Buddy/
Webserver 1 link - http://44.202.126.6/
Webserver 2 link - http://44.212.13.223/
Load balancer link - http://3.94.80.193/

## Features
- Live Job Search: Fetches real-time job listings.
- Smart Filtering: One-click filters for "Internship", "Entry Level", "Remote", etc.
- Sorting: Sort jobs by "Newest First" or "Company (A-Z)".
- Saved Library: You can "heart" jobs to save them to your local library for later.
- Responsive Design: Works on mobile and desktop.

## How to Run Locally

1.  Clone the repository (or download the files).
2.  Open `index.html ’ directly in your browser (Chrome, Safari, Firefox).
  Note: Since it fetches data from an external API, you just need an internet connection.
3.  That's it! You can start searching immediately.

## Deployment Process

I deployed this application to three servers: two web servers (Web01, Web02) running Nginx, and one Load Balancer (Lb01) running HAProxy.

## 1. Web Servers (Web01 & Web02)
My web servers are running Nginx. Here is how I got the code onto them:

Step A: Transferring Files
I couldn't copy files directly to the web folder because of permission issues, so I used `scp` to copy them to my home directory first. I ran this command from my local terminal for both servers:

```bash
# Copying to Web01 (and then Web02)
scp -i ~/.ssh/school -r index.html style.css script.js deployment/setup_web.sh ubuntu@44.202.126.6:~/
```

**Step B: Setting Up Nginx
Once the files were on the server, I SSH'd in and ran a script I wrote (`setup_web.sh`) to handle the heavy lifting. This script installs Nginx, creates the directory, and moves the files to `/var/www/html/talent-buddy`.

```bash
ssh -i ~/.ssh/school ubuntu@44.202.126.6
chmod +x setup_web.sh
sudo ./setup_web.sh
```

### 2. Load Balancer (Lb01)
My load balancer uses **HAProxy** to split traffic between the two web servers.

I installed HAProxy and edited the config file:
```bash
sudo apt-get install haproxy
sudo nano /etc/haproxy/haproxy.cfg
```

I added this configuration to the end of the file to enable Round Robin load balancing:

```haproxy
frontend talent_buddy_front
    bind *:80
    default_backend talent_buddy_back

backend talent_buddy_back
    balance roundrobin
    server web01 44.202.126.6:80 check
    server web02 44.212.13.223:80 check
```

After restarting the service (`sudo service haproxy restart`), the load balancer was live.

---

## APIs & Resources Used

The Muse API: Used to fetch job data.
    Documentation: [The Muse API v2](https://www.themuse.com/developers/api/v2)
   Note: No API key is required for their public endpoints.
Google Fonts: Used the 'Inter' font family.
FontAwesome: Used for the icons (briefcase, heart, etc.).

## Challenges & Solutions

1. The "Permission Denied" SCP Error
When I first tried to deploy, I tried to `scp` my files directly into `/var/www/html`. The transfer kept failing with "Permission denied". I learned that the default `ubuntu` user doesn't have write access there.
*   **Solution**: I changed my strategy to copy the files to `~/` (home directory) first, then used `sudo mv` inside the server to put them in the right place.

2. Client-Side Filtering
The API is great, but it has some limitations on how complex the search queries can be. I wanted users to be able to search *and* filter by location at the same time.
Solution: I implemented the filtering logic in JavaScript (`script.js`). I fetch the relevant jobs first, and then use the `.filter()` method to narrow them down based on what the user typed or clicked.

3. The API is limited to 500 responses per hour because the app is not registered. since it was just a mini project of playing around with APIs, I felt like it's better to stick to the free version. 