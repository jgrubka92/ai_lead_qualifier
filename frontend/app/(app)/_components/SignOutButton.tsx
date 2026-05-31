"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: "none",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 6,
        padding: "5px 12px",
        fontSize: 13,
        color: "#6B6460",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      Sign out
    </button>
  );
}
