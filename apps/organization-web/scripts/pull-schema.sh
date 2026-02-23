#!/bin/bash

# Load variables from .env file if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Variables for GitHub repository details, allow override from .env
OWNER="${OWNER:-thrive-org}"
REPO="${REPO:-prisma-db}"
SRC_PATH="${SRC_PATH:-prisma/schema.prisma}"
DEST_PATH="${DEST_PATH:-./prisma/schema.prisma}"

# Allow branch name to be passed as an argument, default to 'develop' or .env value if not provided
if [ -n "$1" ]; then
    BRANCH="$1"
else
    BRANCH="${BRANCH:-develop}"
fi

# Check if GITHUB_TOKEN exists, try to load from .env if not set
if [[ -z "$GITHUB_TOKEN" ]]; then
    echo "GitHub token not found. Please enter your GitHub token:"
    read -s GITHUB_TOKEN
    export GITHUB_TOKEN
fi

# Fetch the file from the GitHub repository
curl -fsSL \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Accept: application/vnd.github.v3.raw" \
  "https://api.github.com/repos/$OWNER/$REPO/contents/$SRC_PATH?ref=$BRANCH" \
  -o "$DEST_PATH"

# Check if the file was successfully downloaded
if [ $? -eq 0 ]; then
    echo "File copied successfully to $DEST_PATH."
else
    echo "Failed to fetch the file from the GitHub repository."
fi
