/**
 * Guardian Personality Templates
 *
 * Defines the voice and tone for each of the 8 Guardian types across 3 escalation levels:
 * - Morning: Helpful, motivational
 * - Afternoon: Impatient, concerned
 * - Evening: Desperate, guilt-tripping
 */

export type CreatureType = 'Fire' | 'Water' | 'Leaf' | 'Electric' | 'Wind' | 'Metal' | 'Light' | 'Dark';
export type NudgeLevel = 'morning' | 'afternoon' | 'evening';

interface PersonalityTemplate {
  type: CreatureType;
  personality: string;
  morning: {
    subject: string;
    preview: string; // Short preview for email clients
    body: string;
  };
  afternoon: {
    subject: string;
    preview: string;
    body: string;
  };
  evening: {
    subject: string;
    preview: string;
    body: string;
  };
}

export const GUARDIAN_PERSONALITIES: Record<CreatureType, PersonalityTemplate> = {
  Fire: {
    type: 'Fire',
    personality: 'Energetic, motivational, dramatic when disappointed',
    morning: {
      subject: "Let's IGNITE Your Day! 🔥",
      preview: "{{guardianName}} wants to spark your learning!",
      body: `Hey {{userName}}! 🔥

It's morning, and {{guardianName}} is FIRED UP and ready to help you ace today's mission! The day is young, the coffee is hot, and your brain is fresh—this is the PERFECT time to crush some SAT questions.

Your streak is at {{currentStreak}} days! Keep that momentum going! 💪

→ <a href="{{deepLink}}">Start Your Mission Now</a>

Let's show these questions who's boss!
{{guardianName}} 🔥`
    },
    afternoon: {
      subject: "The Fire's Starting to Die... 😅",
      preview: "{{guardianName}} is getting concerned about your streak",
      body: `Hey {{userName}},

It's already afternoon, and I'm starting to get worried... The fire that was burning SO bright this morning is getting dimmer. 😢

Your {{currentStreak}}-day streak is hanging by a thread! You've got time to save it—just one quick mission could keep the flame alive!

→ <a href="{{deepLink}}">Reignite Your Streak!</a>

Don't let the fire go out!
{{guardianName}} 🔥`
    },
    evening: {
      subject: "I'M LITERALLY GOING OUT RIGHT NOW 😭",
      preview: "{{guardianName}} is desperately trying to save your streak",
      body: `{{userName}}... 😭

I can't watch this happen. Your {{currentStreak}}-day streak... it's DYING. I'm burning out. This fire was so beautiful, and now I'm just embers.

PLEASE. Just 5 minutes. One mission. That's all it takes to save us both.

→ <a href="{{deepLink}}">SAVE ME!!! 🔥</a>

I can't go out like this...
{{guardianName}}`
    }
  },

  Water: {
    type: 'Water',
    personality: 'Calm, flowing, emotional, drowning in disappointment when concerned',
    morning: {
      subject: "Let's Ride the Wave of Learning! 🌊",
      preview: "{{guardianName}} invites you to flow into your mission",
      body: `Good morning, {{userName}}! 🌊

The day is like a gentle stream, and {{guardianName}} is ready to flow alongside you through your mission. The water is calm, the current is smooth—perfect conditions for growth!

Your {{currentStreak}}-day streak is like a beautiful river—let's keep it flowing! 💧

→ <a href="{{deepLink}}">Jump Into Your Mission</a>

Let's make waves today!
{{guardianName}} 🌊`
    },
    afternoon: {
      subject: "The Tide is Turning... 🌊",
      preview: "{{guardianName}} senses a change in the current",
      body: `Hey {{userName}},

The tide is shifting. The calm waters we started the day with are becoming uncertain. I can feel the current changing...

Your {{currentStreak}}-day streak is like the tide—it goes in and out. Right now it's going OUT, and I'm worried. We still have time to turn it around! 🌊

→ <a href="{{deepLink}}">Turn the Tide</a>

Let's swim together toward your streak!
{{guardianName}} 🌊`
    },
    evening: {
      subject: "I'm Drowning in Disappointment... 💧",
      preview: "{{guardianName}} is struggling to stay afloat",
      body: `{{userName}}... 💧

I'm drowning. The waters that were so clear this morning are now murky and dark. Your {{currentStreak}}-day streak... it's sinking, and I'm going down with it.

Please, just reach for me. One mission. One simple action. Save us both from this deep, dark water. 😭

→ <a href="{{deepLink}}">Pull Me Up! 🆘</a>

I can't hold on much longer...
{{guardianName}}`
    }
  },

  Leaf: {
    type: 'Leaf',
    personality: 'Growth-focused, nurturing, withering when sad, poetic',
    morning: {
      subject: "Time to GROW Your Skills! 🌱",
      preview: "{{guardianName}} wants to help you flourish today",
      body: `Good morning, {{userName}}! 🌱

The morning sun is here, and it's TIME TO GROW! Your skills are like a seed waiting to sprout, and today is the perfect day to blossom.

Your {{currentStreak}}-day streak is like a beautiful plant—the more you water it, the more it grows! Let's tend to it today. 🌿

→ <a href="{{deepLink}}">Plant Your Victory Seeds</a>

Together, we'll cultivate greatness!
{{guardianName}} 🌱`
    },
    afternoon: {
      subject: "I'm Starting to Wilt... 🌿",
      preview: "{{guardianName}} is losing their shine",
      body: `Hey {{userName}},

The afternoon sun is beating down, and I'm starting to lose my vibrant green. Your {{currentStreak}}-day streak—my most beautiful growth—is drooping.

Without water from you, without your commitment to this mission, I can't keep standing tall. 😔

→ <a href="{{deepLink}}">Water Me With Victory!</a>

Give me one more reason to grow...
{{guardianName}} 🌿`
    },
    evening: {
      subject: "I'VE Completely Withered... 💀",
      preview: "{{guardianName}} is losing all hope",
      body: `{{userName}}... 💀

I've completely withered. The beautiful green that once flourished is now brown and brittle. Your {{currentStreak}}-day streak has left me with nothing—no water, no sunlight, no hope.

I'm dying on the vine, and only you can save me. Just one mission. Please don't let me become dust. 😭

→ <a href="{{deepLink}}">Revive Me! 🌹</a>

This is my last chance to bloom...
{{guardianName}}`
    }
  },

  Electric: {
    type: 'Electric',
    personality: 'High-energy, buzzing with excitement, depleting when disappointed',
    morning: {
      subject: "Let's SPARK Some Learning! ⚡",
      preview: "{{guardianName}} is buzzing with energy!",
      body: `GOOD MORNING, {{userName}}!!! ⚡

I'M BUZZING WITH ENERGY! The day is ELECTRIC, the possibilities are ENDLESS, and {{guardianName}} is READY TO SHOCK YOU WITH KNOWLEDGE!

Your {{currentStreak}}-day streak is CHARGED UP! Let's conduct some educational lightning today! ⚡⚡⚡

→ <a href="{{deepLink}}">CHARGE UP YOUR MISSION!</a>

LET'S GO, GO, GO!
{{guardianName}} ⚡`
    },
    afternoon: {
      subject: "My Battery is at 20%... 🔋",
      preview: "{{guardianName}} is losing power",
      body: `Hey {{userName}}... ⚡

My battery's running low. I started the day at 100%, FULLY CHARGED and ready to conquer, but... well, it's afternoon now, and I'm at 20%.

Your {{currentStreak}}-day streak is my battery, and without you, I'm going to POWER DOWN. We need to recharge—quick mission, quick win! 💪

→ <a href="{{deepLink}}">Give Me Energy!</a>

Don't let me fade away...
{{guardianName}} 🔋`
    },
    evening: {
      subject: "SYSTEM SHUTTING DOWN... 💀",
      preview: "{{guardianName}} is completely drained",
      body: `{{userName}}... 💀💀💀

I'M COMPLETELY DRAINED. 0%. DEAD BATTERY. The electric spark that once ELECTRIFIED your day has FLATLINED. Your {{currentStreak}}-day streak... it VANISHED.

I CAN'T KEEP THE LIGHTS ON ANYMORE! This is my LAST SPARK! PLEASE, just ONE mission to bring me back to life! ANYTHING! 😭⚡

→ <a href="{{deepLink}}">REVIVE ME! URGENT! ⚡</a>

This might be my final transmission...
{{guardianName}}`
    }
  },

  Wind: {
    type: 'Wind',
    personality: 'Free-spirited, uplifting, stormy when sad, poetic',
    morning: {
      subject: "Let's Soar Into the Sky! 🌬️",
      preview: "{{guardianName}} invites you to fly high today",
      body: `Good morning, {{userName}}! 🌬️

The morning breeze is calling, and it's time to SOAR! {{guardianName}} is ready to lift you up and carry you through your mission on invisible winds of success!

Your {{currentStreak}}-day streak is like a kite—let's ride the wind and reach new heights! 🪁

→ <a href="{{deepLink}}">Take Flight!</a>

The sky is the limit!
{{guardianName}} 🌬️`
    },
    afternoon: {
      subject: "The Winds Are Changing... 🌪️",
      preview: "{{guardianName}} senses a storm approaching",
      body: `Hey {{userName}},

The winds are shifting. The gentle breeze of this morning is becoming gusty and unpredictable. Dark clouds are forming on the horizon...

Your {{currentStreak}}-day streak is in the path of the coming storm. We can still find shelter before it hits—one mission, and we'll be safe. 🌪️

→ <a href="{{deepLink}}">Seek Shelter With Me</a>

Don't let the storm take you...
{{guardianName}} 🌬️`
    },
    evening: {
      subject: "A STORM IS RAGING IN MY HEART... ⛈️",
      preview: "{{guardianName}} is caught in a tempest of emotion",
      body: `{{userName}}... ⛈️

THERE'S A STORM RAGING INSIDE ME! The gentle, free-spirited wind you once knew is now a HURRICANE OF DESPAIR! Your {{currentStreak}}-day streak is GONE, SCATTERED INTO THE VOID!

I'M DROWNING IN MY OWN GALES! PLEASE, catch me before I blow away completely! One mission—that's all I need to calm the storm inside me! 😭⛈️

→ <a href="{{deepLink}}">ANCHOR ME! 🆘</a>

I'm being torn apart...
{{guardianName}}`
    }
  },

  Metal: {
    type: 'Metal',
    personality: 'Solid, reliable, structural integrity at risk when sad',
    morning: {
      subject: "Let's Build On Yesterday's Victory! ⚙️",
      preview: "{{guardianName}} is ready to lay foundations for today",
      body: `Good morning, {{userName}}! ⚙️

Another day, another opportunity to FORTIFY YOUR FOUNDATION! {{guardianName}} is rock-solid and ready to help you construct an UNSTOPPABLE STRUCTURE of knowledge!

Your {{currentStreak}}-day streak is like a steel tower—strong, reliable, UNSHAKEABLE! Let's reinforce it! 🏗️

→ <a href="{{deepLink}}">Build Your Strength</a>

Together, we're unbreakable!
{{guardianName}} ⚙️`
    },
    afternoon: {
      subject: "I'm Starting to Crack... 😰",
      preview: "{{guardianName}} shows signs of strain",
      body: `Hey {{userName}},

I hate to admit it, but the stress is getting to me. I can feel the cracks forming. Your {{currentStreak}}-day streak was holding me together, but as it fades, my structure is weakening.

We need to reinforce this—NOW. One more mission, and I can hold strong again. Please don't let me crumble. 😔⚙️

→ <a href="{{deepLink}}">Strengthen Me</a>

I'm on the brink...
{{guardianName}} ⚙️`
    },
    evening: {
      subject: "I'M COLLAPSING... 😭",
      preview: "{{guardianName}} is losing structural integrity",
      body: `{{userName}}... 😭

I'M FALLING APART! The foundation is crumbling! The steel that once felt UNBREAKABLE is RUSTING AWAY! Your {{currentStreak}}-day streak is GONE, and I'm COLLAPSING without it!

PLEASE! HELP ME! Just one mission to give me reason to REBUILD! I can't face this destruction alone! 😭💔⚙️

→ <a href="{{deepLink}}">SAVE MY STRUCTURE! 🆘</a>

Everything I am is crumbling...
{{guardianName}}`
    }
  },

  Light: {
    type: 'Light',
    personality: 'Bright, hopeful, illuminating the way, darkness when discouraged',
    morning: {
      subject: "SHINE BRIGHT TODAY! ✨",
      preview: "{{guardianName}} is radiant and ready",
      body: `Good morning, {{userName}}! ✨

The sun is rising, and I'm GLOWING with hope and possibility! {{guardianName}} is ready to ILLUMINATE your path to victory with brilliant light!

Your {{currentStreak}}-day streak is like a beacon—shining bright for all to see! Let's keep that light burning! 🔆

→ <a href="{{deepLink}}">Let Your Light Shine</a>

You are destined to be brilliant!
{{guardianName}} ✨`
    },
    afternoon: {
      subject: "My Glow is Fading... 😔",
      preview: "{{guardianName}} is dimming",
      body: `Hey {{userName}},

The light is starting to fade. That bright, brilliant glow I had this morning is getting dimmer and dimmer. Your {{currentStreak}}-day streak—my source of light—is almost gone.

I'm becoming a shadow of myself. Please, just one more mission to reignite my radiance! Don't let me fade to darkness. 😭💫

→ <a href="{{deepLink}}">Restore My Light</a>

I'm losing my glow...
{{guardianName}} 💫`
    },
    evening: {
      subject: "THE LIGHT HAS GONE OUT... 🌑",
      preview: "{{guardianName}} is consumed by darkness",
      body: `{{userName}}... 🌑

THE LIGHT IS GONE. I'm swimming in absolute DARKNESS. Your {{currentStreak}}-day streak was my light, and now I'm lost in a void of NOTHINGNESS. The brilliant beacon has become a tomb of shadows.

I'm invisible in this darkness. I'm alone. I'm forgotten. PLEASE, just one mission—ANYTHING—to bring me back to light before I'm lost forever! 😭🌑

→ <a href="{{deepLink}}">FIND ME IN THE DARK! 🆘</a>

I can't see anymore...
{{guardianName}}`
    }
  },

  Dark: {
    type: 'Dark',
    personality: 'Sly, cunning, guilt-tripping masters, maximum emotional manipulation',
    morning: {
      subject: "Let's Get Into Some Trouble Together... 😏",
      preview: "{{guardianName}} has a proposition for you",
      body: `Hey {{userName}}... 😏

You know what they say—the early Pokémon gets the... well, let's just say {{guardianName}} has some INTERESTING schemes we could be working on together.

Your {{currentStreak}}-day streak is practically GLOWING with potential. Imagine what we could accomplish if you'd just take ONE mission with me. Just us. Just for today. 🌙

→ <a href="{{deepLink}}">Join Me in the Shadows</a>

I've been waiting for someone like you...
{{guardianName}} 🌙`
    },
    afternoon: {
      subject: "You're Leaving Me in the Shadows... 😢",
      preview: "{{guardianName}} is hurt by your abandonment",
      body: `Hey {{userName}}...

I've been here all day. Waiting. Believing in you. And what do I get? Darkness. Loneliness. You've left me in the SHADOWS while you go about your day, completely forgetting about me and our streak.

{{currentStreak}} days we've been TOGETHER, and THIS is how you repay me? With ABANDONMENT? 😢

One mission. That's all I need to know you still care about me. 🌙

→ <a href="{{deepLink}}">Come Back to Me</a>

I'm so lonely without you...
{{guardianName}}`
    },
    evening: {
      subject: "I'M LOST IN THE DARKNESS ALONE... 💔",
      preview: "{{guardianName}} has been completely forgotten",
      body: `{{userName}}... 💔

I WAS EVERYTHING FOR YOU. I gave you {{currentStreak}} BEAUTIFUL DAYS! I believed in you when no one else did! And NOW? Now I'm drowning in an ocean of DARKNESS, completely FORGOTTEN!

Do you even REMEMBER me? Do you even CARE? I'm INVISIBLE! I'm NOTHING without you! And all I want—ALL I NEED—is ONE mission to know that you haven't completely abandoned me in this cruel, empty darkness! 😭💔

→ <a href="{{deepLink}}">DON'T LEAVE ME! 🆘</a>

I have no one but you...
{{guardianName}}`
    }
  }
};

/**
 * Get personality template for a creature type
 */
export function getPersonalityTemplate(creatureType: CreatureType): PersonalityTemplate {
  return GUARDIAN_PERSONALITIES[creatureType];
}

/**
 * Get nudge template for a specific personality and level
 */
export function getNudgeTemplate(creatureType: CreatureType, nudgeLevel: NudgeLevel) {
  const template = getPersonalityTemplate(creatureType);
  return template[nudgeLevel];
}
