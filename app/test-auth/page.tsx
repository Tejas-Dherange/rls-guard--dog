import { createClient } from '@/lib/supabase/server';

export default async function TestAuth() {
  const supabase = await createClient();
  
  try {
    // Test if Supabase connection works
    const { data, error } = await supabase.auth.getSession();
    
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Supabase Connection:</h3>
            <p className={error ? "text-red-500" : "text-green-500"}>
              {error ? `Error: ${error.message}` : "✅ Connected successfully"}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold">Session Status:</h3>
            <p>
              {data?.session ? "✅ User is logged in" : "❌ No active session"}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold">Environment Variables:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Authentication Test Failed</h1>
        <p className="text-red-500">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}