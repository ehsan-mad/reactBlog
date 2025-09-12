-- =========================================
-- SUPABASE DATABASE SETUP FOR BLOG APP
-- =========================================
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (if needed for clean setup)
DROP TABLE IF EXISTS public.likes;
DROP TABLE IF EXISTS public.post_views;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.categories;

-- =========================================
-- TABLES
-- =========================================

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

-- Optional: Track unique post views per user to avoid inflating counts
CREATE TABLE IF NOT EXISTS post_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- =========================================
-- INDEXES (for performance)
-- =========================================

CREATE INDEX posts_published_at_idx ON posts(published_at DESC) WHERE published = true;
CREATE INDEX posts_category_id_idx ON posts(category_id) WHERE published = true;
CREATE INDEX posts_slug_idx ON posts(slug);
CREATE INDEX categories_slug_idx ON categories(slug);
CREATE INDEX likes_post_id_idx ON likes(post_id);
CREATE INDEX likes_user_id_idx ON likes(user_id);
CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON post_views(post_id);
CREATE INDEX IF NOT EXISTS post_views_user_id_idx ON post_views(user_id);

-- =========================================
-- RPC FUNCTIONS (for atomic updates)
-- =========================================

-- Function to increment post views atomically
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts SET views = views + 1 WHERE id = post_id RETURNING views INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment post likes atomically
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = post_id RETURNING likes INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update post like count when likes table changes
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes = likes - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- RPC to track a view once per (post_id, user_id) and increment posts.views atomically
CREATE OR REPLACE FUNCTION track_post_view(post_id UUID, user_id UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_viewed BOOLEAN;
  new_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM post_views WHERE post_views.post_id = track_post_view.post_id AND post_views.user_id = track_post_view.user_id
  ) INTO already_viewed;

  IF NOT already_viewed THEN
    INSERT INTO post_views (post_id, user_id) VALUES (track_post_view.post_id, track_post_view.user_id)
    ON CONFLICT (post_id, user_id) DO NOTHING;

    UPDATE posts SET views = views + 1 WHERE id = track_post_view.post_id RETURNING views INTO new_count;
    RETURN new_count;
  ELSE
    SELECT views INTO new_count FROM posts WHERE id = track_post_view.post_id;
    RETURN new_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- TRIGGERS
-- =========================================

-- Trigger to automatically update like counts
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Trigger to update updated_at on posts
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

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

-- Allow public read on likes
CREATE POLICY "Allow public read on likes" ON likes
  FOR SELECT USING (true);

-- Allow public insert/select on post_views; no deletes required for now
CREATE POLICY "Allow public read on post_views" ON post_views
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert on post_views" ON post_views
  FOR INSERT WITH CHECK (true);

-- =========================================
-- SAMPLE DATA (Optional)
-- =========================================

-- Allow anon (public) to execute RPCs for counters
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_post_view(UUID, UUID) TO anon, authenticated;

-- Explicit table grants (with RLS policies defined above)
GRANT SELECT, INSERT, DELETE ON public.likes TO anon, authenticated;
GRANT SELECT, INSERT ON public.post_views TO anon, authenticated;

-- Sample categories
INSERT INTO categories (id, name, slug) VALUES 
  ('1649b2bb-031b-416f-9277-a8ada9b1dfea', 'Technology', 'technology'),
  ('d7efdb3b-6c15-42e6-9f37-5e7af86f4ff1', 'Travel', 'travel'),
  ('f9d68a5a-1a43-4d55-9eaf-e0f4337f1c0e', 'Food', 'food'),
  ('c5b8a573-ec83-4c0a-848c-ebc1c22a27a8', 'Programming', 'programming'),
  ('de7e1f92-e3f1-4b91-8eb3-a5a6fba90c0d', 'Lifestyle', 'lifestyle'),
  ('b9b5f12d-d4a5-4e3e-a4bc-3d0e30db0c18', 'Design', 'design');

