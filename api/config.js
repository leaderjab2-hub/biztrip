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

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
    hasSupabaseAnonKey: Boolean(supabaseAnonKey),
  });
}
