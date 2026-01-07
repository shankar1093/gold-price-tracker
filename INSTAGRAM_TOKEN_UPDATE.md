# Instagram Access Token Update Guide

## Current Token
The Instagram access token has been updated to support the Instagram photo gallery feature.

## For Local Development

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Instagram credentials:
   - `INSTAGRAM_ACCESS_TOKEN`: Your Instagram Graph API access token
   - `INSTAGRAM_USER_ID`: Your Instagram Business/Creator account user ID

3. The token is already configured in the `.env` file for local development.

## For Production (GitHub Secrets)

To update the Instagram access token in production:

1. Go to your GitHub repository settings
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Update the following secrets:
   - `INSTAGRAM_ACCESS_TOKEN`: Set to your new Instagram access token
   - `INSTAGRAM_USER_ID`: Set to your Instagram user ID

4. After updating the secrets, the next deployment will automatically use the new token.

## Token Information

- **Current Token**: `IGQWRhajh5ZAzBlVnczR0hYTHo2SGpzQjZAlS09aRXFUNF9WTGJ3TXVXelotODdGOVRGb0Vwc1hydENqeFVPelBMUXJNMU5KdDFRd0tacDNxcXBMTVFUYlJzeUV4X1hQYndBeFpuRWxkY29HY3VkV3pLckhUNWF2V3cZD`
- **Usage**: Used in `frontend/src/pages/api/instagram_photos.tsx` to fetch Instagram media

## Token Expiration

Instagram access tokens typically expire after 60 days. Make sure to refresh your token before it expires to prevent service interruptions.

### How to Generate a New Token

1. Go to the [Facebook Developers](https://developers.facebook.com/) portal
2. Navigate to your app
3. Go to **Tools** → **Graph API Explorer**
4. Generate a new User Access Token with `instagram_basic` and `instagram_content_publish` permissions
5. Exchange the short-lived token for a long-lived token using the token exchange endpoint
6. Update the token using the instructions above
