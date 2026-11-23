# Tools dashboard account setup

All tools remain public. Google sign-in adds account bookmarks, removable likes, and a profile menu with photo, name, and email.

## 1. Create the account database

1. Create a project at https://supabase.com/dashboard.
2. Open SQL Editor and run `supabase/migrations/20261021_tool_accounts.sql` from this repository.
3. The migration creates private bookmarks, account likes, public aggregate counts, and a reserved subscription table.
4. Realtime is enabled only for aggregate counts. Personal rows are never broadcast.

## 2. Enable Google

1. Open Supabase Authentication > Sign In / Providers > Google.
2. Copy the callback URL shown there, normally `https://YOUR_PROJECT.supabase.co/auth/v1/callback`.
3. In https://console.cloud.google.com/, select or create a project.
4. Open Google Auth Platform. Configure Branding, Audience, and the consent screen.
5. Create a Web application OAuth client under Clients.
6. Add your production origin under Authorized JavaScript origins: `https://doitwithai.tools`.
7. Add the **Supabase callback URL** under Authorized redirect URIs. This is different from the website callback.
8. Copy the Google client ID and client secret into the Supabase Google provider settings. Enable the provider.
9. If Google consent remains in testing, add your test users. Publish the consent configuration when ready for public sign-in.
10. Request only basic sign-in identity: name, photo, and email. Search Console access is not required.

## 3. Configure return URLs

In Supabase Authentication > URL Configuration:

- Site URL: `https://doitwithai.tools`
- Redirect URL: `https://doitwithai.tools/auth/callback`
- Add `http://localhost:3000/auth/callback` for development.
- Add each trusted preview callback explicitly when testing Vercel previews.

The Google redirect points to Supabase. Supabase returns to the website callback. The website then restores the previous tool URL.

## 4. Add Vercel environment variables

Open the website project in Vercel > Settings > Environment Variables.

| Variable | Value | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | Public, protected by row policies |
| `SUPABASE_SECRET_KEY` | Supabase secret key, or legacy service role key | Server only |

Find keys in Supabase Project Settings > API Keys. Never prefix the secret key with `NEXT_PUBLIC_`.

Add variables to the intended Vercel environments. Redeploy after adding them because public configuration is bundled during build.

Do not paste Google secrets into public variables. Google credentials belong in the Supabase provider settings.

## 5. Verify before announcing sign-in

- Open `/tools` while signed out. Search, filters, tool pages, and local bookmarks must work.
- Sign in using Google. Check the profile photo, full name, and email.
- Save a tool, reload, and check another device using the same account.
- Use “Sync device bookmarks” to explicitly copy guest bookmarks into the account.
- Like a tool once, remove the like, and confirm its total changes.
- Check another browser session for aggregate count updates.
- Sign out. Account bookmarks must disappear; device bookmarks remain separate.
- Test a second account. It must not see the first account’s bookmarks.
- Cancel Google sign-in and confirm public tools remain available.

No tool text, uploaded files, or article content is stored by this account feature. Signing in navigates away from the current page, so copy any unsaved work first.

## Future paid plans

No payments or paid restrictions are enabled. The subscription table is reserved for a later billing integration.

Use verified payment webhooks to update subscriptions later. Never accept a plan value from editable profile metadata or a browser redirect.

## Troubleshooting

- Sign-in unavailable: confirm both public variables exist, then redeploy.
- Google redirect mismatch: use the callback copied from Supabase in Google Cloud.
- Returned to the wrong page: check Supabase’s redirect allowlist and the exact scheme, host, and path.
- Profile loads but saving fails: run the SQL migration and check the server-only secret variable.
- Counts do not refresh: verify `tool_stats` is enabled for Realtime. Refreshing the page still loads current counts.
- Account features fail: public tools remain accessible. Existing tool generation settings are separate.

References:
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Adding discovery categories later

`features/tool-catalog/registry.json` is the source of truth. Add a topic under `topics`, then reference its ID in each matching tool’s `topics` array.

A tool can belong to multiple topics and categories. Tags remain independently searchable. Empty topics stay hidden until a live tool uses them.

The sidebar, filters, counts, directory schema, and sitemap use this registry. Register new tool routes there when publishing them.
