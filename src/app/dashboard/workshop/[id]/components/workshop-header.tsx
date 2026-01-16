'use client';

import { useAtom } from 'jotai';
import { currentModuleAtom } from '@/lib/state/workshop-atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, Cloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkshopHeaderProps {
  workshop: any;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

const MODULES = [
  { value: 'gz-intake', label: '1. Aufnahme' },
  { value: 'gz-geschaeftsmodell', label: '2. Geschäftsmodell' },
  { value: 'gz-unternehmen', label: '3. Unternehmen' },
  { value: 'gz-markt-wettbewerb', label: '4. Markt & Wettbewerb' },
  { value: 'gz-marketing', label: '5. Marketing' },
  { value: 'gz-finanzplanung', label: '6. Finanzplanung' },
  { value: 'gz-swot', label: '7. SWOT-Analyse' },
  { value: 'gz-meilensteine', label: '8. Meilensteine' },
  { value: 'gz-kpi', label: '9. KPI' },
  { value: 'gz-zusammenfassung', label: '10. Zusammenfassung' },
];

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }
> = {
  draft: { label: 'Entwurf', variant: 'secondary' },
  in_progress: { label: 'In Bearbeitung', variant: 'warning' },
  review: { label: 'In Prüfung', variant: 'default' },
  completed: { label: 'Abgeschlossen', variant: 'success' },
};

export default function WorkshopHeader({
  workshop,
  isSaving = false,
  lastSaved,
}: WorkshopHeaderProps) {
  const [currentModule, setCurrentModule] = useAtom(currentModuleAtom);
  const router = useRouter();
  const statusInfo = STATUS_LABELS[workshop.status] || STATUS_LABELS.draft;

  // Format last saved time
  const formatLastSaved = (date: Date | null | undefined) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 5) return 'Gerade gespeichert';
    if (diff < 60) return `Vor ${diff}s gespeichert`;
    if (diff < 3600) return `Vor ${Math.floor(diff / 60)}m gespeichert`;
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col">
            <h1 className="max-w-[200px] truncate text-lg font-semibold sm:max-w-none">
              {workshop.business_name || 'Neuer Businessplan'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={statusInfo.variant as any}>
                {statusInfo.label}
              </Badge>
              {/* Saving indicator */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="hidden sm:inline">Speichert...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Cloud className="h-3 w-3 text-green-500" />
                    <span className="hidden sm:inline">
                      {formatLastSaved(lastSaved)}
                    </span>
                  </>
                ) : null}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={currentModule || 'gz-intake'}
            onValueChange={setCurrentModule}
          >
            <SelectTrigger className="w-[180px] sm:w-[220px]">
              <SelectValue placeholder="Modul auswählen" />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((module) => (
                <SelectItem key={module.value} value={module.value}>
                  {module.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="shrink-0" disabled>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
