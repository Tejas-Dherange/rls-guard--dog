# Guard Dog School Management System

A comprehensive Next.js school management system demonstrating **Row-Level Security (RLS)** with role-based access control using **Supabase**, **MongoDB Atlas**, and **Edge Functions**.

## Project Overview

This project simulates a school system with three user roles:
- **Students** - Can only view their own progress
- **Teachers** - Can manage students in their assigned classes  
- **Head Teachers** - Can view all data across their school

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Supabase (Auth + Database + Edge Functions)
- **Database**: PostgreSQL (Supabase) + MongoDB Atlas
- **Authentication**: Supabase Auth with role-based permissions
- **Deployment**: Vercel (Next.js) + Supabase (Functions)

## Database Schema

### Supabase (PostgreSQL)
- `profiles` - User profiles with roles
- `schools` - School information
- `classrooms` - Classes with teacher assignments
- `students` - Student records linked to users
- `progress` - Assessment results with RLS policies

### MongoDB Atlas
- `class_averages` - Calculated class performance metrics
- `analytics` - School-wide performance analytics

## Row-Level Security Policies

### Students
```sql
-- Students can only see their own progress
CREATE POLICY "Students can view own progress" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = progress.student_id 
      AND s.user_id = auth.uid()
    )
  );
```

### Teachers  
```sql
-- Teachers can manage students in their classes
CREATE POLICY "Teachers can manage class progress" ON progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = progress.class_id 
      AND c.teacher_id = auth.uid()
    )
  );
```

### Head Teachers
```sql
-- Head teachers can view all school data
CREATE POLICY "Head teachers can manage school progress" ON progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'head_teacher'
    )
  );
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd guard-dog
npm install
```

### 2. Environment Setup
Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MongoDB Atlas  
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guard-dog-school

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

#### Supabase Setup
1. Create a new Supabase project
2. Run the migration files in order:
```bash
# In Supabase SQL Editor, run these files:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_seed_data.sql
```

#### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. The collections will be created automatically when first used

### 4. Supabase Edge Functions (Optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy Edge Function
supabase functions deploy calculate-averages

# Set environment secrets
supabase secrets set MONGODB_URI="your_mongodb_connection_string"
```

### 5. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Features & Pages

### Authentication (`/auth`)
- **Login** - Email/password authentication
- **Sign Up** - User registration with role selection
- **Forgot Password** - Password reset flow

### Dashboard (`/dashboard`)
- **Student View** - Personal progress and class info
- **Teacher View** - Class overview and student management
- **Head Teacher View** - School-wide analytics

### Teacher Management (`/teacher`)
- Add progress records for students
- View class performance
- Trigger average calculations
- MongoDB integration display

## MongoDB Integration

The system uses both Supabase (PostgreSQL) and MongoDB for different purposes:

- **Supabase**: Real-time data, authentication, RLS policies
- **MongoDB**: Analytics, aggregated data, calculated averages

### Calculate Averages Flow
1. Teacher triggers calculation via UI
2. Next.js API route fetches progress data from Supabase
3. Calculations performed and saved to MongoDB
4. Results displayed in teacher dashboard

## 🚦 API Routes

### `/api/class-averages`
- **GET**: Fetch calculated averages from MongoDB
- **Authentication**: Required (Teacher/Head Teacher)

### `/api/calculate-averages`  
- **POST**: Calculate and save class averages
- **Authentication**: Required (Teacher/Head Teacher)

## 🛡️ Security Features

### Role-Based Access Control
- Middleware protection on all routes
- Supabase RLS policies enforce data access
- MongoDB queries filtered by user permissions

### Authentication Flow
1. User signs up with role selection
2. Profile created in Supabase with role
3. Middleware checks role on protected routes
4. RLS policies filter database queries

## 🚀 Deployment

### Vercel (Next.js App)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Supabase (Edge Functions)
```bash
# Deploy functions
supabase functions deploy calculate-averages

# Set production secrets
supabase secrets set MONGODB_URI="production_mongodb_uri"
```

## 📚 Project Structure

```
guard-dog/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboard
│   ├── teacher/           # Teacher management
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Shadcn/ui components
│   └── auth/              # Auth-specific components
├── lib/                   # Utilities and configurations
│   ├── supabase/          # Supabase clients
│   ├── models/            # MongoDB Mongoose models
│   ├── auth.ts            # Authentication utilities
│   └── mongodb.ts         # MongoDB connection
├── supabase/              # Supabase configuration
│   ├── migrations/        # SQL migration files
│   └── functions/         # Edge Functions
└── middleware.ts          # Route protection middleware
```

## 🧪 Testing

### User Roles for Testing
Use the seed data to test different roles:



### Test Scenarios
1. **Student Login** - Should only see own progress
2. **Teacher Login** - Should see assigned class data
3. **Head Teacher Login** - Should see all school data
4. **Route Protection** - Unauthorized access should redirect
5. **MongoDB Integration** - Calculate and view averages

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Live Demo

- **Vercel Deployment**: [Demo Link](https://rls-guard-dog-sepia.vercel.app)

---

**Built with ❤️ using Next.js, Supabase, and MongoDB**
