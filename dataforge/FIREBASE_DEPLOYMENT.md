# Firebase Hosting Deployment Guide

## Production URL
**https://dataforge-f3a63.web.app**

## Quick Deployment Commands

### Deploy Everything
```bash
npm install
npm run build
firebase deploy
```

### Deploy Only Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Deploy Only Firestore Rules
```bash
firebase deploy --only firestore
```

### Preview Deployment (test before production)
```bash
npm run build
firebase hosting:channel:deploy my-feature
# View URL in output, test it
# When ready, promote to production:
firebase hosting:channel:promote my-feature
```

## Initial Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Set Environment Variables**
   Create `.env` file with:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyDSAlOWtOm8lKFwUcaKbqr20lfE4x0f-qw
   VITE_FIREBASE_AUTH_DOMAIN=dataforge-f3a63.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=dataforge-f3a63
   VITE_FIREBASE_STORAGE_BUCKET=dataforge-f3a63.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=89877466507
   VITE_FIREBASE_APP_ID=1:89877466507:web:51009f1adb8a047344338e
   VITE_FIREBASE_MEASUREMENT_ID=G-NHKRSCYYZ5
   VITE_ADMIN_EMAILS=admin@yourdomain.com
   ```

3. **Add Authorized Domains**
   Firebase Console → Authentication → Settings → Authorized Domains
   - Add: `dataforge-f3a63.web.app`
   - Add: `dataforge-f3a63.firebaseapp.com`
   - Add: `localhost` (for local dev)

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## Troubleshooting

### Sign-In Error: "auth/unauthorized-domain"
**Solution:** Add the domain to Authorized Domains in Firebase Console:
- Go to Authentication → Settings → Authorized Domains
- Add the domain showing in the error
- Wait 5 minutes for propagation
- Hard refresh browser (Ctrl+Shift+R)

### Build Fails
```bash
# Clear cache and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### Deployment Fails
```bash
# Check Firebase status
firebase status

# Re-authenticate if needed
firebase logout
firebase login

# Try deployment again
firebase deploy
```

## Environment Variables

For Firebase Hosting environment variables in production, you have two options:

1. **Use local .env** (recommended for development)
   - File is sourced during `npm run build`
   - Production build includes values

2. **Set in Firebase Console** (for sensitive variables)
   - Firebase Console → Project Settings → Build Functions
   - Runtime Environment Variables (for Cloud Functions only)

## File Structure

```
dataforge/
├── .env                  ← Environment variables (gitignored)
├── .env.example          ← Template for .env
├── firebase.json         ← Firebase config (hosting, firestore)
├── .firebaserc           ← Firebase project reference
├── src/                  ← React source code
├── dist/                 ← Production build (created by npm run build)
├── package.json
├── vite.config.js
└── README.md
```

## Key Files

- **firebase.json**: Hosts configuration
  - `"public": "dist"` - Points to Vite build output
  - `"rewrites"` - SPA route handling
  
- **src/firebase/config.js**: Firebase initialization
  - Uses `VITE_*` environment variables
  - Initializes Auth, Firestore, Analytics

- **.env**: Development environment variables
  - Vite loads variables with `VITE_` prefix
  - Never commit this file

## Monitoring

### View Deployment History
```bash
firebase hosting:versions:list
```

### View Current Status
```bash
firebase status
```

### Enable Logging
```bash
firebase deploy --debug
```

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vite Documentation](https://vitejs.dev/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
