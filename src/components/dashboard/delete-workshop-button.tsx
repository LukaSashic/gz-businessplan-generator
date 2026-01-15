'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

interface DeleteWorkshopButtonProps {
  workshopId: string;
}

export function DeleteWorkshopButton({
  workshopId,
}: DeleteWorkshopButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to workshop
    e.stopPropagation();

    if (!confirm('Möchten Sie diesen Workshop wirklich löschen?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;

      router.refresh(); // Refresh to show updated list
    } catch (error) {
      console.error('Error deleting workshop:', error);
      alert('Fehler beim Löschen des Workshops.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Workshop löschen"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
