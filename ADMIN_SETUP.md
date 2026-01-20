# Admin Panel Setup Guide

## Overview

The admin panel allows authorized users to manually update gold and silver prices. This is useful when:
- The API fails to fetch prices
- You need to supersede the API price with a custom value
- You want to set prices for a specific date

## Features

- **Authentication**: Secure login system using Django authentication
- **Manual Price Updates**: Override API prices for any date
- **Dual Price Management**:
  - Retail prices (displayed to customers)
  - Arihant broker prices (reference prices)
- **Price Types**: 18kt, 22kt, 24kt gold and silver
- **Audit Trail**: Tracks who updated prices and when

## Initial Setup

### 1. Create Admin User

First, you need to create a Django superuser account:

```bash
# If using Docker:
docker-compose exec python-backend python manage.py createsuperuser

# If running locally:
cd backend/mjw_services
python manage.py createsuperuser
```

Follow the prompts to create:
- Username
- Email address (optional)
- Password

### 2. Run Migrations

The database migrations should run automatically via the entrypoint script. If needed, you can run them manually:

```bash
# If using Docker:
docker-compose exec python-backend python manage.py migrate

# If running locally:
cd backend/mjw_services
python manage.py migrate
```

## Accessing the Admin Panel

1. Navigate to: `http://localhost:3000/admin` (or your deployed URL)
2. Enter your username and password
3. Click "Login"

## Using the Admin Panel

### Updating Prices

1. **Select Date**: Choose the date for which you want to update prices (defaults to today)

2. **Enter Retail Prices**: Fill in the customer-facing prices:
   - 18kt Gold (₹ per gram)
   - 22kt Gold (₹ per gram)
   - 24kt Gold (₹ per gram)
   - Silver (₹ per gram)

3. **Enter Arihant Broker Prices**: Fill in the reference prices from Arihant:
   - 18kt Gold
   - 22kt Gold
   - 24kt Gold
   - Silver

4. Click **"Update Prices"** to save

### Refreshing Current Prices

Click the **"Refresh Current Prices"** button to load the latest prices from the database into the form.

### Logout

Click **"Logout"** in the header to end your session.

## How Manual Updates Work

- **Override API Prices**: Manual updates set the `is_manual_override` flag to `True` in the database
- **Immediate Effect**: Changes take effect immediately on the main website
- **Audit Trail**: Each update records:
  - Who made the update (`updated_by`)
  - When it was updated (`updated_at`)
  - Whether it's a manual override (`is_manual_override`)
- **Date-Specific**: Each update is tied to a specific date

## API Endpoints

The admin panel uses these backend endpoints:

- `POST /gold_rate_admin/admin/login/` - Login
- `POST /gold_rate_admin/admin/logout/` - Logout
- `GET /gold_rate_admin/admin/status/` - Check authentication status
- `POST /gold_rate_admin/admin/manual-rate/` - Update prices (requires authentication)
- `GET /gold_rate_admin/metal-rate/` - Get current prices (public)

## Security Notes

### Production Deployment

Before deploying to production, update these settings in `backend/mjw_services/mjw_services/settings.py`:

1. **Set DEBUG to False**:
   ```python
   DEBUG = False
   ```

2. **Use a strong SECRET_KEY**:
   ```python
   SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
   ```

3. **Configure specific CORS origins**:
   ```python
   CORS_ALLOW_ALL_ORIGINS = False
   CORS_ALLOWED_ORIGINS = [
       "https://yourdomain.com",
   ]
   ```

4. **Enable secure cookies**:
   ```python
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   ```

5. **Set allowed hosts**:
   ```python
   ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
   ```

### User Management

- Create limited admin users (non-superusers) if you only want them to update prices
- Use strong passwords
- Change passwords regularly
- Remove access for users who no longer need it

## Troubleshooting

### Login Issues

**Problem**: "Invalid credentials" error
- Verify username and password are correct
- Ensure the user account exists (check with `python manage.py shell`)
- Check that the backend is running

**Problem**: Session not persisting
- Ensure cookies are enabled in your browser
- Check CORS settings in Django settings
- Verify `CORS_ALLOW_CREDENTIALS = True` is set

### Update Issues

**Problem**: "Network error" when updating
- Verify the backend is running and accessible
- Check CORS configuration
- Look at browser console for specific error messages

**Problem**: Prices not updating
- Ensure you're logged in
- Check that migrations have been run
- Verify the database is accessible

### Database Migration Issues

**Problem**: Migration fails
- Check database connection
- Ensure no duplicate migrations exist
- Try running migrations manually with verbose output:
  ```bash
  python manage.py migrate --verbosity 3
  ```

## Development

### Testing Locally

1. Start all services:
   ```bash
   docker-compose up
   ```

2. Create a superuser (if not already done):
   ```bash
   docker-compose exec python-backend python manage.py createsuperuser
   ```

3. Access the admin panel:
   ```
   http://localhost:3000/admin
   ```

### Backend Development

The admin API is located in:
- Views: `backend/mjw_services/gold_rate_admin/views.py`
- URLs: `backend/mjw_services/gold_rate_admin/urls.py`
- Models: `backend/mjw_services/gold_rate_admin/models.py`

### Frontend Development

The admin UI is located in:
- `frontend/src/pages/admin.tsx`

## Support

For issues or questions:
1. Check the application logs: `docker-compose logs python-backend`
2. Review this documentation
3. Contact the system administrator
