#!/bin/bash
# Script de build para Render
echo "Instalando dependências..."
npm install

echo "Fazendo build do TypeScript..."
npm run build

echo "Build concluído!"
