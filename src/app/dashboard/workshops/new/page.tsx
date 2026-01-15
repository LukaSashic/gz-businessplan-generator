import { createClient } from '../../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateWorkshopForm } from '@/components/dashboard/create-workshop-form';

export default async function NewWorkshopPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Neuer Workshop</h1>
        <p className="mt-2 text-gray-600">
          Starten Sie einen neuen Businessplan-Workshop für Ihren
          Gründungszuschuss.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <CreateWorkshopForm userId={user.id} />
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">Was erwartet Sie?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Schritt-für-Schritt Coaching durch alle Module</li>
          <li>• Automatische Finanzplanung und Berechnungen</li>
          <li>• Professioneller Businessplan für die Arbeitsagentur</li>
          <li>• Optimiert für Tragfähigkeitsbescheinigung</li>
        </ul>
      </div>
    </div>
  );
}
