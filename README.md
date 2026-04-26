# Luxe Market Bot — Deployment Guide

## Files in this folder
- `index.js` — the bot server
- `package.json` — dependencies

---

## Step 1 — Upload to GitHub

1. Go to github.com and create a FREE account if you don't have one
2. Click "New repository"
3. Name it: `luxe-market-bot`
4. Set it to **Private**
5. Click "Create repository"
6. Upload both files: `index.js` and `package.json`

---

## Step 2 — Deploy on Railway

1. Go to railway.app and sign up with your GitHub account
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Select `luxe-market-bot`
5. Click "Deploy Now"

---

## Step 3 — Add Environment Variables

In Railway, go to your project → "Variables" tab → add these:

| Key | Value |
|-----|-------|
| `BOT_TOKEN` | `8676444461:AAHVawMMoCMlrJC4x1uw2btHtNNsPq_da5Q` |
| `FIREBASE_CREDENTIALS` | *(paste the entire JSON on one line — see below)* |

### How to format FIREBASE_CREDENTIALS:
Paste this entire block as the value (it's your service account key as one line):
```
{"type":"service_account","project_id":"luxe-market-91d12","private_key_id":"ff621ac7584201e805b4215ede747ced477919e8","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnpIR01sZtniAX\nIpGIGebBi0VxQ4Q/8FoCG8KJNbe6Rx7e3iMlJA6lgJ9jOpj4K/uJPlaipD+hIRPj\n1irXLvKCz3zzrrkQmK4XV4j3a+z9/Q/49O9b/i7Zp00pn6i1r8scbx0F8XktwUv8\neM7fkvwDSmtTgfselSZvg8iU19Lw+u/a1jB2YgRJ1q1nyDZY0NgjFmaZcOjvqN5t\noEzAv594MH+4OnWl0vwpzRGKyJ6LRYDDAJ2hckEvjuzos4G15AWuaUFVwqHsJHex\nCkW7yIEJz/nbLoqvsEVmSkn4ZnrDg5YbtXB4c3w+t7ug07DAS1BtBHrj3JQrQs0s\nlYvNhOtVAgMBAAECggEAJCBfXA2HAt+PZ6xHgC9x8qty2BhMjuBAWWXU8CtFjTK8\nWMvSNV+rPRqTQRmJc+MAJsZnIpR1K/8JqBXltoum3MnZVfPg/vqg5BkNznCxlGcc\nT5p7niBFVEKoYR56ZGOXTMbzgtLHMGCeJjD9Kpc04JqBpJN4A6wFQ40NAlGqn1Rn\ng+F0pTdPGzEUYipwRTfVi3IZAvUwzmEcuGbw99E0n13wPV6FeDhJJqr3gC3tsweS\nyDVirCVGa8JY9eOAVtoIQ8dXzEq814a7qPS5PvN3UcWSWDBco4jVV6n+DyICn6gL\n2rI+KIT/qZ8o4mSIS2JAE2PxhjtQK4qUss3TpqzTPQKBgQD8jG7ZxRG6vNfRUNxl\nauyhBnwstPyNOkLqtyXLceNuecQk8TMhGhYpaMCeqEWsgMOy5ZFW0U8PsHkYpyQ+\nDlc/Za9v1weQaRF8wjnijLD8sT4H2qwz27UUaOemO3Leh9+k2MB0yEKdtd1CrO2U\nyWLr1lEKyxzRA30CIPduJG6aKwKBgQDqzvFhsj3R6pCD/rSnIqMADXVSPHZ30k3O\nAUaZe+OrVN6gX7fJZOWKHtg/aSAj4nNupMznP1haUkIEo9SWUvVqcYLm6z5iOu0H\ntuApYoT9A5CqP/WOqMOkMOwtPXacBBIPGS1Q+jluPFdEMObRgOAKev/BsZYzPfHr\nRULvb+tQfwKBgGf130Ph7dRzHFxb7v4Ir/PxWXiF4Fi6nQVF81b2QOsfUPDsIWIE\n/Q56wqANIPFL6ENiYRvd+a+5s3/EfhTVjnDYiQl++OwndD1pLq7lv42l4KUXDUAj\ntzz5mjJB0p1sTVHsr/zi2xlU3gouaXaQGBqBFMdeqTQZPYJ8054RfT4VAoGAD0YM\nz4UPnmL6qYtc5u5K2gsGEaZbMmoco4TTudIkOhXYMWhohRIqGDTvbhiBfbQSPCU+\nKuCk96MYJkMd5fVZf2YI1MqCkVMx7emIZUjCS876jwiACZqSt1BzXHH+ECH3psHF\nf9n2+GO2bXoc2Y3fhO8BSfEqSwUBgoNL2lVWYjMCgYEA58R2RosjHifRxHmRbYw2\nfaf7BGruB0SHZfuIDktIlGtKiTjs4iEkO8DzAiV333pmM3ygJ3lQJs+B+vIbtB8p\ndCQpK9Hskc9/LWOGu17h/VV2URlr6SIM/g7vP6fwFc/nZ8n/J63nBPTnqNsRdA68\n0kIeY4cP1Ctah5uYVxvNm3k=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@luxe-market-91d12.iam.gserviceaccount.com","client_id":"114954547436632494786","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40luxe-market-91d12.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

---

## Step 4 — Get your Railway URL

1. In Railway click your project → "Settings" tab
2. Under "Domains" click "Generate Domain"
3. Copy the URL — looks like: `https://luxe-market-bot-production.up.railway.app`

---

## Step 5 — Register Webhook with Telegram

Open your browser and visit this URL (replace YOUR_RAILWAY_URL):

```
https://api.telegram.org/bot8676444461:AAHVawMMoCMlrJC4x1uw2btHtNNsPq_da5Q/setWebhook?url=YOUR_RAILWAY_URL/webhook
```

Example:
```
https://api.telegram.org/bot8676444461:AAHVawMMoCMlrJC4x1uw2btHtNNsPq_da5Q/setWebhook?url=https://luxe-market-bot-production.up.railway.app/webhook
```

You should see: `{"ok":true,"result":true}`

---

## Your bot is LIVE! 🎉

Go to Telegram and open @luxe_market_store_bot and type /start
