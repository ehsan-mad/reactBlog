# Deployment Guide

This guide covers deploying your blog application to various static hosting platforms.

## Environment Variables

Before deploying, make sure you have these environment variables configured:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Vercel Deployment

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository

### 2. Configure Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables
In your Vercel project settings:
1. Go to Settings → Environment Variables
2. Add `VITE_SUPABASE_URL`
3. Add `VITE_SUPABASE_ANON_KEY`

### 4. Deploy
Click "Deploy" and your site will be live!

## Netlify Deployment

### 1. Connect Repository
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository

### 2. Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 3. Environment Variables
1. Go to Site settings → Environment variables
2. Add your Supabase credentials

### 4. Deploy
Your site will automatically deploy on every push to main branch.

## Cloudflare Pages

### 1. Connect Repository
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click "Create a project"
3. Connect your GitHub repository

### 2. Build Configuration
- **Framework preset**: None
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### 3. Environment Variables
Add your environment variables in the Pages dashboard.

## Manual Deployment

### 1. Build the Project
```bash
npm run build
```

### 2. Upload dist/ Folder
Upload the entire `dist` folder to your web server.

## Domain Configuration

### Custom Domain on Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Custom Domain on Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS settings

### Custom Domain on Cloudflare Pages
1. Go to Custom domains
2. Add your domain
3. DNS records are automatically configured

## Performance Optimization

### Before Deployment
1. **Optimize Images**: Compress cover images to < 300KB
2. **Bundle Analysis**: Run `npm run build` and check bundle size
3. **Lighthouse Audit**: Test performance, accessibility, SEO

### Post-Deployment
1. **CDN**: All platforms provide global CDN automatically
2. **Caching**: Static assets are cached automatically
3. **Monitoring**: Set up uptime monitoring

## Security Checklist

### Supabase Security
- ✅ RLS policies enabled
- ✅ Public read-only access configured
- ✅ Anonymous auth configured (if using likes)
- ✅ Environment variables secured

### Application Security
- ✅ No sensitive data in client code
- ✅ Environment variables properly configured
- ✅ Input validation implemented
- ✅ Error handling doesn't expose sensitive info

## Troubleshooting

### Build Failures
- Check all import paths are correct
- Verify environment variables are set
- Ensure all dependencies are installed

### Runtime Errors
- Check browser console for errors
- Verify Supabase connection
- Test API endpoints in Supabase dashboard

### Performance Issues
- Optimize images and reduce bundle size
- Check network requests in browser dev tools
- Monitor Supabase usage limits

## Monitoring and Analytics

### Basic Monitoring
- Uptime monitoring with UptimeRobot
- Error tracking with Sentry
- Performance monitoring with Web Vitals

### Advanced Analytics
- Google Analytics for user behavior
- Supabase analytics for API usage
- Custom event tracking for engagement

## Maintenance

### Regular Tasks
- Monitor Supabase usage (stay within free tier limits)
- Update dependencies monthly
- Backup database content
- Review and optimize performance

### Scaling Considerations
- Supabase free tier limits
- Image storage optimization
- CDN and caching strategies
- Database query optimization

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review build logs in your deployment platform
3. Test locally with `npm run dev`
4. Check Supabase dashboard for API errors

Happy deploying! 🚀