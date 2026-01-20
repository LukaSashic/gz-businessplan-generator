/**
 * Unit Tests for Emotion Detection and Empathy Patterns
 *
 * Tests the MI-based emotion detection and empathy response generation
 * for German-language user messages.
 */

import { describe, it, expect } from 'vitest';
import {
  // Emotion Detection
  type Emotion,
  detectEmotion,
  detectEmotionWithDetails,
  hasEmotionSignal,
  detectAllEmotions,
  getAllEmotionTypes,

  // Empathy Patterns
  generateEmpathyResponse,
  getEmotionLabel,
  getEmpathyPattern,
  getAllEmpathyPatterns,
  generateIntensityAwareResponse,
  getEmotionEmpathyResult,
} from '@/lib/coaching';

// ============================================================================
// Emotion Detection Tests
// ============================================================================

describe('Emotion Detection', () => {
  describe('detectEmotion', () => {
    describe('uncertainty detection', () => {
      it('should detect "weiß nicht" as uncertainty', () => {
        const message = 'Ich weiß nicht, ob das die richtige Entscheidung ist.';
        expect(detectEmotion(message)).toBe('uncertainty');
      });

      it('should detect "unsicher" as uncertainty', () => {
        const message = 'Ich bin mir unsicher bei dieser Sache.';
        expect(detectEmotion(message)).toBe('uncertainty');
      });

      it('should detect "vielleicht" as uncertainty', () => {
        const message = 'Vielleicht sollte ich das anders machen.';
        expect(detectEmotion(message)).toBe('uncertainty');
      });

      it('should detect "keine Ahnung" as uncertainty', () => {
        const message = 'Ich habe keine Ahnung, wie das funktioniert.';
        expect(detectEmotion(message)).toBe('uncertainty');
      });

      it('should detect multiple question marks as uncertainty', () => {
        const message = 'Was soll ich denn machen??';
        expect(detectEmotion(message)).toBe('uncertainty');
      });
    });

    describe('ambivalence detection', () => {
      it('should detect "einerseits" as ambivalence', () => {
        const message = 'Einerseits möchte ich starten, andererseits habe ich Bedenken.';
        expect(detectEmotion(message)).toBe('ambivalence');
      });

      it('should detect "andererseits" as ambivalence', () => {
        const message = 'Das klingt gut, andererseits gibt es Risiken.';
        expect(detectEmotion(message)).toBe('ambivalence');
      });

      it('should detect "obwohl" as ambivalence', () => {
        const message = 'Ich will das machen, obwohl ich Zweifel habe.';
        expect(detectEmotion(message)).toBe('ambivalence');
      });

      it('should detect "jedoch" as ambivalence', () => {
        const message = 'Die Idee ist gut, jedoch fehlt mir die Erfahrung.';
        expect(detectEmotion(message)).toBe('ambivalence');
      });
    });

    describe('anxiety detection', () => {
      it('should detect "Angst" as anxiety', () => {
        const message = 'Ich habe Angst vor dem Scheitern.';
        expect(detectEmotion(message)).toBe('anxiety');
      });

      it('should detect "Sorge" as anxiety', () => {
        const message = 'Meine größte Sorge ist das Finanzielle.';
        expect(detectEmotion(message)).toBe('anxiety');
      });

      it('should detect "befürchte" as anxiety', () => {
        const message = 'Ich befürchte, dass es nicht klappt.';
        expect(detectEmotion(message)).toBe('anxiety');
      });

      it('should detect "nervös" as anxiety', () => {
        const message = 'Ich bin nervös wegen des Termins.';
        expect(detectEmotion(message)).toBe('anxiety');
      });

      it('should detect "Risiko" as anxiety', () => {
        const message = 'Das Risiko ist mir zu groß.';
        expect(detectEmotion(message)).toBe('anxiety');
      });

      it('should detect "scheitern" as anxiety', () => {
        const message = 'Was ist, wenn ich scheitern?';
        expect(detectEmotion(message)).toBe('anxiety');
      });
    });

    describe('frustration detection', () => {
      it('should detect "frustriert" as frustration', () => {
        const message = 'Ich bin frustriert von diesem Prozess.';
        expect(detectEmotion(message)).toBe('frustration');
      });

      it('should detect "genervt" as frustration', () => {
        const message = 'Das ganze Thema macht mich genervt.';
        expect(detectEmotion(message)).toBe('frustration');
      });

      it('should detect "schwierig" as frustration', () => {
        const message = 'Das ist alles so schwierig für mich.';
        expect(detectEmotion(message)).toBe('frustration');
      });

      it('should detect "kompliziert" as frustration', () => {
        const message = 'Warum muss das so kompliziert sein?';
        expect(detectEmotion(message)).toBe('frustration');
      });

      it('should detect "verstehe nicht" as frustration', () => {
        const message = 'Ich verstehe nicht, was hier verlangt wird.';
        expect(detectEmotion(message)).toBe('frustration');
      });
    });

    describe('excitement detection', () => {
      it('should detect "freue mich" as excitement', () => {
        const message = 'Ich freue mich so sehr auf den Start!';
        expect(detectEmotion(message)).toBe('excitement');
      });

      it('should detect "begeistert" as excitement', () => {
        const message = 'Ich bin total begeistert von der Idee!';
        expect(detectEmotion(message)).toBe('excitement');
      });

      it('should detect "motiviert" as excitement', () => {
        const message = 'Ich bin so motiviert, das anzugehen.';
        expect(detectEmotion(message)).toBe('excitement');
      });

      it('should detect "kann es kaum erwarten" as excitement', () => {
        const message = 'Ich kann es kaum erwarten loszulegen!';
        expect(detectEmotion(message)).toBe('excitement');
      });

      it('should detect "toll" as excitement', () => {
        const message = 'Die Möglichkeiten sind einfach toll!';
        expect(detectEmotion(message)).toBe('excitement');
      });
    });

    describe('confidence detection', () => {
      it('should detect "sicher" as confidence', () => {
        const message = 'Da bin ich mir absolut sicher.';
        expect(detectEmotion(message)).toBe('confidence');
      });

      it('should detect "überzeugt" as confidence', () => {
        const message = 'Ich bin davon überzeugt, dass es funktioniert.';
        expect(detectEmotion(message)).toBe('confidence');
      });

      it('should detect "weiß genau" as confidence', () => {
        const message = 'Ich weiß genau, was ich will.';
        expect(detectEmotion(message)).toBe('confidence');
      });

      it('should detect "definitiv" as confidence', () => {
        const message = 'Das ist definitiv mein Weg.';
        expect(detectEmotion(message)).toBe('confidence');
      });

      it('should detect "auf jeden Fall" as confidence', () => {
        const message = 'Auf jeden Fall will ich das durchziehen.';
        expect(detectEmotion(message)).toBe('confidence');
      });
    });

    describe('no emotion detected', () => {
      it('should return null for neutral messages', () => {
        const message = 'Mein Unternehmen bietet Beratungsdienstleistungen an.';
        expect(detectEmotion(message)).toBeNull();
      });

      it('should return null for empty messages', () => {
        expect(detectEmotion('')).toBeNull();
      });

      it('should return null for whitespace-only messages', () => {
        expect(detectEmotion('   ')).toBeNull();
      });

      it('should return null for factual statements', () => {
        const message = 'Ich habe 10 Jahre Erfahrung in der IT-Branche.';
        expect(detectEmotion(message)).toBeNull();
      });
    });
  });

  describe('detectEmotionWithDetails', () => {
    it('should return full detection result with matched signals', () => {
      const message = 'Ich bin so unsicher und weiß nicht weiter.';
      const result = detectEmotionWithDetails(message);

      expect(result.emotion).toBe('uncertainty');
      expect(result.intensity).not.toBeNull();
      expect(result.matchedSignals.length).toBeGreaterThan(0);
      expect(result.matchedSignals).toContain('unsicher');
    });

    it('should return null values for neutral messages', () => {
      const message = 'Das ist mein Angebot.';
      const result = detectEmotionWithDetails(message);

      expect(result.emotion).toBeNull();
      expect(result.intensity).toBeNull();
      expect(result.matchedSignals).toHaveLength(0);
    });
  });

  describe('intensity detection', () => {
    it('should detect higher intensity with multiple exclamation marks', () => {
      const message = 'Ich bin so frustriert!!!';
      const result = detectEmotionWithDetails(message);

      expect(result.emotion).toBe('frustration');
      expect(result.intensityMarkers).toContain('multiple !');
    });

    it('should detect higher intensity with CAPS', () => {
      const message = 'Ich bin WIRKLICH unsicher.';
      const result = detectEmotionWithDetails(message);

      expect(result.intensityMarkers).toContain('CAPS');
    });

    it('should detect intensity with intensifiers', () => {
      const message = 'Ich bin wirklich sehr begeistert!';
      const result = detectEmotionWithDetails(message);

      expect(result.emotion).toBe('excitement');
      expect(result.intensityMarkers).toContain('intensifier');
    });

    it('should return high intensity for strong emotional signals', () => {
      const message = 'Ich weiß nicht, bin mir unsicher, habe keine Ahnung!!!';
      const result = detectEmotionWithDetails(message);

      expect(result.emotion).toBe('uncertainty');
      expect(result.intensity).toBe('high');
    });
  });

  describe('hasEmotionSignal', () => {
    it('should return true when emotion is detected', () => {
      expect(hasEmotionSignal('Ich bin nervös.')).toBe(true);
    });

    it('should return false when no emotion is detected', () => {
      expect(hasEmotionSignal('Der Himmel ist blau.')).toBe(false);
    });
  });

  describe('detectAllEmotions', () => {
    it('should detect multiple emotions in mixed messages', () => {
      const message = 'Einerseits bin ich begeistert, aber ich habe auch Angst.';
      const emotions = detectAllEmotions(message);

      expect(emotions.length).toBeGreaterThanOrEqual(2);
      const emotionTypes = emotions.map((e) => e.emotion);
      expect(emotionTypes).toContain('ambivalence');
    });

    it('should return empty array for neutral messages', () => {
      const message = 'Der Termin ist um 10 Uhr.';
      const emotions = detectAllEmotions(message);

      expect(emotions).toHaveLength(0);
    });

    it('should sort by score descending', () => {
      const message = 'Ich bin sehr unsicher und auch etwas nervös.';
      const emotions = detectAllEmotions(message);

      if (emotions.length >= 2) {
        const first = emotions[0];
        const second = emotions[1];
        if (first && second) {
          expect(first.score).toBeGreaterThanOrEqual(second.score);
        }
      }
    });
  });

  describe('getAllEmotionTypes', () => {
    it('should return all six emotion types', () => {
      const types = getAllEmotionTypes();

      expect(types).toHaveLength(6);
      expect(types).toContain('uncertainty');
      expect(types).toContain('ambivalence');
      expect(types).toContain('anxiety');
      expect(types).toContain('frustration');
      expect(types).toContain('excitement');
      expect(types).toContain('confidence');
    });
  });
});

