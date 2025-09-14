# Modern Blog Application

A lightweight, performant blog application built with React, Vite, Tailwind CSS, and Supabase. Features a component-based architecture with proper code reusability and modern UI design patterns.

## 📚 Documentation

This project includes comprehensive documentation:

- [Architecture Documentation](./ARCHITECTURE.md): Overview of application architecture
- [Component Documentation](./COMPONENTS.md): Details on all reusable components
- [Data Flow Documentation](./DATA_FLOW.md): How data flows through the application
- [Deployment Guide](./DEPLOYMENT.md): How to deploy the application
- [Troubleshooting Guide](./TROUBLESHOOTING.md): Common issues and solutions

## 🏗️ Architecture

**Frontend:** React 19 + Vite + Tailwind CSS  
**Backend:** Supabase (Postgres + Storage + Auth)  
**Deployment:** Static hosting (Vercel, Netlify, Cloudflare Pages)

## ✨ Features

- 📱 **Responsive Design** - Mobile-first with Tailwind CSS
- ⚡ **Fast Performance** - Vite build system, lazy loading, optimized images
- 🔍 **SEO Friendly** - Proper meta tags and semantic HTML
- 📊 **Analytics** - View tracking and like system
- 🎨 **Modern UI** - Clean, professional design with smooth animations
- 🔧 **Component-Based** - Reusable components for maintainability
- 🛡️ **Type Safety** - JSX with proper prop validation
- 📝 **Markdown Support** - Rich content rendering
- 🔐 **Secure** - Row Level Security (RLS) with Supabase

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd blog_app
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_path TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0 NOT NULL,
  likes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Likes table (for better like tracking with anonymous users)
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX posts_published_at_idx ON posts(published_at DESC) WHERE published = true;
CREATE INDEX posts_category_id_idx ON posts(category_id) WHERE published = true;
CREATE INDEX posts_slug_idx ON posts(slug);
CREATE INDEX categories_slug_idx ON categories(slug);
CREATE INDEX likes_post_id_idx ON likes(post_id);
CREATE INDEX likes_user_id_idx ON likes(user_id);

-- RPC functions for atomic counter updates
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts SET views = views + 1 WHERE id = post_id RETURNING views INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = post_id RETURNING likes INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;
```

### 4. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Allow public read on categories" ON categories
  FOR SELECT USING (true);

-- Allow public read access to published posts
CREATE POLICY "Allow public read on published posts" ON posts
  FOR SELECT USING (published = true);

-- Allow public insert/delete on likes (for anonymous users)
CREATE POLICY "Allow public insert on likes" ON likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to delete their own likes" ON likes
  FOR DELETE USING (true);
```

### 5. Development

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── Header.jsx
│   └── Footer.jsx
├── pages/               # Page components
├── services/            # API and external services
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── App.jsx             # Main app component
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Deploy the `dist` folder to any static hosting service like Vercel, Netlify, or Cloudflare Pages.

## 📄 License

MIT License - feel free to use this project for your own blog!+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
