import { LoginForm } from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams?.next;
  const nextPath = typeof raw === "string" && raw.startsWith("/") ? raw : "/";

  return <LoginForm nextPath={nextPath} />;
}

