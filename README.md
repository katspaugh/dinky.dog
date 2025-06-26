# SpaceNotes

Shareable diagrams with real-time collaboration

<img width="300" src="https://github.com/katspaugh/dinky.dog/assets/381895/daf42772-3058-47b9-9956-7e5bf0291afa">

## Running locally

1. Checkout the repo
2. Start a local web server, e.g. `python3 -m http.server --cgi 8080`
3. Open http://localhost:8080/ in the browser

## Supabase configuration

1. Create environment variables `.env` with your project credentials:

   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. In Supabase, create a table **documents** with the following columns:
   - `id` (text, primary key)
   - `data` (text)
   - `password` (text)
   - `user_id` (uuid, references `auth.users`)

3. Enable Row Level Security for the table and add a policy:
   `user_id = auth.uid()`.

4. Create a public storage bucket named **images**.

5. Deploy an Edge Function called **generate-link-preview** that accepts `{ url }` in the
   body and returns preview information.

Authentication with email/password is enabled via the Supabase dashboard. The
app wraps all React components in `SessionContextProvider` and uses the Supabase
client from `src/lib/supabase.ts`.


<img alt="Screenshot" src="https://github.com/katspaugh/dinky.dog/assets/381895/e75910b9-82a9-4157-ac32-3733e93a65bb">
