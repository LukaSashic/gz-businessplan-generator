import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkshopCanvas from './components/workshop-canvas';

export const metadata: Metadata = {
  title: 'Workshop | GZ Businessplan Generator',
  description: 'Interaktiver Workshop zur Erstellung Ihres Businessplans',
};

interface WorkshopPageProps {
  params: {
    id: string;
  };
}

async function getWorkshop(id: string) {
  const supabase = await createClient();

  const { data: workshop, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !workshop) {
    return null;
  }

  return workshop;
}

export default async function WorkshopPage({ params }: WorkshopPageProps) {
  const { id } = await params;
  const workshop = await getWorkshop(id);

  if (!workshop) {
    notFound();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <WorkshopCanvas workshop={workshop} />
    </div>
  );
}
