import { LoginPageClient } from './LoginPageClient';

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams.next || '/upload';

  return <LoginPageClient nextPath={nextPath} />;
}
