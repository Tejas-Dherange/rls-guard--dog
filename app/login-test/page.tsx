"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      
      console.log('Attempting login with:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        throw error;
      }

      setMessage('✅ Login successful!');
      setUser(data.user);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setMessage(`❌ Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      
      console.log('Attempting signup with:', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
            role: 'student'
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        throw error;
      }

      setMessage('✅ Signup successful! Check your email for confirmation.');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setMessage(`❌ Signup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Current session:', { session, error });
    setMessage(`Session: ${session ? 'Active' : 'None'}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Login Test</CardTitle>
          <CardDescription>Test Supabase authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Loading...' : 'Login'}
              </Button>
              <Button type="button" onClick={handleSignup} disabled={loading} variant="outline" className="flex-1">
                Sign Up
              </Button>
            </div>
          </form>

          <Button onClick={checkSession} variant="secondary" className="w-full">
            Check Session
          </Button>

          {message && (
            <div className={`p-3 rounded text-sm ${
              message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {user && (
            <div className="p-3 bg-blue-100 rounded text-sm">
              <strong>User Info:</strong>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p><strong>Environment Check:</strong></p>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</p>
            <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}