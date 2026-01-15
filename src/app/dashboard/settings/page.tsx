import { createClient } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/dashboard/profile-form';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-2 text-gray-600">
          Verwalten Sie Ihr Profil und Ihre Kontoeinstellungen.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Profil bearbeiten
        </h2>
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  );
}
