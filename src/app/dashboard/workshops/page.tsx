import { createClient } from '../../../../lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Trash2 } from 'lucide-react';
import { WorkshopCard } from '@/components/dashboard/workshop-card';
import { DeleteWorkshopButton } from '@/components/dashboard/delete-workshop-button';

export default async function WorkshopsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all user's workshops
  const { data: workshops, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meine Workshops</h1>
          <p className="mt-2 text-gray-600">
            Verwalten Sie Ihre Businessplan-Workshops
          </p>
        </div>
        <Link href="/dashboard/workshops/new">
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Neuer Workshop
          </Button>
        </Link>
      </div>

      {/* Workshop Grid */}
      {workshops && workshops.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="relative">
              <Link href={`/workshop/${workshop.id}`}>
                <div className="block cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {workshop.business_name || 'Unbenannt'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Erstellt am{' '}
                        {new Date(workshop.created_at).toLocaleDateString(
                          'de-DE'
                        )}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                      <span>Fortschritt</span>
                      <span>0%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      In Bearbeitung
                    </span>
                  </div>
                </div>
              </Link>

              {/* Delete Button */}
              <div className="absolute right-4 top-4">
                <DeleteWorkshopButton workshopId={workshop.id} />
              </div>
            </div>
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
  );
}
