// Editing writes straight to production data, so it ships only with `next dev`. The API also
// registers its write routes only on a local server, because the service token is public.
export const LOCAL_EDIT_ENABLED = process.env.NODE_ENV === "development";
