/**
 * Manual Test Script for Phase-Locked Intake System
 *
 * Run with: npx ts-node --esm test-intake-phases.ts
 * Or: npx tsx test-intake-phases.ts
 */

import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const PHASES = [
  'warmup',
  'founder_profile',
  'personality',
  'profile_gen',
  'resources',
  'business_type',
  'validation',
] as const;

type IntakePhase = typeof PHASES[number];

const PHASE_FILES: Record<IntakePhase, string> = {
  warmup: '01-warmup.md',
  founder_profile: '02-founder-profile.md',
  personality: '03-personality.md',
  profile_gen: '04-profile-gen.md',
  resources: '05-resources.md',
  business_type: '06-business-type.md',
  validation: '07-validation.md',
};

const INTAKE_PHASES_DIR = path.join(process.cwd(), 'src', 'lib', 'prompts', 'modules', 'intake-phases');

async function testPhaseFilesExist(): Promise<boolean> {
  console.log('\n📁 Testing phase files exist...\n');

  let allExist = true;

  // Check _common.md
  const commonPath = path.join(INTAKE_PHASES_DIR, '_common.md');
  try {
    await fs.access(commonPath);
    console.log('  ✅ _common.md exists');
  } catch {
    console.log('  ❌ _common.md MISSING');
    allExist = false;
  }

  // Check each phase file
  for (const phase of PHASES) {
    const fileName = PHASE_FILES[phase];
    const filePath = path.join(INTAKE_PHASES_DIR, fileName);

    try {
      await fs.access(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const lineCount = content.split('\n').length;
      console.log(`  ✅ ${fileName} exists (${lineCount} lines)`);
    } catch {
      console.log(`  ❌ ${fileName} MISSING`);
      allExist = false;
    }
  }

  return allExist;
}

async function testPhaseContent(): Promise<boolean> {
  console.log('\n📋 Testing phase content requirements...\n');

  let allValid = true;

  // Test Phase 2 (founder_profile) has ALG questions
  const phase2Path = path.join(INTAKE_PHASES_DIR, '02-founder-profile.md');
  try {
    const content = await fs.readFile(phase2Path, 'utf-8');

    const hasALGSection = content.includes('ALG STATUS') || content.includes('ALG I');
    const hasMandatoryQuestions = content.includes('MANDATORY QUESTIONS');
    const hasDaysRemaining = content.includes('daysRemaining') || content.includes('Resttage');
    const hasMonthlyAmount = content.includes('monthlyAmount') || content.includes('monatlich');

    console.log('  Phase 2 (founder_profile):');
    console.log(`    ${hasALGSection ? '✅' : '❌'} Has ALG STATUS section`);
    console.log(`    ${hasMandatoryQuestions ? '✅' : '❌'} Has MANDATORY QUESTIONS section`);
    console.log(`    ${hasDaysRemaining ? '✅' : '❌'} Asks about ALG days remaining`);
    console.log(`    ${hasMonthlyAmount ? '✅' : '❌'} Asks about ALG monthly amount`);

    if (!hasALGSection || !hasMandatoryQuestions || !hasDaysRemaining || !hasMonthlyAmount) {
      allValid = false;
    }
  } catch (error) {
    console.log('  ❌ Could not read phase 2 file');
    allValid = false;
  }

  // Test Phase 3 (personality) has all 7 dimensions
  const phase3Path = path.join(INTAKE_PHASES_DIR, '03-personality.md');
  try {
    const content = await fs.readFile(phase3Path, 'utf-8');

    const dimensions = [
      'Innovativeness',
      'Risk-Taking',
      'Achievement',
      'Proactiveness',
      'Locus of Control',
      'Self-Efficacy',
      'Autonomy',
    ];

    console.log('\n  Phase 3 (personality):');
    let dimensionCount = 0;
    for (const dim of dimensions) {
      const hasDim = content.toLowerCase().includes(dim.toLowerCase());
      if (hasDim) dimensionCount++;
      console.log(`    ${hasDim ? '✅' : '❌'} Has ${dim} scenario`);
    }

    if (dimensionCount < 7) {
      allValid = false;
    }
  } catch (error) {
    console.log('  ❌ Could not read phase 3 file');
    allValid = false;
  }

  return allValid;
}

async function testPromptLoader(): Promise<boolean> {
  console.log('\n🔧 Testing prompt loader...\n');

  try {
    // Dynamic import to test the actual module
    const { buildIntakePhasePrompt } = await import('./src/lib/prompts/prompt-loader.js');

    console.log('  ✅ buildIntakePhasePrompt function exported');

    // Test building a phase prompt
    const warmupPrompt = await buildIntakePhasePrompt('warmup', {
      includeCoaching: false,
    });

    console.log(`  ✅ Warmup prompt built (${warmupPrompt.length} chars)`);

    // Test with previous phase data
    const founderPrompt = await buildIntakePhasePrompt('founder_profile', {
      includeCoaching: false,
      previousPhaseData: {
        businessIdea: {
          elevator_pitch: 'Test business idea',
          problem: 'Test problem',
          solution: 'Test solution',
          targetAudience: 'Test audience',
          uniqueValue: 'Test value',
        },
      },
    });

    console.log(`  ✅ Founder profile prompt built with context (${founderPrompt.length} chars)`);

    // Verify context injection
    const hasContext = founderPrompt.includes('Bereits erfasste');
    console.log(`  ${hasContext ? '✅' : '❌'} Previous phase data injected`);

    return true;
  } catch (error) {
    console.log(`  ❌ Error testing prompt loader: ${error}`);
    return false;
  }
}

async function testPhaseValidators(): Promise<boolean> {
  console.log('\n✔️  Testing phase validators...\n');

  try {
    const {
      validateIntakePhase,
      PHASE_VALIDATORS,
      calculateIntakeProgress,
    } = await import('./src/types/modules/intake.js');

    console.log('  ✅ Validators imported');

    // Test empty data
    const emptyResult = validateIntakePhase('warmup', {});
    console.log(`  ✅ Empty data validation: ${emptyResult.missingFields.length} missing fields`);

    // Test partial warmup data
    const partialWarmup = validateIntakePhase('warmup', {
      businessIdea: {
        elevator_pitch: 'Test pitch',
        problem: 'Test problem',
        solution: '',
        targetAudience: '',
        uniqueValue: '',
      },
    });
    console.log(`  ✅ Partial warmup: ${partialWarmup.completedFields.length} completed, ${partialWarmup.missingFields.length} missing`);

    // Test founder_profile with unemployed status (should require ALG data)
    const unemployedResult = validateIntakePhase('founder_profile', {
      founder: {
        currentStatus: 'unemployed',
        experience: { yearsInIndustry: 5, relevantRoles: [], previousFounder: false },
        qualifications: { education: 'Bachelor', certifications: [], specialSkills: [] },
        motivation: { push: ['test'], pull: [] },
      },
    });

    const requiresALG = unemployedResult.missingFields.some(f => f.includes('algStatus'));
    console.log(`  ${requiresALG ? '✅' : '❌'} Unemployed founder requires ALG data`);

    // Test progress calculation
    const progress = calculateIntakeProgress({
      businessIdea: {
        elevator_pitch: 'Test',
        problem: 'Test',
        solution: 'Test',
        targetAudience: 'Test',
        uniqueValue: 'Test',
      },
    });
    console.log(`  ✅ Progress calculation: ${progress}%`);

    return true;
  } catch (error) {
    console.log(`  ❌ Error testing validators: ${error}`);
    return false;
  }
}

async function testAPITypes(): Promise<boolean> {
  console.log('\n📡 Testing API types...\n');

  try {
    // Read the chat types file
    const typesPath = path.join(process.cwd(), 'src', 'types', 'chat.ts');
    const content = await fs.readFile(typesPath, 'utf-8');

    const hasIntakePhase = content.includes('intakePhase');
    const hasPreviousPhaseData = content.includes('previousPhaseData');

    console.log(`  ${hasIntakePhase ? '✅' : '❌'} ChatRequest has intakePhase field`);
    console.log(`  ${hasPreviousPhaseData ? '✅' : '❌'} ChatRequest has previousPhaseData field`);

    return hasIntakePhase && hasPreviousPhaseData;
  } catch (error) {
    console.log(`  ❌ Error checking API types: ${error}`);
    return false;
  }
}

async function testUIComponents(): Promise<boolean> {
  console.log('\n🎨 Testing UI components...\n');

  try {
    // Check chat-panel has PhaseIndicator
    const chatPanelPath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'workshop', '[id]', 'components', 'chat-panel.tsx');
    const chatPanel = await fs.readFile(chatPanelPath, 'utf-8');

    const hasPhaseIndicator = chatPanel.includes('PhaseIndicator');
    const usesPhaseFromHook = chatPanel.includes('currentIntakePhase');

    console.log(`  ${hasPhaseIndicator ? '✅' : '❌'} ChatPanel has PhaseIndicator component`);
    console.log(`  ${usesPhaseFromHook ? '✅' : '❌'} ChatPanel uses phase from hook`);

    // Check intake-preview has PhaseProgressStepper
    const previewPath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'workshop', '[id]', 'components', 'previews', 'intake-preview.tsx');
    const preview = await fs.readFile(previewPath, 'utf-8');

    const hasProgressStepper = preview.includes('PhaseProgressStepper');
    const usesValidators = preview.includes('validateIntakePhase');

    console.log(`  ${hasProgressStepper ? '✅' : '❌'} IntakePreview has PhaseProgressStepper`);
    console.log(`  ${usesValidators ? '✅' : '❌'} IntakePreview uses phase validators`);

    return hasPhaseIndicator && usesPhaseFromHook && hasProgressStepper && usesValidators;
  } catch (error) {
    console.log(`  ❌ Error checking UI components: ${error}`);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   PHASE-LOCKED INTAKE SYSTEM - MANUAL TEST');
  console.log('═══════════════════════════════════════════════════════════');

  const results: Record<string, boolean> = {};

  // Test 1: Phase files exist
  results['Phase files exist'] = await testPhaseFilesExist();

  // Test 2: Phase content requirements
  results['Phase content valid'] = await testPhaseContent();

  // Test 3: API types
  results['API types updated'] = await testAPITypes();

  // Test 4: UI components
  results['UI components updated'] = await testUIComponents();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  let allPassed = true;
  for (const [name, passed] of Object.entries(results)) {
    console.log(`  ${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPassed = false;
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('   ALL TESTS PASSED ✅');
  } else {
    console.log('   SOME TESTS FAILED ❌');
  }
  console.log('═══════════════════════════════════════════════════════════\n');

  // Instructions for manual testing
  console.log('📝 MANUAL TESTING INSTRUCTIONS:');
  console.log('────────────────────────────────────────────────────────────');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Login and create/open a workshop');
  console.log('3. Verify the Phase Indicator shows "Warm-Up" initially');
  console.log('4. Chat about your business idea');
  console.log('5. Check that JSON output includes "currentPhase": "warmup"');
  console.log('6. Complete warmup phase requirements');
  console.log('7. Verify phase advances to "founder_profile"');
  console.log('8. When asked about status, say "arbeitslos"');
  console.log('9. CRITICAL: Verify Claude asks about ALG I status');
  console.log('10. Check preview panel shows phase progress stepper');
  console.log('────────────────────────────────────────────────────────────\n');
}

// Run tests
runTests().catch(console.error);