// ============================================================================
// Empathy Patterns Tests
// ============================================================================

describe('Empathy Patterns', () => {
  describe('generateEmpathyResponse', () => {
    it('should generate uncertainty response', () => {
      const response = generateEmpathyResponse('uncertainty');

      expect(response).toContain('verständlich');
      expect(response).toContain('unsicher');
      expect(response).toContain('Klarheit');
    });

    it('should generate ambivalence response', () => {
      const response = generateEmpathyResponse('ambivalence');

      expect(response).toContain('hin- und hergerissen');
      expect(response).toContain('ernst nimmst');
      expect(response).toContain('dafür');
      expect(response).toContain('dagegen');
    });

    it('should generate anxiety response', () => {
      const response = generateEmpathyResponse('anxiety');

      expect(response).toContain('Angst');
      expect(response).toContain('normale Reaktion');
      expect(response).toContain('Gründer');
    });

    it('should generate frustration response', () => {
      const response = generateEmpathyResponse('frustration');

      expect(response).toContain('frustrierend');
      expect(response).toContain('okay');
      expect(response).toContain('schwierig');
    });

    it('should generate excitement response', () => {
      const response = generateEmpathyResponse('excitement');

      expect(response).toContain('Begeisterung');
      expect(response).toContain('ansteckend');
      expect(response).toContain('Energie');
    });

    it('should generate confidence response', () => {
      const response = generateEmpathyResponse('confidence');

      expect(response).toContain('sicher');
      expect(response).toContain('Überzeugung');
    });

    it('should follow MI pattern: validation + normalization + pivot', () => {
      const allTypes: Emotion[] = [
        'uncertainty',
        'ambivalence',
        'anxiety',
        'frustration',
        'excitement',
        'confidence',
      ];

      allTypes.forEach((emotion) => {
        const response = generateEmpathyResponse(emotion);
        // Should be non-empty and contain a question for the pivot
        expect(response.length).toBeGreaterThan(50);
        // Most pivots contain a question mark
        expect(response).toMatch(/[.?]$/);
      });
    });
  });

  describe('getEmotionLabel', () => {
    it('should return German labels for all emotions', () => {
      expect(getEmotionLabel('uncertainty')).toBe('Unsicherheit');
      expect(getEmotionLabel('ambivalence')).toBe('Zwiespalt');
      expect(getEmotionLabel('anxiety')).toBe('Angst');
      expect(getEmotionLabel('frustration')).toBe('Frustration');
      expect(getEmotionLabel('excitement')).toBe('Begeisterung');
      expect(getEmotionLabel('confidence')).toBe('Zuversicht');
    });
  });

  describe('getEmpathyPattern', () => {
    it('should return complete pattern structure', () => {
      const pattern = getEmpathyPattern('anxiety');

      expect(pattern.emotion).toBe('anxiety');
      expect(pattern.label).toBe('Angst');
      expect(pattern.validation).toBeDefined();
      expect(pattern.normalization).toBeDefined();
      expect(pattern.pivot).toBeDefined();
    });

    it('should have all pattern components for each emotion', () => {
      const allTypes: Emotion[] = [
        'uncertainty',
        'ambivalence',
        'anxiety',
        'frustration',
        'excitement',
        'confidence',
      ];

      allTypes.forEach((emotion) => {
        const pattern = getEmpathyPattern(emotion);

        expect(pattern.emotion).toBe(emotion);
        expect(pattern.label.length).toBeGreaterThan(0);
        expect(pattern.validation.length).toBeGreaterThan(0);
        expect(pattern.normalization.length).toBeGreaterThan(0);
        expect(pattern.pivot.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getAllEmpathyPatterns', () => {
    it('should return patterns for all six emotions', () => {
      const patterns = getAllEmpathyPatterns();

      expect(Object.keys(patterns)).toHaveLength(6);
      expect(patterns.uncertainty).toBeDefined();
      expect(patterns.ambivalence).toBeDefined();
      expect(patterns.anxiety).toBeDefined();
      expect(patterns.frustration).toBeDefined();
      expect(patterns.excitement).toBeDefined();
      expect(patterns.confidence).toBeDefined();
    });
  });

  describe('generateIntensityAwareResponse', () => {
    it('should add intensity prefix for high intensity', () => {
      const highResponse = generateIntensityAwareResponse('anxiety', 'high');
      const lowResponse = generateIntensityAwareResponse('anxiety', 'low');

      expect(highResponse.length).toBeGreaterThan(lowResponse.length);
      expect(highResponse).toContain('sehr ernst');
    });

    it('should return standard response for low intensity', () => {
      const response = generateIntensityAwareResponse('excitement', 'low');
      const standardResponse = generateEmpathyResponse('excitement');

      expect(response).toBe(standardResponse);
    });

    it('should return standard response for medium intensity', () => {
      const response = generateIntensityAwareResponse('frustration', 'medium');
      const standardResponse = generateEmpathyResponse('frustration');

      expect(response).toBe(standardResponse);
    });
  });

  describe('getEmotionEmpathyResult', () => {
    it('should return combined emotion and empathy info', () => {
      const result = getEmotionEmpathyResult('uncertainty');

      expect(result.emotion).toBe('uncertainty');
      expect(result.label).toBe('Unsicherheit');
      expect(result.empathyResponse.length).toBeGreaterThan(0);
      expect(result.pattern).toBeDefined();
      expect(result.pattern.emotion).toBe('uncertainty');
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Emotion Detection + Empathy Integration', () => {
  it('should detect emotion and generate appropriate response', () => {
    const message = 'Ich habe Angst, dass mein Businessplan abgelehnt wird.';
    const emotion = detectEmotion(message);

    expect(emotion).toBe('anxiety');

    if (emotion) {
      const response = generateEmpathyResponse(emotion);
      expect(response).toContain('Angst');
      expect(response).toContain('normal');
    }
  });

  it('should handle mixed emotions with dominant detection', () => {
    const message = 'Ich bin begeistert aber auch nervös wegen der Finanzierung.';
    const allEmotions = detectAllEmotions(message);
    const dominantEmotion = detectEmotion(message);

    expect(allEmotions.length).toBeGreaterThan(0);
    expect(dominantEmotion).not.toBeNull();

    if (dominantEmotion) {
      const label = getEmotionLabel(dominantEmotion);
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('should handle intensity-aware response generation', () => {
    const message = 'Ich bin SO frustriert!!! Das ist alles VIEL zu kompliziert!!!';
    const result = detectEmotionWithDetails(message);

    expect(result.emotion).toBe('frustration');

    if (result.emotion && result.intensity) {
      const response = generateIntensityAwareResponse(result.emotion, result.intensity);
      expect(response.length).toBeGreaterThan(0);
    }
  });

  it('should gracefully handle no emotion detection', () => {
    const message = 'Ich biete IT-Beratung für mittelständische Unternehmen an.';
    const emotion = detectEmotion(message);

    expect(emotion).toBeNull();
    // No empathy response needed for neutral messages
  });
});
