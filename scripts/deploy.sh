#!/bin/bash

# Script de despliegue rápido a Vercel
# Uso: bash scripts/deploy.sh

echo "🚀 Sistema Contable - Script de Despliegue"
echo "=========================================="
echo ""

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI no está instalado."
    echo "Instalando Vercel CLI..."
    npm install -g vercel
fi

# Verificar si estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ No estás en un repositorio Git."
    exit 1
fi

echo "📦 Verificando cambios..."
git status

echo ""
echo "🔐 Iniciando sesión en Vercel..."
vercel login

echo ""
echo "🚀 Desplegando a Vercel..."
vercel --prod

echo ""
echo "✅ ¡Despliegue completado!"
echo ""
echo "Próximos pasos:"
echo "1. Ve a https://vercel.com/dashboard"
echo "2. Configura tu dominio personalizado en Settings → Domains"
echo "3. Compra un dominio en Namecheap o GoDaddy"
echo "4. Configura los DNS records en tu proveedor"
echo ""
