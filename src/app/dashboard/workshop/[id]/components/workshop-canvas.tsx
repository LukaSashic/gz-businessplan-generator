'use client';

import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  currentWorkshopIdAtom,
  workshopsAtom,
  currentModuleAtom,
} from '@/lib/state/workshop-atoms';
import { useAutoSave } from '@/lib/state/hooks';
import ChatPanel from './chat-panel';
import PreviewPanel from './preview-panel';
import WorkshopHeader from './workshop-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkshopCanvasProps {
  workshop: any;
}

export default function WorkshopCanvas({ workshop }: WorkshopCanvasProps) {
  const setCurrentWorkshopId = useSetAtom(currentWorkshopIdAtom);
  const setWorkshops = useSetAtom(workshopsAtom);
  const [currentModule, setCurrentModule] = useAtom(currentModuleAtom);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');

  // Auto-save workshop data every 5 seconds
  const { updateData, isSaving, lastSaved } = useAutoSave(workshop.id);

  // Initialize workshop state
  useEffect(() => {
    // Add workshop to the list (or update if exists)
    setWorkshops((prev) => {
      const exists = prev.some((w) => w.id === workshop.id);
      if (exists) {
        return prev.map((w) => (w.id === workshop.id ? workshop : w));
      }
      return [...prev, workshop];
    });
    setCurrentWorkshopId(workshop.id);

    // Set initial module if not set
    if (!currentModule) {
      setCurrentModule('gz-intake');
    }
  }, [
    workshop,
    setCurrentWorkshopId,
    setWorkshops,
    currentModule,
    setCurrentModule,
  ]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop: Split-view layout
  if (!isMobile) {
    return (
      <div className="flex h-full flex-col bg-background">
        <WorkshopHeader
          workshop={workshop}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Panel - 40% */}
          <div className="flex w-2/5 flex-col border-r border-border">
            <ChatPanel workshopId={workshop.id} onDataUpdate={updateData} />
          </div>

          {/* Preview Panel - 60% */}
          <div className="flex w-3/5 flex-col">
            <PreviewPanel workshopId={workshop.id} />
          </div>
        </div>
      </div>
    );
  }

  // Mobile: Tabbed layout
  return (
    <div className="flex h-full flex-col bg-background">
      <WorkshopHeader
        workshop={workshop}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'chat' | 'preview')}
        className="flex flex-1 flex-col"
      >
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="chat" className="flex-1">
            Chat
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">
            Vorschau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="m-0 flex-1">
          <ChatPanel workshopId={workshop.id} onDataUpdate={updateData} />
        </TabsContent>

        <TabsContent value="preview" className="m-0 flex-1">
          <PreviewPanel workshopId={workshop.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
