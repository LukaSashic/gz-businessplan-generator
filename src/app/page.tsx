export default function Home() {
  return (
    <main className="canvas-layout">
      {/* Chat Panel */}
      <div className="canvas-chat">
        <div className="flex h-full flex-col items-center justify-center p-8">
          <h1 className="mb-4 text-4xl font-bold">GZ Businessplan Generator</h1>
          <p className="mb-8 text-center text-muted-foreground">
            Erstelle deinen professionellen Businessplan für den Gründungszuschuss
          </p>
          <div className="rounded-lg border border-dashed border-border p-8">
            <p className="text-sm text-muted-foreground">
              Chat-Interface wird hier implementiert
            </p>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="canvas-preview hidden md:flex">
        <div className="flex h-full flex-col items-center justify-center p-8">
          <div className="rounded-lg border border-dashed border-border p-8">
            <p className="text-sm text-muted-foreground">
              Live-Dokumentenvorschau wird hier angezeigt
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
