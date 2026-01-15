'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '../../../lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileFormProps {
  user: User;
  profile: Profile | null;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
      router.refresh();
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);

      const errorMessage =
        error?.message || 'Fehler beim Aktualisieren des Profils.';

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email (read-only) */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          E-Mail-Adresse
        </label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          E-Mail-Adresse kann nicht geändert werden.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Vollständiger Name
        </label>
        <input
          type="text"
          id="full_name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Max Mustermann"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Telefonnummer (optional)
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+49 123 456789"
        />
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  );
}
