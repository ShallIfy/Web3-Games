#!/bin/bash

# src/pull.sh

# Memastikan berada dalam direktori Git
if [ ! -d ".git" ]; then
  echo "Bukan direktori Git."
  exit 1
fi

# Mendapatkan branch default dari remote
DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | awk '{print $NF}')

if [ -z "$DEFAULT_BRANCH" ]; then
  echo "Tidak dapat menentukan branch default dari remote."
  exit 1
fi

# Melakukan pull dari branch default
echo "Melakukan pull dari origin/$DEFAULT_BRANCH..."
git pull origin "$DEFAULT_BRANCH"

echo "Pull selesai!"
