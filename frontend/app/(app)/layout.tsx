import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./_components/SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF7F2" }}>
      <nav
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#1A1714",
                padding: "2px 8px",
                borderRadius: 20,
                letterSpacing: "0.02em",
              }}
            >
              Faliam
            </span>
          </div>
          <Link
            href="/qualify"
            style={{ fontSize: 14, color: "#4A4540", textDecoration: "none", fontWeight: 500 }}
          >
            Qualify
          </Link>
          <Link
            href="/history"
            style={{ fontSize: 14, color: "#4A4540", textDecoration: "none", fontWeight: 500 }}
          >
            History
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, color: "#9C9490" }}>{user.email}</span>
          <SignOutButton />
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
