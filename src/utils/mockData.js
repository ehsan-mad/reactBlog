// Mock data for development when Supabase is not configured
export const mockCategories = [
  {
    id: '1649b2bb-031b-416f-9277-a8ada9b1dfea',
    name: 'Technology',
    slug: 'technology',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'd7efdb3b-6c15-42e6-9f37-5e7af86f4ff1',
    name: 'Travel',
    slug: 'travel',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'de7e1f92-e3f1-4b91-8eb3-a5a6fba90c0d',
    name: 'Lifestyle',
    slug: 'lifestyle',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'b9b5f12d-d4a5-4e3e-a4bc-3d0e30db0c18',
    name: 'Design',
    slug: 'design',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'c5b8a573-ec83-4c0a-848c-ebc1c22a27a8',
    name: 'Programming',
    slug: 'programming',
    created_at: '2024-01-01T00:00:00Z'
  }
]

export const mockPosts = [
  {
    id: '1649b2bb-031b-416f-9277-a8ada9b1dfeb',
    title: 'Getting Started with React 19',
    slug: 'getting-started-with-react-19',
    excerpt: 'Learn the new features and improvements in React 19, including the new compiler and concurrent features that make your apps faster and more efficient.',
    content: `# Getting Started with React 19

React 19 brings exciting new features and improvements that make building modern web applications easier and more efficient than ever before.

## What's New in React 19

### React Compiler
The new React Compiler automatically optimizes your components, reducing the need for manual memoization.

### Improved Concurrent Rendering
Better handling of concurrent features makes your app more responsive.

## Getting Started

\`\`\`bash
npm create react-app@latest my-app
cd my-app
npm start
\`\`\`

React 19 represents a significant step forward in React development!`,
    cover_path: 'https://picsum.photos/seed/react19/800/600',
    category_id: '1649b2bb-031b-416f-9277-a8ada9b1dfea',
    published: true,
    published_at: '2024-09-10T12:00:00Z',
    views: 150,
    likes: 23,
    categories: {
      id: '1649b2bb-031b-416f-9277-a8ada9b1dfea',
      name: 'Technology',
      slug: 'technology'
    }
  },
  {
    id: 'd7efdb3b-6c15-42e6-9f37-5e7af86f4ff2',
    title: 'Best Travel Destinations for 2024',
    slug: 'best-travel-destinations-2024',
    excerpt: 'Discover the most amazing places to visit in 2024, from hidden gems to popular hotspots. Complete with travel tips and budget recommendations.',
    content: `# Best Travel Destinations for 2024

Travel is back in full swing, and 2024 offers incredible opportunities to explore both familiar favorites and exciting new destinations.

## Top Destinations

### 1. Japan 🇯🇵
- **Best Time**: March-May (Cherry Blossoms)
- **Highlights**: Tokyo, Kyoto, Mount Fuji
- **Budget**: $150-300/day

### 2. Portugal 🇵🇹
- **Best Time**: April-October
- **Highlights**: Lisbon, Porto, Algarve Coast
- **Budget**: $80-150/day

Start planning your dream trip today!`,
    cover_path: 'https://picsum.photos/seed/thailand/800/600',
    category_id: 'd7efdb3b-6c15-42e6-9f37-5e7af86f4ff1',
    published: true,
    published_at: '2024-09-09T12:00:00Z',
    views: 89,
    likes: 12,
    categories: {
      id: 'd7efdb3b-6c15-42e6-9f37-5e7af86f4ff1',
      name: 'Travel',
      slug: 'travel'
    }
  },
  {
    id: 'f9d68a5a-1a43-4d55-9eaf-e0f4337f1c0f',
    title: 'The Art of Minimalist Web Design',
    slug: 'art-of-minimalist-web-design',
    excerpt: 'Explore the principles of minimalist web design and learn how to create clean, functional, and beautiful websites that focus on user experience.',
    content: `# The Art of Minimalist Web Design

In an era of information overload, minimalist web design has emerged as a powerful approach to creating clean, functional, and user-focused digital experiences.

## What is Minimalist Design?

Minimalist web design is about **more than just less**. It's about:
- Purposeful use of space
- Strategic color choices
- Thoughtful typography
- Focused content hierarchy

## Core Principles

### 1. White Space is Your Friend
White space (or negative space) isn't empty space—it's a design element that:
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

Start implementing minimalist design principles in your next project!`,
    cover_path: 'https://picsum.photos/seed/design/800/600',
    category_id: 'b9b5f12d-d4a5-4e3e-a4bc-3d0e30db0c18',
    published: true,
    published_at: '2024-09-08T12:00:00Z',
    views: 67,
    likes: 8,
    categories: {
      id: 'b9b5f12d-d4a5-4e3e-a4bc-3d0e30db0c18',
      name: 'Design',
      slug: 'design'
    }
  },
  {
    id: 'c5b8a573-ec83-4c0a-848c-ebc1c22a27a9',
    title: 'Mastering Modern JavaScript: ES2024 Features',
    slug: 'mastering-modern-javascript-es2024',
    excerpt: 'Discover the latest JavaScript features in ES2024 and learn how to write more efficient, readable, and powerful code with practical examples.',
    content: `# Mastering Modern JavaScript: ES2024 Features

JavaScript continues to evolve with powerful new features that make development more efficient and enjoyable. Let's explore the latest additions in ES2024.

## New Array Methods

### Array.prototype.toSorted()
\`\`\`javascript
const numbers = [3, 1, 4, 1, 5];
const sorted = numbers.toSorted(); // [1, 1, 3, 4, 5]
// Original array unchanged: [3, 1, 4, 1, 5]
\`\`\`

### Array.prototype.with()
\`\`\`javascript
const fruits = ['apple', 'banana', 'orange'];
const newFruits = fruits.with(1, 'grape');
// Result: ['apple', 'grape', 'orange']
\`\`\`

## Pattern Matching (Proposal)
\`\`\`javascript
const result = match (value) {
  when Number if value > 0 => 'positive',
  when Number if value < 0 => 'negative',
  when 0 => 'zero',
  when String => 'text',
  else => 'unknown'
}
\`\`\`

## Temporal API (Stage 3)
\`\`\`javascript
// Better date handling
const now = Temporal.Now.plainDateTimeISO();
const birthday = Temporal.PlainDate.from('2024-01-15');
const duration = now.since(birthday);
\`\`\`

## Top-Level Await Improvements
\`\`\`javascript
// main.js
const data = await fetch('/api/data').then(r => r.json());
export { data };
\`\`\`

## Enhanced Error Handling

### Error.cause
\`\`\`javascript
try {
  riskyOperation();
} catch (error) {
  throw new Error('Operation failed', { cause: error });
}
\`\`\`

## Practical Applications

### Data Processing Pipeline
\`\`\`javascript
const processData = (data) => 
  data
    .toSorted((a, b) => a.priority - b.priority)
    .with(0, { ...data[0], processed: true })
    .filter(item => item.active);
\`\`\`

### Modern API Client
\`\`\`javascript
class ApiClient {
  async get(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`, {
          cause: response.statusText
        });
      }
      return response.json();
    } catch (error) {
      console.error('API Error:', error.cause);
      throw error;
    }
  }
}
\`\`\`

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
\`\`\`javascript
// Good: Immutable operations
const sortedItems = items.toSorted(compareFn);

// Good: Clear error context
throw new Error('Validation failed', { 
  cause: validationError 
});

// Good: Structured date handling
const deadline = Temporal.PlainDate.from('2024-12-31');
\`\`\`

### Testing
\`\`\`javascript
import { test, expect } from 'vitest';

test('array methods work correctly', () => {
  const original = [3, 1, 2];
  const sorted = original.toSorted();
  
  expect(sorted).toEqual([1, 2, 3]);
  expect(original).toEqual([3, 1, 2]); // Unchanged
});
\`\`\`

## Browser Support and Polyfills

Check [caniuse.com](https://caniuse.com) for current support:
- Array methods: Widely supported
- Temporal API: Polyfill available
- Pattern matching: Transpilation needed

## Conclusion

ES2024 brings powerful new features that make JavaScript more expressive and reliable. Start incorporating these features gradually to write better, more maintainable code.

The future of JavaScript is bright, and these features are just the beginning!`,
    cover_path: 'https://picsum.photos/seed/javascript/800/600',
    category_id: 'c5b8a573-ec83-4c0a-848c-ebc1c22a27a8',
    published: true,
    published_at: '2024-09-07T12:00:00Z',
    views: 203,
    likes: 34,
    categories: {
      id: 'c5b8a573-ec83-4c0a-848c-ebc1c22a27a8',
      name: 'Programming',
      slug: 'programming'
    }
  }
]