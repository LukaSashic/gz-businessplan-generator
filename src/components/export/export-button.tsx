/**
 * Export Button Component (GZ-902)
 *
 * Smart export button that:
 * - Shows validation status before allowing export
 * - Shows progress during generation
 * - Triggers download on completion
 * - Provides accessible UI with proper ARIA labels
 *
 * Uses final-validator to check readiness and main export API for document generation.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileCheck, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ExportValidation {
  canExport: boolean;
  status: 'ready' | 'blocked' | 'warnings';
  message: string;
  complianceScore: number;
  validation: {
    blockers: number;
    warnings: number;
    details: Array<{
      id: string;
      severity: 'BLOCKER' | 'WARNING';
      title: string;
      message: string;
    }>;
  };
  recommendations: string[];
}

export interface ExportButtonProps {
  /** Workshop session ID */
  workshopId: string;
  /** Workshop business name for display */
  businessName?: string;
  /** Export options */
  options?: {
    includeDetailedFinancials?: boolean;
    includeSWOTSection?: boolean;
    format?: 'docx';
  };
  /** Additional CSS classes */
  className?: string;
  /** Callback when export completes successfully */
  onExportSuccess?: (filename: string) => void;
  /** Callback when export fails */
  onExportError?: (error: string) => void;
}

type ExportState = 'checking' | 'ready' | 'blocked' | 'warnings' | 'generating' | 'completed' | 'error';

// ============================================================================
// Main Component
// ============================================================================

export function ExportButton({
  workshopId,
  businessName,
  options = {},
  className,
  onExportSuccess,
  onExportError
}: ExportButtonProps) {
  const [state, setState] = useState<ExportState>('checking');
  const [validation, setValidation] = useState<ExportValidation | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  // Check export readiness on mount and when workshopId changes
  useEffect(() => {
    if (workshopId) {
      checkExportReadiness();
    }
  }, [workshopId]);

  // ============================================================================
  // API Functions
  // ============================================================================

  const checkExportReadiness = async () => {
    setState('checking');
    setError(null);

    try {
      const response = await fetch(`/api/export?workshopId=${encodeURIComponent(workshopId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Validierung fehlgeschlagen');
      }

      const validationData = await response.json() as ExportValidation;
      setValidation(validationData);

      // Set state based on validation result
      if (!validationData.canExport) {
        setState('blocked');
      } else if (validationData.validation.warnings > 0) {
        setState('warnings');
      } else {
        setState('ready');
      }

    } catch (err) {
      console.error('[ExportButton] Readiness check failed:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setState('error');
    }
  };

  const handleExportClick = async () => {
    if (!validation?.canExport) return;

    setState('generating');
    setProgress(0);
    setError(null);
    setGenerationTime(null);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90%, will complete when API returns
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const startTime = Date.now();

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workshopId,
          options: {
            includeDetailedFinancials: true,
            includeSWOTSection: true,
            format: 'docx',
            ...options
          }
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export fehlgeschlagen');
      }

      // Complete progress animation
      setProgress(100);

      // Generate filename from response headers or fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || `${businessName || 'Businessplan'}_${new Date().toISOString().split('T')[0]}.docx`;

      // Get generation time from headers
      const genTimeHeader = response.headers.get('X-Generation-Time-Ms');
      const genTime = genTimeHeader ? parseInt(genTimeHeader, 10) : Date.now() - startTime;
      setGenerationTime(genTime);

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update state
      setState('completed');
      onExportSuccess?.(filename);

      // Reset to ready state after 3 seconds
      setTimeout(() => {
        setState('ready');
        setProgress(0);
      }, 3000);

    } catch (err) {
      console.error('[ExportButton] Export failed:', err);
      clearInterval(progressInterval);

      const errorMessage = err instanceof Error ? err.message : 'Export fehlgeschlagen';
      setError(errorMessage);
      setState('error');
      setProgress(0);
      onExportError?.(errorMessage);
    }
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const getButtonContent = () => {
    switch (state) {
      case 'checking':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Validierung läuft...
          </>
        );

      case 'ready':
        return (
          <>
            <Download className="w-4 h-4 mr-2" />
            Businessplan exportieren
          </>
        );

      case 'blocked':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Export nicht möglich
          </>
        );

      case 'warnings':
        return (
          <>
            <FileCheck className="w-4 h-4 mr-2" />
            Exportieren (mit Warnungen)
          </>
        );

      case 'generating':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Dokument wird erstellt...
          </>
        );

      case 'completed':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Download erfolgreich!
          </>
        );

      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Fehler aufgetreten
          </>
        );

      default:
        return 'Export';
    }
  };

  const getButtonVariant = () => {
    switch (state) {
      case 'ready':
      case 'completed':
        return 'default';
      case 'warnings':
        return 'secondary';
      case 'blocked':
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadge = () => {
    if (!validation) return null;

    switch (validation.status) {
      case 'ready':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✅ Bereit</Badge>;
      case 'warnings':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">⚠️ Warnungen</Badge>;
      case 'blocked':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">🚫 Blockiert</Badge>;
      default:
        return null;
    }
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Export Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button
          onClick={handleExportClick}
          disabled={state === 'checking' || state === 'blocked' || state === 'generating'}
          variant={getButtonVariant()}
          size="lg"
          className="w-full sm:w-auto"
          aria-label={`Businessplan als DOCX-Datei exportieren${validation ? ` - Status: ${validation.status}` : ''}`}
        >
          {getButtonContent()}
        </Button>

        {getStatusBadge()}

        {validation && (
          <Badge variant="outline" className="text-xs">
            BA-Score: {validation.complianceScore}%
          </Badge>
        )}
      </div>

      {/* Progress Bar during Generation */}
      {state === 'generating' && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 text-center">
            {progress < 30 ? 'Validierung...' :
             progress < 60 ? 'Daten werden verarbeitet...' :
             progress < 90 ? 'Dokument wird zusammengestellt...' :
             'Fast fertig...'}
          </p>
        </div>
      )}

      {/* Success Message */}
      {state === 'completed' && generationTime && (
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            ✅ Dokument erfolgreich erstellt in {generationTime}ms
          </p>
        </div>
      )}

      {/* Validation Details */}
      {validation && state !== 'generating' && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Export-Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700">{validation.message}</p>

            {validation.validation.details.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Details:</h4>
                <div className="space-y-1">
                  {validation.validation.details.slice(0, 3).map((detail) => (
                    <div
                      key={detail.id}
                      className={cn(
                        "text-xs p-2 rounded",
                        detail.severity === 'BLOCKER'
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      )}
                    >
                      <span className="font-medium">{detail.title}:</span> {detail.message}
                    </div>
                  ))}
                  {validation.validation.details.length > 3 && (
                    <p className="text-xs text-gray-500">
                      ... und {validation.validation.details.length - 3} weitere
                    </p>
                  )}
                </div>
              </div>
            )}

            {validation.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Empfehlungen:</h4>
                <ul className="space-y-1">
                  {validation.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && state === 'error' && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Fehler beim Export</span>
            </div>
            <p className="text-sm text-red-600">{error}</p>
            <Button
              onClick={checkExportReadiness}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button for Validation */}
      {(state === 'ready' || state === 'warnings' || state === 'blocked') && (
        <div className="text-center">
          <Button
            onClick={checkExportReadiness}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Status aktualisieren
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default ExportButton;