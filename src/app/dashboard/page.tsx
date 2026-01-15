import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's workshops
  const { data: workshops } = await supabase
    .from('workshops')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Willkommen zurück!</h1>
        <p className="mt-2 text-gray-600">
          Hier ist eine Übersicht über Ihre Businessplan-Workshops.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/dashboard/workshops/new">
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Neuer Workshop
          </Button>
        </Link>
      </div>

      {/* Recent Workshops */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Letzte Workshops
        </h2>

        {workshops && workshops.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <Link
                key={workshop.id}
                href={`/workshop/${workshop.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {workshop.title || workshop.business_name || 'Unbenannt'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Erstellt am{' '}
                      {new Date(workshop.created_at).toLocaleDateString(
                        'de-DE'
                      )}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>

                {/* Progress indicator */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Fortschritt</span>
                    <span>0%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Noch keine Workshops
            </h3>
            <p className="mt-2 text-gray-600">
              Erstellen Sie Ihren ersten Businessplan-Workshop.
            </p>
            <Link href="/dashboard/workshops/new">
              <Button className="mt-4">Jetzt starten</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
