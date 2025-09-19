#!/bin/bash

# RLS Guard Dog Deployment Script
echo "🐕‍🦺 RLS Guard Dog Deployment Script"
echo "=================================="

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
        exit 1
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo "❌ SUPABASE_SERVICE_ROLE_KEY is not set"
        exit 1
    fi
    
    if [ -z "$MONGODB_URI" ]; then
        echo "❌ MONGODB_URI is not set"
        exit 1
    fi
    
    echo "✅ All environment variables are set"
}

# Build the Next.js application
build_app() {
    echo "🏗️  Building Next.js application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Deploy Supabase Edge Functions (optional)
deploy_edge_functions() {
    echo "🚀 Deploying Supabase Edge Functions..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        echo "⚠️  Supabase CLI not found. Skipping Edge Function deployment."
        echo "   Install it with: npm install -g supabase"
        return
    fi
    
    # Deploy the Edge Function
    supabase functions deploy calculate-averages
    
    if [ $? -eq 0 ]; then
        echo "✅ Edge Function deployed successfully"
        
        # Set the MongoDB URI secret
        echo "🔑 Setting MongoDB URI secret..."
        echo "$MONGODB_URI" | supabase secrets set MONGODB_URI
        
        if [ $? -eq 0 ]; then
            echo "✅ Secret set successfully"
        else
            echo "❌ Failed to set secret"
        fi
    else
        echo "❌ Edge Function deployment failed"
    fi
}

# Run database migrations
run_migrations() {
    echo "📊 Database migrations should be run manually in Supabase SQL Editor"
    echo "   Run these files in order:"
    echo "   1. supabase/migrations/001_initial_schema.sql"
    echo "   2. supabase/migrations/002_rls_policies.sql"
    echo "   3. supabase/migrations/003_seed_data.sql"
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    
    check_env_vars
    build_app
    
    # Ask user if they want to deploy Edge Functions
    read -p "Do you want to deploy Supabase Edge Functions? (y/N): " deploy_functions
    if [[ $deploy_functions =~ ^[Yy]$ ]]; then
        deploy_edge_functions
    fi
    
    run_migrations
    
    echo ""
    echo "🎉 Deployment script completed!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to Vercel by connecting your GitHub repository"
    echo "2. Add environment variables in Vercel dashboard"
    echo "3. Run the database migrations in Supabase SQL Editor"
    echo "4. Test the application with different user roles"
    echo ""
    echo "📚 For detailed instructions, see README-DETAILED.md"
}

# Run the main function
main