import { LoginForm } from "@/components/auth/auth-forms";
import { safeNextPath } from "@/lib/validations/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const error = typeof params.error === "string" ? params.error : undefined;
  return <LoginForm next={next} error={error} />;
}
