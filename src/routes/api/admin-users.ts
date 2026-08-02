import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type InviteRequestBody = {
  email?: string;
  fullName?: string;
  org?: string;
  role?: string;
  mode?: "invite" | "create";
  password?: string;
};

type DeleteRequestBody = {
  userId?: string;
};

async function authenticateAdmin(request: Request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized: Missing or invalid authorization header", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return { error: "Unauthorized: Empty token", status: 401 };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { error: "Server Supabase configuration missing", status: 500 };
  }

  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await client.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { error: "Unauthorized: Invalid or expired token", status: 401 };
  }

  const callerId = userData.user.id;

  // Use service role if available, otherwise RLS-enabled client with bearer
  const adminDb = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? supabaseAdmin
    : createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

  const { data: adminRole, error: roleErr } = await adminDb
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleErr || !adminRole) {
    return { error: "Forbidden: Admin platform role is required to manage users", status: 403 };
  }

  return { callerId, adminDb, token, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };
}

export const Route = createFileRoute("/api/admin-users")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authResult = await authenticateAdmin(request);
        if ("error" in authResult) {
          return new Response(JSON.stringify({ error: authResult.error }), {
            status: authResult.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { adminDb, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = authResult;
        const body = (await request.json().catch(() => ({}))) as InviteRequestBody;

        const email = (body.email || "").trim();
        const fullName = (body.fullName || "").trim();
        const org = (body.org || "Agrofeed Global").trim();
        const role = (body.role || "member").trim();
        const mode = body.mode === "create" ? "create" : "invite";

        const generateSecurePassword = () => {
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
          let pwd = "Agro-";
          for (let i = 0; i < 8; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return pwd;
        };

        const generatedPassword = (body.password || "").trim() || generateSecurePassword();

        if (!email || !email.includes("@")) {
          return new Response(JSON.stringify({ error: "A valid email address is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        let createdUser: { id: string; email?: string } | null = null;
        let modeUsed = mode;
        let authErrorMsg: string | null = null;

        const origin =
          request.headers.get("origin") ||
          request.headers.get("referer")?.replace(/\/.*$/, "") ||
          "http://localhost:5173";

        // Try using Supabase Service Role Admin API if available
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          if (mode === "invite") {
            const { data: inviteData, error: inviteErr } =
              await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: {
                  full_name: fullName,
                  org: org,
                  must_reset_password: true,
                },
                redirectTo: origin,
              });

            if (inviteErr) {
              authErrorMsg = inviteErr.message;
              // Fallback to createUser if invite email sending failed
              const { data: createData, error: createErr } =
                await supabaseAdmin.auth.admin.createUser({
                  email,
                  password: generatedPassword,
                  email_confirm: true,
                  user_metadata: {
                    full_name: fullName,
                    org: org,
                    must_reset_password: true,
                  },
                });
              if (createErr) {
                return new Response(
                  JSON.stringify({
                    error: `Invite failed (${inviteErr.message}) and direct creation failed: ${createErr.message}`,
                  }),
                  { status: 400, headers: { "Content-Type": "application/json" } },
                );
              }
              createdUser = createData.user;
              modeUsed = "create";
            } else {
              createdUser = inviteData.user;
            }
          } else {
            // mode === "create"
            const { data: createData, error: createErr } =
              await supabaseAdmin.auth.admin.createUser({
                email,
                password: generatedPassword,
                email_confirm: true,
                user_metadata: {
                  full_name: fullName,
                  org: org,
                  must_reset_password: true,
                },
              });
            if (createErr) {
              return new Response(JSON.stringify({ error: createErr.message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }
            createdUser = createData.user;
          }
        } else {
          // Local development fallback: sign up on a stateless server client
          const tempClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({
            email,
            password: generatedPassword,
            options: {
              data: {
                full_name: fullName,
                org: org,
                must_reset_password: true,
              },
            },
          });
          if (signUpErr) {
            return new Response(JSON.stringify({ error: signUpErr.message }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          createdUser = signUpData.user;
          modeUsed = "create";
        }

        if (!createdUser) {
          return new Response(JSON.stringify({ error: "Failed to create or invite user" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Ensure profiles table has the updated full_name, org, and must_reset_password
        const { error: profileErr } = await adminDb.from("profiles").upsert({
          id: createdUser.id,
          full_name: fullName,
          org: org,
          must_reset_password: true as never,
        });
        if (profileErr) {
          console.error("Failed to upsert profile:", profileErr.message);
        }

        // Assign default member role if not present
        await adminDb.from("user_roles").upsert(
          {
            user_id: createdUser.id,
            role: "member" as any,
          },
          { onConflict: "user_id,role" },
        );

        // Assign additional requested role if it differs from member
        if (role && role !== "member") {
          await adminDb.from("user_roles").upsert(
            {
              user_id: createdUser.id,
              role: role as any,
            },
            { onConflict: "user_id,role" },
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: createdUser.id,
              email,
              full_name: fullName,
              org,
              role,
            },
            generatedPassword,
            mustResetPassword: true,
            modeUsed,
            note: authErrorMsg
              ? `Note: Email invite failed (${authErrorMsg}), so account was created directly.`
              : undefined,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },

      DELETE: async ({ request }) => {
        const authResult = await authenticateAdmin(request);
        if ("error" in authResult) {
          return new Response(JSON.stringify({ error: authResult.error }), {
            status: authResult.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { callerId, adminDb } = authResult;
        const body = (await request.json().catch(() => ({}))) as DeleteRequestBody;
        const userId = (body.userId || "").trim();

        if (!userId) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (userId === callerId) {
          return new Response(JSON.stringify({ error: "You cannot remove your own admin account." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Delete user roles and profile first
        await adminDb.from("user_roles").delete().eq("user_id", userId);
        const { error: profErr } = await adminDb.from("profiles").delete().eq("id", userId);

        if (profErr) {
          return new Response(JSON.stringify({ error: profErr.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // If service role key is present, remove from auth.users completely
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        }

        return new Response(JSON.stringify({ success: true, removedUserId: userId }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
