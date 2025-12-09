#!/bin/bash

# Load variables from .env file if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Variables for GitHub repository details, allow override from .env
OWNER="${OWNER:-thrive-org}"
REPO="${REPO:-prisma-db}"
SRC_PATH="${SRC_PATH:-prisma}"
DEST_PATH="${DEST_PATH:-./prisma}"

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

# Function to download a file from GitHub
download_file() {
    local file_path="$1"
    local dest_file="$2"
    
    # Create destination directory if it doesn't exist
    mkdir -p "$(dirname "$dest_file")"
    
    # Download the file
    curl -fsSL \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      -H "Accept: application/vnd.github.v3.raw" \
      "https://api.github.com/repos/$OWNER/$REPO/contents/$file_path?ref=$BRANCH" \
      -o "$dest_file"
    
    if [ $? -eq 0 ]; then
        echo "✓ Downloaded: $file_path -> $dest_file"
        return 0
    else
        echo "✗ Failed to download: $file_path"
        return 1
    fi
}

# Function to recursively process directory contents
process_directory() {
    local src_dir="$1"
    local dest_dir="$2"
    
    # Fetch directory contents
    local temp_file=$(mktemp)
    curl -sSL \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/$OWNER/$REPO/contents/$src_dir?ref=$BRANCH" \
      -o "$temp_file"
    
    if [ $? -ne 0 ]; then
        echo "Failed to fetch directory contents: $src_dir"
        rm -f "$temp_file"
        return 1
    fi
    
    # Check if response starts with '[' (array) or '{' (object)
    local first_char=$(head -c 1 "$temp_file")
    
    if [ "$first_char" = "{" ]; then
        # Single file object, extract and download
        local download_url=$(grep -o '"download_url":"[^"]*"' "$temp_file" | head -1 | cut -d'"' -f4)
        if [ -n "$download_url" ]; then
            mkdir -p "$(dirname "$dest_dir")"
            curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" "$download_url" -o "$dest_dir"
            if [ $? -eq 0 ]; then
                echo "✓ Downloaded: $src_dir -> $dest_dir"
            else
                echo "✗ Failed to download: $src_dir"
            fi
        fi
    elif [ "$first_char" = "[" ]; then
        # Directory array, process each item
        # Try to use Python for JSON parsing (more reliable), fallback to grep if not available
        if command -v python3 &> /dev/null; then
            python3 -c "
import json
import sys

try:
    with open('$temp_file', 'r') as f:
        data = json.load(f)
        if isinstance(data, list):
            for item in data:
                if 'name' in item and 'type' in item:
                    print(f\"{item['name']}|{item['type']}\")
except Exception as e:
    sys.exit(1)
" | while IFS='|' read -r name item_type; do
                if [ -n "$name" ] && [ -n "$item_type" ]; then
                    local src_item="$src_dir/$name"
                    local dest_item="$dest_dir/$name"
                    
                    if [ "$item_type" = "file" ]; then
                        download_file "$src_item" "$dest_item"
                    elif [ "$item_type" = "dir" ]; then
                        process_directory "$src_item" "$dest_item"
                    fi
                fi
            done
        else
            # Fallback: use grep to extract name and type (less reliable but works without Python)
            # This assumes JSON objects are on separate lines or can be matched
            local item_count=0
            while IFS= read -r line; do
                if echo "$line" | grep -q '"name"'; then
                    local name=$(echo "$line" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
                fi
                if echo "$line" | grep -q '"type"'; then
                    local item_type=$(echo "$line" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
                    if [ -n "$name" ] && [ -n "$item_type" ]; then
                        local src_item="$src_dir/$name"
                        local dest_item="$dest_dir/$name"
                        
                        if [ "$item_type" = "file" ]; then
                            download_file "$src_item" "$dest_item"
                        elif [ "$item_type" = "dir" ]; then
                            process_directory "$src_item" "$dest_item"
                        fi
                        name=""
                        item_type=""
                    fi
                fi
            done < "$temp_file"
        fi
    else
        echo "Unexpected response format for: $src_dir"
        rm -f "$temp_file"
        return 1
    fi
    
    rm -f "$temp_file"
    return 0
}

# Main execution
echo "Fetching prisma folder from $OWNER/$REPO (branch: $BRANCH)..."
echo ""

# Process the prisma directory
process_directory "$SRC_PATH" "$DEST_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Prisma folder copied successfully to $DEST_PATH"
else
    echo ""
    echo "✗ Failed to fetch the prisma folder from the GitHub repository."
    exit 1
fi
