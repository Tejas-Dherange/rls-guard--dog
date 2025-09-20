import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims?.sub ? {
    id: data.claims.sub,
    email: data.claims?.email || 'Not provided',
    role: data.claims?.user_role || 'user',
    aud: data.claims?.aud || 'authenticated',
  } : null;

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <InfoIcon size="20" className="text-blue-600 dark:text-blue-400" />
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            This is a protected area. Only authenticated users can access this page.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size="20" />
            User Profile
          </CardTitle>
          <CardDescription>
            Your account information and authentication details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">User ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Role:</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Audience:</span>
                <Badge variant="outline">{user.aud}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Claims</CardTitle>
          <CardDescription>
            Complete JWT claims data for debugging purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-64 font-mono">
            {JSON.stringify(data.claims, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
