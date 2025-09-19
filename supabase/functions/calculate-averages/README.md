# Supabase Edge Function Configuration

## Environment Variables Required

The `calculate-averages` Edge Function requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `MONGODB_URI`: Your MongoDB Atlas connection string

## Deployment Commands

```bash
# Deploy the Edge Function
supabase functions deploy calculate-averages

# Set environment variables (run these commands after deployment)
supabase secrets set MONGODB_URI="your_mongodb_connection_string"
```

## Function Endpoint

Once deployed, the function will be available at:
```
https://your-project-id.supabase.co/functions/v1/calculate-averages
```

## Usage

Send a POST request with authentication header:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  https://your-project-id.supabase.co/functions/v1/calculate-averages
```