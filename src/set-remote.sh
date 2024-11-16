#!/bin/bash

# src/set-remote.sh

# Pastikan ada argumen yang diberikan
if [ -z "$1" ]; then
  echo "Usage: ./set-remote.sh <remote_url>"
  exit 1
fi

REMOTE_URL=$1

# Mengatur remote origin ke URL yang diberikan
echo "Mengatur remote origin ke $REMOTE_URL"

# Menghapus remote origin yang ada jika ada
git remote remove origin 2>/dev/null

# Menambahkan remote origin baru
git remote add origin "$REMOTE_URL"

# Verifikasi remote URL telah diubah
git remote -v
