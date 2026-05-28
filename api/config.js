export default function handler(req, res) {
  const supabaseUrl =
    process.env.BIZTRIP_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://apfbqpembzexbphpbvyv.supabase.co";

  const supabaseAnonKey =
    process.env.BIZTRIP_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  const googleMapsApiKey =
    process.env.BIZTRIP_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "";

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
    googleMapsApiKey,
    hasSupabaseAnonKey: Boolean(supabaseAnonKey),
    hasGoogleMapsApiKey: Boolean(googleMapsApiKey),
  });
}
