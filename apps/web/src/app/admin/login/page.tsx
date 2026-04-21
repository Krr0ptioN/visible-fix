import { redirect } from 'next/navigation';

export default async function AdminLoginPage() {
  redirect('/sign-in?next=%2Fadmin');
}
