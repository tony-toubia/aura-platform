#!/bin/bash

echo "🧪 Testing Docker builds locally..."
echo "================================="

# Test marketing site build
echo "📦 Building marketing site..."
docker build -f Dockerfile.marketing -t aura-marketing-test . || {
    echo "❌ Marketing site build failed!"
    exit 1
}
echo "✅ Marketing site build successful!"

# Test web app build
echo ""
echo "📦 Building web application..."
docker build -f Dockerfile.web -t aura-web-test . || {
    echo "❌ Web application build failed!"
    exit 1
}
echo "✅ Web application build successful!"

echo ""
echo "🎉 All Docker builds completed successfully!"
echo ""
echo "You can now test the containers locally with:"
echo "  docker run -p 3000:3000 aura-marketing-test"
echo "  docker run -p 3001:3000 aura-web-test"
echo ""
echo "Or proceed with deployment by pushing to your repository."