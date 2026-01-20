/**
 * Test the prompt loader builds phase prompts correctly
 */

import { buildIntakePhasePrompt } from './src/lib/prompts/prompt-loader.js';

async function testPromptBuilding() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   TESTING PROMPT BUILDER');
  console.log('═══════════════════════════════════════════════════════════\n');

  const phases = [
    'warmup',
    'founder_profile',
    'personality',
    'profile_gen',
    'resources',
    'business_type',
    'validation',
  ] as const;

  for (const phase of phases) {
    try {
      console.log(`\n📄 Building prompt for phase: ${phase}`);
      console.log('─'.repeat(50));

      const prompt = await buildIntakePhasePrompt(phase, {
        includeCoaching: false, // Skip coaching for faster test
      });

      console.log(`   Length: ${prompt.length} characters`);
      console.log(`   Lines: ${prompt.split('\n').length}`);

      // Check for key content
      const hasPhaseHeader = prompt.includes(`Phase`) || prompt.includes(phase);
      const hasJSONInstructions = prompt.includes('<json>') || prompt.includes('JSON');
      const hasMinimalOrchestrator = prompt.includes('Gründungszuschuss');

      console.log(`   ✅ Has phase content: ${hasPhaseHeader}`);
      console.log(`   ✅ Has JSON instructions: ${hasJSONInstructions}`);
      console.log(`   ✅ Has orchestrator context: ${hasMinimalOrchestrator}`);

      // Phase-specific checks
      if (phase === 'founder_profile') {
        const hasALG = prompt.includes('ALG') || prompt.includes('arbeitslos');
        const hasCritical = prompt.includes('CRITICAL') || prompt.includes('MANDATORY');
        console.log(`   ✅ Has ALG requirements: ${hasALG}`);
        console.log(`   ✅ Has CRITICAL markers: ${hasCritical}`);
      }

      if (phase === 'personality') {
        const has7Dims = prompt.includes('7') || prompt.includes('dimension');
        console.log(`   ✅ Has 7 dimensions reference: ${has7Dims}`);
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`);
    }
  }

  // Test with previous phase data
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   TESTING CONTEXT INJECTION');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const promptWithContext = await buildIntakePhasePrompt('founder_profile', {
      includeCoaching: false,
      previousPhaseData: {
        businessIdea: {
          elevator_pitch: 'Ich biete Coaching für IT-Berater an',
          problem: 'IT-Berater haben keine Zeit für Marketing',
          solution: 'Ich helfe ihnen, Kunden zu gewinnen',
          targetAudience: 'Selbstständige IT-Berater',
          uniqueValue: 'Spezialisierung auf IT-Branche',
        },
      },
    });

    const hasInjectedContext = promptWithContext.includes('Bereits erfasste');
    const hasElevatorPitch = promptWithContext.includes('IT-Berater');

    console.log(`   Context injection: ${hasInjectedContext ? '✅' : '❌'}`);
    console.log(`   Previous data visible: ${hasElevatorPitch ? '✅' : '❌'}`);

    // Show a snippet of the injected context
    const contextStart = promptWithContext.indexOf('Bereits erfasste');
    if (contextStart > -1) {
      const snippet = promptWithContext.slice(contextStart, contextStart + 300);
      console.log('\n   Context snippet:');
      console.log('   ' + snippet.split('\n').slice(0, 8).join('\n   '));
    }

  } catch (error) {
    console.log(`   ❌ ERROR: ${error}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   PROMPT BUILDER TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
}

testPromptBuilding().catch(console.error);
