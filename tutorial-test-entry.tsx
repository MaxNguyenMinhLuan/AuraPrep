import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import TutorialGuide from './components/Tutorial/TutorialGuide';
import ForcedNavigation from './components/Tutorial/ForcedNavigation';
import UnlockPopup from './components/Tutorial/UnlockPopup';
import RewardCelebration from './components/Tutorial/RewardCelebration';
import DailyMissionsExplainer from './components/Tutorial/DailyMissionsExplainer';
import { TUTORIAL_DIALOGUE } from './utils/tutorialSteps';

// Every real TutorialGuide/ForcedNavigation/UnlockPopup/RewardCelebration
// invocation pulled verbatim from App.tsx's renderTutorial(), keyed by the
// tutorialState.currentPhase that triggers it. Used to regression-test
// each dialogue's layout in isolation at mobile viewport sizes.
const CASES: Record<string, () => React.ReactElement> = {
    'welcome': () => (
        <TutorialGuide message={TUTORIAL_DIALOGUE.welcome.greeting} onNext={() => {}} buttonText={TUTORIAL_DIALOGUE.welcome.button} />
    ),
    'forced-summon-guide': () => (
        <TutorialGuide message={TUTORIAL_DIALOGUE.forcedSummon.instruction} position="top" showCharacter={false} />
    ),
    'forced-summon-nav': () => (
        <ForcedNavigation phase="forced-summon" message={TUTORIAL_DIALOGUE.forcedSummon.intro} subMessage={TUTORIAL_DIALOGUE.forcedSummon.instruction} showArrow={false} />
    ),
    'forced-bestiary-nav': () => (
        <ForcedNavigation phase="forced-bestiary" message={TUTORIAL_DIALOGUE.forcedBestiary.intro} showArrow={false} />
    ),
    'forced-bestiary-guide': () => (
        <TutorialGuide message={TUTORIAL_DIALOGUE.forcedBestiary.tapToSee} onNext={() => {}} buttonText="Got it!" position="top" />
    ),
    'choose-active-creature': () => (
        <TutorialGuide message={TUTORIAL_DIALOGUE.chooseActiveCreature.instruction} onNext={() => {}} buttonText="I've chosen!" position="bottom" />
    ),
    'first-reward': () => (
        <RewardCelebration auraAmount={500} message="Amazing work!" subMessage={TUTORIAL_DIALOGUE.firstReward.explanation} onContinue={() => {}} />
    ),
    'progress-unlocked': () => (
        <UnlockPopup feature="Progress" onContinue={() => {}} />
    ),
    'progress-tour': () => (
        <TutorialGuide
            message={"Welcome to Progress! Here's how it works:\n\nPRACTICE: Pick any skill and drill questions at your level. Every 3 correct answers in a row = +50 Aura. Exiting early? You keep partial streak rewards!\n\nBOSS FIGHT: Win a 10-question fight to LEVEL UP the skill — from Easy → Medium → Hard → Master. Beating a boss earns Aura + Guardian XP. You can bring up to 2 power-ups into each fight.\n\nI've added a special Tutorial skill for you to try first!"}
            onNext={() => {}}
            buttonText="Start Tutorial Practice"
            position="top"
        />
    ),
    'training-unlocked': () => (
        <UnlockPopup feature="Training" onContinue={() => {}} />
    ),
    'forced-training-nav': () => (
        <ForcedNavigation phase="forced-training" message={TUTORIAL_DIALOGUE.forcedTraining.intro} subMessage={TUTORIAL_DIALOGUE.forcedTraining.instruction} showArrow={false} />
    ),
    'forced-training-guide': () => (
        <TutorialGuide message={TUTORIAL_DIALOGUE.forcedTraining.purpose} onNext={() => {}} buttonText="Continue" position="top" />
    ),
    'shop-unlocked': () => (
        <UnlockPopup feature="Shop" onContinue={() => {}} />
    ),
    'forced-shop-nav': () => (
        <ForcedNavigation phase="forced-shop" message={TUTORIAL_DIALOGUE.forcedShop.intro} showArrow={false} />
    ),
    'forced-shop-guide': () => (
        <TutorialGuide message={TUTORIAL_DIALOGUE.forcedShop.instruction} position="top" showCharacter={false} />
    ),
    'tutorial-boss': () => (
        <TutorialGuide message={TUTORIAL_DIALOGUE.tutorialBoss.intro} onNext={() => {}} buttonText="Let's fight!" position="top" />
    ),
    'tutorial-skill-complete': () => (
        <TutorialGuide
            message={TUTORIAL_DIALOGUE.tutorialSkillComplete.celebration + '\n\n' + TUTORIAL_DIALOGUE.tutorialSkillComplete.encouragement}
            onNext={() => {}}
            buttonText={TUTORIAL_DIALOGUE.tutorialSkillComplete.button}
        />
    ),
    'leaderboard-unlocked': () => (
        <UnlockPopup feature="Leaderboard" onContinue={() => {}} />
    ),
    'leaderboard-tour': () => (
        <TutorialGuide
            message={TUTORIAL_DIALOGUE.leaderboardTour.intro + '\n\n' + TUTORIAL_DIALOGUE.leaderboardTour.promotion + '\n\n' + TUTORIAL_DIALOGUE.leaderboardTour.encouragement}
            onNext={() => {}}
            buttonText="Let's compete!"
        />
    ),
    'explain-daily-missions': () => (
        <DailyMissionsExplainer onComplete={() => {}} />
    ),
};

const TestHarness: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const testCase = params.get('case') || 'welcome';
    const renderCase = CASES[testCase];

    if (!renderCase) {
        return <div id="test-error">Unknown case: {testCase}. Valid: {Object.keys(CASES).join(', ')}</div>;
    }

    return (
        <div className="bg-background min-h-screen" data-testid="harness-root">
            {renderCase()}
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<TestHarness />);

// Expose case list for the test runner
(window as any).__TUTORIAL_TEST_CASES__ = Object.keys(CASES);
