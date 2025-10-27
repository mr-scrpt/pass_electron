#!/bin/bash

#  Electron Build Script - Prepare Web for Electron
# 
#  Копирует Web React проект и подменяет platform.config.ts
#  на Electron версию для добавления OS notifications.
# 
#  Шаги:
#  1. Очистить старую сборку
#  2. Копировать Web → Electron/.build/web/
#  3. Подменить configs/platform.config.ts (Electron версия)
# 
#  @layer Presentation (Electron)

set -e  # Exit on error

echo "📦 Preparing Web for Electron..."

# Paths
WEB_SRC="src/presentation/web/react"
BUILD_DIR="src/presentation/electron/.build/web"

# 1️⃣ Очистить старую сборку
echo "🗑️  Cleaning old build..."
rm -rf "$BUILD_DIR"

# 2️⃣ Копировать Web
echo "📋 Copying Web app..."
cp -r "$WEB_SRC" "$BUILD_DIR"

# 3️⃣ ПОДМЕНИТЬ конфиг (реэкспорт на Electron версию)
echo "🔄 Replacing platform.config with Electron version..."
cat > "$BUILD_DIR/configs/platform.config.ts" << 'EOF'
/**
 * Platform Configuration - Electron Entry Point
 * 
 * Реэкспорт из platform-configs/electron package.
 * 
 * ⚠️ ЭТОТ ФАЙЛ ПОДМЕНЕН Electron build script!
 * 
 * Electron расширяет Web через:
 * - ElectronNotificationDecorator (добавляет OS notifications)
 * - ElectronLogger (файловый лог)
 * 
 * React НЕ знает что работает в Electron.
 * 
 * @layer Presentation (Electron)
 */
export * from '@password-manager/platform-configs/electron'
EOF

echo "✅ Web prepared for Electron!"
echo "📂 Build directory: $BUILD_DIR"
echo ""
echo "Next steps:"
echo "  1. cd $BUILD_DIR"
echo "  2. pnpm vite build"
echo "  3. electron-builder"
