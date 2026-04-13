import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.role) {
    redirect("/auth/login");
  }

  if (profile.role === "owner") {
    redirect("/dashboard/owner");
  }
  if (profile.role === "admin") {
    redirect("/admin");
  }

  redirect("/dashboard/customer");
}
