# Blog App - Troubleshooting Guide

## "Post not found" Error in Image Admin

If you encounter a "Post not found" error when trying to update image URLs in the admin page, it means the posts from the mock data don't exist in your Supabase database.

### How to Fix:

#### Option 1: Run the Database Setup Script
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `database-setup.sql` from this project
4. Paste and run the script in the SQL Editor
5. Refresh the admin page

This will create all the necessary tables and sample data with the exact IDs used in the application.

#### Option 2: Create Posts On-Demand
1. When you see a "Post not found" error, click the "Create post in database" button
2. This will create the post in your database with the same ID as in the mock data
3. You can then update the image URL for the newly created post

## Common Database Issues:

### 406 Error
A 406 error (Not Acceptable) typically means the application is trying to access a record that doesn't exist. Run the database setup script to create all required records.

### UUID Mismatch
The application uses specific UUIDs for the mock data. Make sure you're using the setup script to create posts with matching IDs.

### RLS Policies
The setup script includes Row Level Security (RLS) policies to allow public access to the data. If you're experiencing permission issues, make sure these policies are applied.

## Environment Variables

Ensure your `.env` file includes these variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace with your actual Supabase project URL and anon key.