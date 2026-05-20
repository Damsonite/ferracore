import { createAdminClient, getCurrentSession } from "../utils/admin-portal";
import { validateEmail, validatePassword } from "../utils/validators";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("auth-message");
const submitButton = document.getElementById("login-button");

function showMessage(text: string, type: "error" | "success" = "error") {
  if (!message) return;

  message.textContent = text;
  message.classList.remove(
    "hidden",
    "border-red-200",
    "bg-red-50",
    "text-red-800",
    "border-green-200",
    "bg-green-50",
    "text-green-800",
  );
  message.classList.add(
    type === "success" ? "border-green-200" : "border-red-200",
    type === "success" ? "bg-green-50" : "bg-red-50",
    type === "success" ? "text-green-800" : "text-red-800",
  );
}

if (!supabaseUrl || !supabaseKey) {
  showMessage("Falta la configuración pública de Supabase en el navegador.");
  throw new Error("Missing Supabase public environment variables");
}

const client = createAdminClient(supabaseUrl, supabaseKey);

const session = await getCurrentSession(client);

if (session) {
  window.location.href = "/admin";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = String(emailInput?.value ?? "").trim();
  const password = String(passwordInput?.value ?? "");

  const emailError = validateEmail(email);
  if (emailError) {
    showMessage(emailError.message);
    return;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    showMessage(passwordError.message);
    return;
  }

  submitButton?.setAttribute("disabled", "true");
  showMessage("Validando credenciales...", "success");

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    submitButton?.removeAttribute("disabled");
    showMessage(error.message || "No se pudo iniciar sesión");
    return;
  }

  window.location.href = "/admin";
});
