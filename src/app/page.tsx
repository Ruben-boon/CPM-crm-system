import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/api/auth/signin');
  return null;
}
