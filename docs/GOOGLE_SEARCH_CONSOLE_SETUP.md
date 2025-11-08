# Google Search Console Setup Guide

**Story 7.3: SEO Foundation & Structured Data**

This guide will help you set up Google Search Console for Ariyadham to monitor SEO performance, submit sitemaps, and track search analytics.

## Prerequisites

- Access to the production domain (ariyadham.com)
- Google account
- DNS or HTML file upload access for domain verification

## Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add Property"

## Step 2: Add and Verify Your Property

### Option A: Domain Property (Recommended)

1. Select "Domain" property type
2. Enter your domain: `ariyadham.com`
3. Click "Continue"
4. Copy the TXT record provided by Google
5. Add the TXT record to your DNS settings:
   - Record Type: TXT
   - Host: @
   - Value: (paste the verification string from Google)
   - TTL: 3600 (or default)
6. Wait for DNS propagation (can take up to 48 hours, usually much faster)
7. Click "Verify" in Google Search Console

### Option B: URL Prefix Property

1. Select "URL prefix" property type
2. Enter your full URL: `https://ariyadham.com`
3. Choose a verification method:
   - **HTML file upload**: Download the HTML file and upload to `/public/` directory
   - **HTML tag**: Add the meta tag to `src/app/layout.tsx` in the `<head>` section
   - **Google Analytics**: If already using GA, select this method
4. Follow the verification steps
5. Click "Verify"

## Step 3: Submit Your Sitemap

Once verified:

1. Go to "Sitemaps" in the left sidebar
2. Enter your sitemap URL: `https://ariyadham.com/sitemap.xml`
3. Click "Submit"
4. Your sitemap will be processed within a few hours

**Note:** Our sitemap is automatically generated and includes:

- All published articles
- All category pages
- Static pages (homepage, articles list, search, about)

## Step 4: Submit robots.txt

Google will automatically discover your robots.txt file at:
`https://ariyadham.com/robots.txt`

Our robots.txt is configured to:

- Allow all search engines to crawl the site
- Block private areas (/api/, /admin/, /cms/, /unauthorized)
- Reference the sitemap location

## Step 5: Monitor Indexing Status

After submission, monitor your site's indexing:

1. Go to "Coverage" or "Pages" report
2. Check for any errors or warnings
3. Address any issues found

### Common Issues and Solutions

**Issue: Pages not indexed**

- Solution: Check robots.txt isn't blocking pages
- Solution: Ensure pages are linked from other pages
- Solution: Submit individual URLs for indexing

**Issue: "Discovered - currently not indexed"**

- Solution: Improve page quality and content
- Solution: Add more internal links to the page
- Solution: Be patient - Google will index when resources allow

**Issue: Duplicate content**

- Solution: Check canonical URLs are properly set
- Solution: Verify no duplicate pages exist

## Step 6: Enable Enhanced Features

### Rich Results Test

Test your structured data:

1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Enter a URL from your site (e.g., an article URL)
3. Review the structured data detected
4. Fix any errors or warnings

Our site includes structured data for:

- **Article/BlogPosting**: Article pages with author, publish date, image
- **WebSite with SearchAction**: Homepage with site search capability
- **Organization**: Company/organization information
- **BreadcrumbList**: Navigation hierarchy (where implemented)

### URL Inspection Tool

Check individual pages:

1. Enter any URL from your site in the search bar at the top
2. Click "Test Live URL" to see how Google sees the page
3. Review any issues and request indexing if needed

## Step 7: Set Up Email Notifications

1. Go to "Settings" → "Users and permissions"
2. Add email addresses for notifications
3. Enable alerts for:
   - Critical site issues
   - Manual actions
   - Security issues

## Step 8: Monitor Performance

Regularly check these reports:

### Performance Report

- Track search impressions, clicks, CTR, and position
- Filter by query, page, country, device
- Identify top-performing content

### Coverage Report

- Monitor indexed vs. excluded pages
- Address any errors or warnings
- Track new pages being discovered

### Core Web Vitals Report

- Monitor LCP, FID/INP, CLS scores
- Identify pages with poor performance
- Our Web Vitals dashboard: `/admin/performance`

### Mobile Usability Report

- Check for mobile-specific issues
- Ensure responsive design works correctly

## SEO Best Practices Implemented

✅ **Dynamic XML Sitemap**: Auto-updated with new content
✅ **Robots.txt**: Configured for optimal crawling
✅ **Canonical URLs**: Prevent duplicate content issues
✅ **Open Graph Tags**: Rich social media sharing
✅ **Twitter Cards**: Enhanced Twitter previews
✅ **Schema.org Markup**: Structured data for rich snippets
✅ **Meta Descriptions**: Under 160 characters for optimal display
✅ **Responsive Design**: Mobile-friendly layout
✅ **Performance Optimization**: Fast load times, Core Web Vitals

## Regular Maintenance Tasks

### Weekly

- Check for any critical errors in Coverage report
- Review new search queries in Performance report

### Monthly

- Analyze top-performing pages
- Identify opportunities for content optimization
- Check Core Web Vitals trends

### Quarterly

- Review overall search performance trends
- Update content strategy based on search data
- Audit structured data implementation

## Additional Resources

- [Google Search Central Documentation](https://developers.google.com/search/docs)
- [Schema.org Documentation](https://schema.org/)
- [Web.dev SEO Guide](https://web.dev/lighthouse-seo/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

## Troubleshooting

### Verification Issues

If verification fails:

1. Double-check DNS records or HTML tags
2. Wait for DNS propagation (up to 48 hours)
3. Try an alternative verification method
4. Check for typos in verification codes

### Sitemap Issues

If sitemap shows errors:

1. Test the sitemap URL directly in browser
2. Check sitemap format is valid XML
3. Ensure all URLs are accessible (200 status)
4. Verify no robots.txt blocks

### Indexing Delays

If pages aren't being indexed:

1. Check "Coverage" report for specific issues
2. Use URL Inspection tool to request indexing
3. Ensure pages have sufficient quality content
4. Add more internal links to new pages

## Support

For technical issues with the SEO implementation:

- Check `/docs/architecture.md` for technical details
- Review `/src/lib/seo/metadata.ts` for structured data generation
- See `/app/sitemap.ts` for sitemap configuration
- Check `/app/robots.ts` for robots.txt configuration

---

**Last Updated**: Story 7.3 implementation
**Maintained By**: Development Team
