# Exporting from Replit to GitHub

This guide provides instructions for exporting this Replit project to GitHub.

## Method 1: Using Replit's GitHub Integration

1. Click on the "Version Control" tab in the Replit sidebar (Git icon)
2. Click "Connect to GitHub"
3. Authorize Replit to access your GitHub account
4. Choose a repository name and click "Create GitHub Repository"
5. Click "Push" to push the code to the GitHub repository

## Method 2: Manual Export to GitHub

1. Create a new repository on GitHub
   - Visit https://github.com/new
   - Name your repository (e.g., "ipcr-early-warning-system")
   - Do not initialize with README, .gitignore, or license
   - Click "Create repository"

2. Connect your Replit project to the GitHub repository
   ```bash
   # In the Replit shell
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

3. Enter your GitHub credentials when prompted

## Method 3: Clone and Push Manually

1. Download the project from Replit
   - Click the three dots menu next to your project name
   - Select "Download as ZIP"
   - Extract the ZIP file

2. Create a GitHub repository as in Method 2, Step 1

3. Initialize a git repository in the extracted folder
   ```bash
   cd path/to/extracted/folder
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

## After Exporting

After successfully exporting to GitHub, you may want to:

1. Set up GitHub Actions for continuous integration and deployment
   - The necessary workflow files are already included in the `.github/workflows` directory

2. Configure repository settings
   - Go to Settings > Secrets and Variables > Actions
   - Add the following secrets for deployment:
     - `FTP_SERVER`
     - `FTP_USERNAME`
     - `FTP_PASSWORD`
     - `FTP_SERVER_DIR`

3. Protect your `main` branch
   - Go to Settings > Branches
   - Add a branch protection rule for `main`
   - Require pull request reviews before merging