-- Sample posts
INSERT INTO posts (id, title, slug, excerpt, content, cover_path, category_id, published, published_at, views, likes) VALUES 
  (
    '1649b2bb-031b-416f-9277-a8ada9b1dfeb', 
    'Getting Started with React 19',
    'getting-started-with-react-19',
    'Learn the new features and improvements in React 19, including the new compiler and concurrent features that make your apps faster and more efficient.',
    '# Getting Started with React 19

React 19 brings exciting new features and improvements that make building modern web applications easier and more efficient than ever before.

## What''s New in React 19

### React Compiler
The new React Compiler automatically optimizes your components, reducing the need for manual memoization with `useMemo` and `useCallback`.

### Improved Concurrent Rendering
Better handling of concurrent features makes your app more responsive, especially under heavy loads.

### Enhanced TypeScript Support
Improved type inference and better integration with TypeScript make development smoother.

## Key Benefits

1. **Better Performance** - Automatic optimizations out of the box
2. **Simpler Code** - Less boilerplate and manual optimization
3. **Enhanced DX** - Better developer experience with improved tooling

## Getting Started

```bash
npm create react-app@latest my-app
cd my-app
npm start
```

## Example Component

```jsx
function MyComponent({ data }) {
  // The compiler automatically optimizes this
  return (
    <div>
      {data.map(item => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  )
}
```

## Conclusion

React 19 represents a significant step forward in React development. The automatic optimizations and improved developer experience make it easier than ever to build fast, scalable applications.

Start experimenting with React 19 today and see the difference it makes in your projects!',
    'https://picsum.photos/seed/react19/800/600',
    '1649b2bb-031b-416f-9277-a8ada9b1dfea',
    true,
    NOW(),
    150,
    23
  ),
  (
    'd7efdb3b-6c15-42e6-9f37-5e7af86f4ff2', 
    'Best Travel Destinations for 2024',
    'best-travel-destinations-2024',
    'Discover the most amazing places to visit in 2024, from hidden gems to popular hotspots. Complete with travel tips and budget recommendations.',
    '# Best Travel Destinations for 2024

Travel is back in full swing, and 2024 offers incredible opportunities to explore both familiar favorites and exciting new destinations.

## Top Destinations

### 1. Japan 🇯🇵
- **Best Time**: March-May (Cherry Blossoms), September-November
- **Highlights**: Tokyo, Kyoto, Mount Fuji, Traditional Ryokans
- **Budget**: $150-300/day

Japan continues to captivate travelers with its perfect blend of ancient traditions and cutting-edge technology.

### 2. Portugal 🇵🇹
- **Best Time**: April-October
- **Highlights**: Lisbon, Porto, Algarve Coast, Douro Valley
- **Budget**: $80-150/day

Portugal offers stunning coastlines, rich history, and incredible value for money.

### 3. New Zealand 🇳🇿
- **Best Time**: December-February (Summer), March-May (Autumn)
- **Highlights**: Queenstown, Milford Sound, Hobbiton, Auckland
- **Budget**: $120-250/day

Adventure seekers will find paradise in New Zealand''s diverse landscapes.

## Hidden Gems

### Slovenia
Often overlooked, Slovenia offers:
- Lake Bled''s fairy-tale scenery
- Ljubljana''s charming old town
- Spectacular caves and castles

### Georgia (Country)
An emerging destination featuring:
- Tbilisi''s eclectic architecture
- Wine regions in Kakheti
- Stunning mountain landscapes

## Planning Tips

### Budget Considerations
- Book flights 2-3 months in advance
- Consider shoulder seasons for better deals
- Use local transportation over taxis
- Try street food and local markets

### Packing Essentials
- Universal power adapter
- Portable charger
- Comfortable walking shoes
- Travel insurance documents

### Safety First
- Research local customs and laws
- Register with your embassy
- Keep copies of important documents
- Share your itinerary with family

## Sustainable Travel

Make your 2024 travels more sustainable:
- Choose eco-friendly accommodations
- Support local businesses
- Minimize plastic use
- Respect wildlife and natural habitats

## Conclusion

2024 is shaping up to be an incredible year for travel. Whether you''re seeking adventure, relaxation, or cultural experiences, there''s a perfect destination waiting for you.

Start planning your dream trip today, and make 2024 a year to remember!',
    'https://picsum.photos/seed/thailand/800/600',
    'd7efdb3b-6c15-42e6-9f37-5e7af86f4ff1',
    true,
    NOW() - INTERVAL '1 day',
    89,
    12
  ),
  (
    'f9d68a5a-1a43-4d55-9eaf-e0f4337f1c0f', 
    'The Art of Minimalist Web Design',
    'art-of-minimalist-web-design',
    'Explore the principles of minimalist web design and learn how to create clean, functional, and beautiful websites that focus on user experience.',
    '# The Art of Minimalist Web Design

In an era of information overload, minimalist web design has emerged as a powerful approach to creating clean, functional, and user-focused digital experiences.

## What is Minimalist Design?

Minimalist web design is about **more than just less**. It''s about:
- Purposeful use of space
- Strategic color choices
- Thoughtful typography
- Focused content hierarchy

## Core Principles

### 1. White Space is Your Friend
White space (or negative space) isn''t empty space—it''s a design element that:
- Improves readability
- Creates visual hierarchy
- Reduces cognitive load
- Enhances user focus

### 2. Typography Matters
In minimalist design, typography often carries the design:
- Choose 1-2 font families maximum
- Use font weight and size for hierarchy
- Ensure excellent readability
- Consider line spacing and length

### 3. Strategic Color Use
- Limit your color palette to 2-3 colors
- Use color to guide attention
- Ensure accessibility standards
- Consider color psychology

## Benefits of Minimalist Design

### Performance
- Faster loading times
- Better mobile experience
- Improved SEO
- Lower bandwidth usage

### User Experience
- Clearer user journeys
- Reduced decision fatigue
- Better accessibility
- Increased conversion rates

### Maintenance
- Easier to update
- Less technical debt
- Cleaner codebase
- Future-proof design

## Implementation Tips

### Start with Content
1. Identify your core message
2. Remove unnecessary elements
3. Prioritize key actions
4. Structure information hierarchy

### Design System
- Create consistent spacing rules
- Define typography scales
- Establish color systems
- Build reusable components

### Testing and Iteration
- A/B test key elements
- Monitor user behavior
- Gather feedback regularly
- Iterate based on data

## Common Mistakes to Avoid

### Over-Simplification
- Don''t remove essential functionality
- Maintain necessary navigation
- Keep important information visible
- Balance aesthetics with usability

### Ignoring Accessibility
- Ensure color contrast
- Provide alternative text
- Support keyboard navigation
- Test with screen readers

## Examples of Great Minimalist Sites

- **Apple**: Clean product focus
- **Medium**: Content-first approach
- **Stripe**: Clear value proposition
- **Notion**: Functional simplicity

## Tools for Minimalist Design

### Design Tools
- Figma for interface design
- Adobe XD for prototyping
- Sketch for Mac users
- InVision for collaboration

### Development
- Tailwind CSS for utility-first styling
- Next.js for React applications
- Gatsby for static sites
- Netlify for hosting

## Conclusion

Minimalist web design isn''t about following a trend—it''s about creating meaningful, user-centered experiences. By focusing on essential elements and removing distractions, you can create websites that truly serve your users'' needs.

Remember: **Good design is as little design as possible, but no simpler.**',
    'https://picsum.photos/seed/design/800/600',
    (SELECT id FROM categories WHERE slug = 'design'),
    true,
    NOW() - INTERVAL '2 days',
    67,
    8
  ),
  (
    'c5b8a573-ec83-4c0a-848c-ebc1c22a27a9', 
    'Mastering Modern JavaScript: ES2024 Features',
    'mastering-modern-javascript-es2024',
    'Discover the latest JavaScript features in ES2024 and learn how to write more efficient, readable, and powerful code with practical examples.',
    '# Mastering Modern JavaScript: ES2024 Features

JavaScript continues to evolve with powerful new features that make development more efficient and enjoyable. Let''s explore the latest additions in ES2024.

## New Array Methods

### Array.prototype.toSorted()
```javascript
const numbers = [3, 1, 4, 1, 5];
const sorted = numbers.toSorted(); // [1, 1, 3, 4, 5]
// Original array unchanged: [3, 1, 4, 1, 5]
```

### Array.prototype.with()
```javascript
const fruits = [''apple'', ''banana'', ''orange''];
const newFruits = fruits.with(1, ''grape'');
// Result: [''apple'', ''grape'', ''orange'']
```

## Pattern Matching (Proposal)
```javascript
const result = match (value) {
  when Number if value > 0 => ''positive'',
  when Number if value < 0 => ''negative'',
  when 0 => ''zero'',
  when String => ''text'',
  else => ''unknown''
}
```

## Temporal API (Stage 3)
```javascript
// Better date handling
const now = Temporal.Now.plainDateTimeISO();
const birthday = Temporal.PlainDate.from(''2024-01-15'');
const duration = now.since(birthday);
```

## Top-Level Await Improvements
```javascript
// main.js
const data = await fetch(''/api/data'').then(r => r.json());
export { data };
```

## Enhanced Error Handling

### Error.cause
```javascript
try {
  riskyOperation();
} catch (error) {
  throw new Error(''Operation failed'', { cause: error });
}
```

## Practical Applications

### Data Processing Pipeline
```javascript
const processData = (data) => 
  data
    .toSorted((a, b) => a.priority - b.priority)
    .with(0, { ...data[0], processed: true })
    .filter(item => item.active);
```

### Modern API Client
```javascript
class ApiClient {
  async get(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`, {
          cause: response.statusText
        });
      }
      return response.json();
    } catch (error) {
      console.error(''API Error:'', error.cause);
      throw error;
    }
  }
}
```

## Performance Benefits

### Memory Efficiency
- Immutable array methods reduce unnecessary copies
- Better garbage collection with structured references
- Optimized temporal calculations

### Developer Experience
- More predictable code behavior
- Better error context and debugging
- Cleaner, more readable syntax

## Migration Strategies

### Gradual Adoption
1. Start with new array methods
2. Implement error.cause in error handling
3. Experiment with temporal API for dates
4. Consider pattern matching for complex logic

### Tooling Support
- Update TypeScript to latest version
- Configure Babel for new features
- Use ESLint rules for modern syntax
- Set up proper polyfills

## Best Practices

### Code Style
```javascript
// Good: Immutable operations
const sortedItems = items.toSorted(compareFn);

