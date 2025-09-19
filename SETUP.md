# RLS Guard Dog - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Clone and install
git clone <your-repo>
cd guard-dog
npm install

# Copy environment file
cp .env.example .env.local
```

### 2. Configure Environment Variables
Edit `.env.local` with your credentials:

```env
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get this from MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/guard-dog-school

# Generate a random secret
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

#### Supabase (Required)
1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql` 
   - `supabase/migrations/003_seed_data.sql`

#### MongoDB Atlas (Required)
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Collections created automatically

### 4. Run Application
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🧪 Test Users (from seed data)

| Role | Email | Password |
|------|-------|----------|
| Teacher | `john.teacher@school.edu` | Set during signup |
| Head Teacher | `mary.head@school.edu` | Set during signup |
| Student | `alice.student@school.edu` | Set during signup |

## 🚀 Deploy to Production

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Supabase Edge Functions (Optional)
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy calculate-averages
supabase secrets set MONGODB_URI="your-mongodb-uri"
```

## 📁 Key Files

- `app/dashboard/page.tsx` - Role-based dashboard
- `app/teacher/page.tsx` - Teacher management
- `middleware.ts` - Route protection
- `lib/auth.ts` - Authentication utilities
- `supabase/migrations/` - Database schema

## 🛠️ Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

## 🆘 Troubleshooting

### Common Issues

**"Cannot connect to Supabase"**
- Check your Supabase URL and keys in `.env.local`
- Ensure RLS policies are applied

**"MongoDB connection failed"**
- Verify MongoDB URI format
- Check network access in MongoDB Atlas

**"Unauthorized access"** 
- Make sure you're logged in
- Check user role assignments
- Verify middleware is working

### Getting Help
- Check browser console for errors
- Review Supabase logs
- Verify environment variables

---

Happy coding! 🐕‍🦺