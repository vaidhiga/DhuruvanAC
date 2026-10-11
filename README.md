# AC Business Website

A production-ready AC sales and service website for a local business, designed for mobile-first customers and ready for Render deployment.

## Features

- AC product catalog with filters
- Service booking form with validation
- Purchase quote form with validation
- SQLite booking storage with generated booking IDs
- Admin dashboard at `/admin` for booking status updates
- WhatsApp click-to-chat support
- Contact details, map link and working hours
- Responsive layout
- SEO-friendly structure
- Configurable business data placeholders

## Project structure

- `src/pages` — website pages
- `src/css` — styles
- `src/js` — interactive logic and validation
- `src/data` — business, products, services, reviews and FAQ data
- `server` — lightweight Express server
- `data/bookings.db` — local SQLite database created automatically on first run
- `.env.example` — environment variable template

Bookings begin with `new` status and can be changed to `confirmed`, `scheduled`, `completed` or `cancelled` from the admin dashboard.

## Configuration

Update the placeholders in:

- `.env.example` (server config)
- `src/data/business.js` (site business info)

Replace values such as:

- BUSINESS_NAME
- OWNER_NAME
- PHONE_NUMBER
- WHATSAPP_NUMBER
- ADDRESS
- GOOGLE_MAPS_URL
- OPENING_HOURS
- SERVICE_AREAS

## WhatsApp integration

This project uses WhatsApp click-to-chat by default:

- `https://wa.me/<number>`
- Pre-filled text can be generated through the front-end logic

This avoids backend API credentials for the first version. If you later want official WhatsApp Business API automation, you will need a WhatsApp Business account, backend credentials, and server-side setup.

## Render deployment

1. Push this project to GitHub.
2. In Render, choose New Web Service.
3. Connect the GitHub repository.
4. Set the build command to: `npm install`
5. Set the start command to: `npm start`
6. Add environment variables from `.env.example` as needed.
7. Deploy the service.

The SQLite file must be stored on a persistent Render disk, or replaced with a managed database such as PostgreSQL, otherwise bookings can be lost when the service restarts or redeploys.

## Production notes

- Keep secrets only in environment variables.
- Use validated user inputs.
- Do not add API secrets inside browser JavaScript.
- Replace placeholder business details before going live.