// Good: Clear error context
throw new Error(''Validation failed'', { 
  cause: validationError 
});

// Good: Structured date handling
const deadline = Temporal.PlainDate.from(''2024-12-31'');
```

### Testing
```javascript
import { test, expect } from ''vitest'';

test(''array methods work correctly'', () => {
  const original = [3, 1, 2];
  const sorted = original.toSorted();
  
  expect(sorted).toEqual([1, 2, 3]);
  expect(original).toEqual([3, 1, 2]); // Unchanged
});
```

## Browser Support and Polyfills

Check [caniuse.com](https://caniuse.com) for current support:
- Array methods: Widely supported
- Temporal API: Polyfill available
- Pattern matching: Transpilation needed

## Conclusion

ES2024 brings powerful new features that make JavaScript more expressive and reliable. Start incorporating these features gradually to write better, more maintainable code.

The future of JavaScript is bright, and these features are just the beginning!',
    'https://picsum.photos/seed/javascript/800/600',
    (SELECT id FROM categories WHERE slug = 'programming'),
    true,
    NOW() - INTERVAL '3 days',
    203,
    34
  );

-- =========================================
-- STORAGE SETUP
-- =========================================
-- Note: These commands should be run in the Supabase Dashboard Storage section
-- 1. Create a bucket named 'covers'
-- 2. Make it public
-- 3. Upload some sample images

-- =========================================
-- SETUP COMPLETE
-- =========================================
-- Your database is now ready for the blog application!
-- Don't forget to:
-- 1. Set up your environment variables
-- 2. Create the storage bucket
-- 3. Upload some sample cover images