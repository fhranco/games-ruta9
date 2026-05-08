#!/bin/bash

# Array of games
GAMES=("calza-burger" "deten-el-9" "punto-perfecto" "ruleta" "ruta-del-fuego" "ruta-millonaria")

# Create public/games directory if it doesn't exist
mkdir -p public/games

for game in "${GAMES[@]}"; do
  echo "------------------------------------------"
  echo "Building $game..."
  echo "------------------------------------------"
  
  cd "$game"
  
  # Ensure base: './' is in vite.config.js
  if ! grep -q "base:" vite.config.js; then
    sed -i '' "s/defineConfig({/defineConfig({\n  base: '.\/',/" vite.config.js
  fi
  
  npm run build
  
  # Back to root
  cd ..
  
  # Copy to public/games
  mkdir -p "public/games/$game"
  cp -rv "$game/dist/"* "public/games/$game/"
done

echo "All games built and copied to public/games/"
