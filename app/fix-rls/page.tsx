import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FixRLSPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  async function fixRLS(formData: FormData) {
    'use server'
    const supabase = await createClient()
    
    try {
      // Drop the problematic policies causing infinite recursion
      await supabase.rpc('execute_sql', {
        query: `
          DROP POLICY IF EXISTS "Head teachers can view all profiles" ON profiles;
          DROP POLICY IF EXISTS "Head teachers can update profiles" ON profiles;
          DROP POLICY IF EXISTS "Head teachers can manage profiles" ON profiles;
        `
      })
      
      // Temporarily disable RLS on profiles table
      await supabase.rpc('execute_sql', {
        query: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
      })
      
      console.log('RLS policies fixed successfully!')
    } catch (error: any) {
      console.error('Error fixing RLS:', error.message)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-yellow-800">Fix RLS Infinite Recursion</h1>
        <p className="text-yellow-700 mb-4">
          The profiles table has RLS policies that are causing infinite recursion. 
          This fix will temporarily disable RLS on the profiles table to allow the admin panel to function.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h3 className="font-semibold text-red-800 mb-2">Current Issues:</h3>
          <ul className="text-red-700 space-y-1">
            <li>• Admin panel can't fetch teacher data</li>
            <li>• "infinite recursion detected in policy for relation profiles" error</li>
            <li>• Teacher dropdown is empty in classroom assignment</li>
            <li>• Teacher panel may not display properly</li>
          </ul>
        </div>
        
        <form action={fixRLS}>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fix RLS Policies Now
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>What this will do:</strong></p>
          <ul className="mt-2 space-y-1">
            <li>1. Drop the problematic policies causing recursion</li>
            <li>2. Temporarily disable RLS on profiles table</li>
            <li>3. Allow admin panel to function normally</li>
            <li>4. Teachers will be visible in the admin panel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}