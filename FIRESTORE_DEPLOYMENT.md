# Firestore Security Rules Deployment Guide

## Overview
This guide explains how to deploy the Firestore security rules to your Firebase project.

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Logged into Firebase (`firebase login`)
- Project initialized (`firebase init firestore`)

## Deployment Steps

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)
```bash
firebase init firestore
```
- Select your project: `replybot25`
- Use existing rules: No
- Rules file: `firestore.rules`

### 4. Deploy the security rules
```bash
firebase deploy --only firestore:rules
```

## Alternative: Deploy via Firebase Console

### 1. Go to Firebase Console
- Navigate to [Firebase Console](https://console.firebase.google.com/)
- Select your project: `replybot25`

### 2. Navigate to Firestore
- Click on "Firestore Database" in the left sidebar
- Click on "Rules" tab

### 3. Copy and paste the rules
- Copy the contents of `firestore.rules`
- Paste into the rules editor
- Click "Publish"

## Testing the Rules

After deployment, you can test the security rules using the SecurityRulesTest component in the dashboard:

1. Navigate to `/dashboard` in your web app
2. Click "Run Security Rules Test"
3. Review the test results to ensure:
   - Users can access their own data
   - Users cannot access other users' data
   - Data validation is working
   - Business profiles and prompts are properly secured

## Rules Summary

The deployed rules ensure:

✅ **User Data Isolation**: Users can only access their own data
✅ **Business Profile Security**: Users can only manage their own business profiles
✅ **Prompt Security**: Users can only manage their own prompts
✅ **Data Validation**: All data is validated before storage
✅ **Admin Access**: Admins and support can access all data
✅ **Default Deny**: All unmatched paths are denied by default

## Troubleshooting

### Common Issues:
1. **Rules not updating**: Clear browser cache and restart the app
2. **Permission denied errors**: Check that the rules are properly deployed
3. **Validation errors**: Ensure data structure matches the validation rules

### Verify Deployment:
```bash
firebase firestore:rules:get
```

This should return the current deployed rules.

## Security Best Practices

- Never expose admin tokens in client-side code
- Regularly review and update security rules
- Test rules with various user scenarios
- Monitor Firestore usage for unusual patterns
- Keep rules simple and maintainable
