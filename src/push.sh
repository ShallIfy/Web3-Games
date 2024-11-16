#!/bin/bash

# src/push.sh

# Memastikan ada pesan commit
if [ -z "$1" ]; then
  echo "Usage: ./push.sh \"commit message\""
  exit 1
fi

COMMIT_MESSAGE=$1

# Memastikan berada dalam direktori Git
if [ ! -d ".git" ]; then
  echo "Bukan direktori Git."
  exit 1
fi

# Menambahkan semua perubahan ke staging area
echo "Menambahkan semua perubahan..."
git add .

# Melakukan commit dengan pesan yang diberikan
echo "Melakukan commit dengan pesan: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Mendapatkan branch yang sedang aktif
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$CURRENT_BRANCH" ]; then
  echo "Tidak dapat menentukan branch saat ini."
  exit 1
fi

# Melakukan push ke remote
echo "Mendorong perubahan ke origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"

echo "Push selesai!"
