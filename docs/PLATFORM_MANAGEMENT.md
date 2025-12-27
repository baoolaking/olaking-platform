# Platform Management Guide

## Overview

The platform supports all social media platforms defined in the database enum, allowing admins to add services for any platform even if no services currently exist for that platform.

## Available Platforms

The system supports the following platforms (defined in `platform_enum`):

- **TikTok** (`tiktok`)
- **Instagram** (`instagram`) 
- **Facebook** (`facebook`)
- **YouTube** (`youtube`)
- **X (Twitter)** (`x`)
- **WhatsApp** (`whatsapp`)
- **Telegram** (`telegram`)

## Admin Platform Management

### Adding Services for New Platforms

Admins can add services for any platform from the predefined enum through the Admin Services page:

1. Navigate to **Admin → Services**
2. Click **"Add Service"**
3. Select any platform from the dropdown (all enum platforms are available)
4. Choose a service type appropriate for that platform
5. Set pricing and other details
6. Save the service

### Platform Display Logic

- **User Interface**: All platforms from the enum are displayed in the platform tabs, even if they have no services yet
- **Empty State**: Platforms without services show a "coming soon" message with contact information
- **Search**: Users can search for platforms even if they don't have services yet

## Platform Service Types

Each platform supports different service types as defined in the PRD:

### TikTok
- Followers, Video Likes, Video Views, Video Shares, Custom Comments, Video Saves

### Instagram  
- Followers, Post Likes, Video/Reel Views, Custom Comments, Story Views

### YouTube
- Subscribers, Likes, Video Views, Custom Comments

### X (Twitter)
- Followers, Comments, Likes, Repost

### Telegram
- Group/Channel Members, Post Views (Last 20 Days), Post Views (Specific), Reaction (Specific), Reaction (Last 20 Days)

### Facebook
- Followers, Page Likes, Video/Reel Views, Post Shares, Post Likes

### WhatsApp
- (Service types to be defined based on business requirements)

## Technical Implementation

### Database Schema
- Platforms are stored as `platform_enum` in the database
- Services reference platforms via foreign key constraint
- All platforms in the enum are valid, regardless of existing services

### Frontend Components
- `PlatformTabs` component shows all enum platforms
- Empty states are handled gracefully for platforms without services
- Search functionality works across all platforms

## Best Practices

1. **Gradual Rollout**: Add services for new platforms gradually based on demand
2. **Quality Control**: Ensure service types match platform capabilities
3. **User Communication**: Use clear messaging for platforms without services
4. **Admin Training**: Ensure admins understand which service types work for each platform

## Future Enhancements

- Dynamic service type validation based on platform
- Platform-specific service configuration
- Bulk service creation for new platforms
- Platform analytics and usage tracking