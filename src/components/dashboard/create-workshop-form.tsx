'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '../../../lib/supabase/client';

interface CreateWorkshopFormProps {
  userId: string;
}

export function CreateWorkshopForm({ userId }: CreateWorkshopFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create new workshop
      const { data: workshop, error } = await supabase
        .from('workshops')
        .insert({
          user_id: userId,
          title: formData.business_name, // Required field
          description: formData.business_description || null,
          business_name: formData.business_name,
          status: 'in_progress',
          current_module: 'gz-intake',
          data: {},
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Redirect to the workshop
      router.push(`/dashboard/workshop/${workshop.id}`);
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error message:', error?.message);

      alert(`Fehler: ${error?.message || 'Unbekannter Fehler'}`);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div>
        <label
          htmlFor="business_name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Geschäftsname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="business_name"
          required
          value={formData.business_name}
          onChange={(e) =>
            setFormData({ ...formData, business_name: e.target.value })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Mustermann Consulting"
        />
        <p className="mt-1 text-xs text-gray-500">
          Der Name Ihres geplanten Unternehmens
        </p>
      </div>

      {/* Business Description */}
      <div>
        <label
          htmlFor="business_description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Kurzbeschreibung (optional)
        </label>
        <textarea
          id="business_description"
          rows={4}
          value={formData.business_description}
          onChange={(e) =>
            setFormData({ ...formData, business_description: e.target.value })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Beschreiben Sie kurz Ihre Geschäftsidee..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Was möchten Sie mit Ihrem Unternehmen anbieten?
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Wird erstellt...' : 'Workshop starten'}
        </Button>
      </div>
    </form>
  );
}
