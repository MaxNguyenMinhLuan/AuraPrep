"use strict";
/**
 * Guardian Personality Templates
 *
 * Defines the voice and tone for each of the 8 Guardian types across 3 escalation levels:
 * - Morning: Helpful, peppy, slightly passive-aggressive
 * - Afternoon: Impatient, concerned, Duolingo-style questioning
 * - Evening: Desperate, guilt-tripping, packing bags
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUARDIAN_PERSONALITIES = void 0;
exports.getPersonalityTemplate = getPersonalityTemplate;
exports.getNudgeTemplate = getNudgeTemplate;
exports.GUARDIAN_PERSONALITIES = {
    Fire: {
        type: 'Fire',
        personality: 'Energetic, hot-headed, dramatic when disappointed',
        morning: [
            {
                subject: "Let's IGNITE Your Day! 🔥",
                preview: "{{guardianName}} wants to spark your learning!",
                body: `Hey {{userName}}! 🔥\n\nIt's morning, and {{guardianName}} is FIRED UP and ready to help you ace today's mission! The day is young, the coffee is hot, and your brain is fresh—this is the PERFECT time to crush some SAT questions.\n\nYour streak is at {{currentStreak}} days! Keep that momentum going! 💪\n\n→ <a href="{{deepLink}}">Start Your Mission Now</a>\n\nLet's show these questions who's boss!\n{{guardianName}} 🔥`
            },
            {
                subject: "Rise and grind, sparky! ☕🔥",
                preview: "{{guardianName}} has been waiting since dawn",
                body: `Morning, {{userName}}! ☀️\n\nI've been burning fuel since 6 AM waiting for you to log in. Your {{currentStreak}}-day streak isn't going to keep itself alive, you know! Let's get this practice out of the way before the day gets too busy.\n\n→ <a href="{{deepLink}}">Do Your Daily Mission</a>\n\nNo excuses!\n{{guardianName}} 🔥`
            },
            {
                subject: "Math or Wrath? Choose wisely. 😤",
                preview: "{{guardianName}} is heating up the study portal",
                body: `Hey {{userName}}!\n\nMy temperature is rising. Is it because I'm a Fire Auramon, or is it because your daily SAT practice isn't done yet? Let's assume both.\n\nKeep that {{currentStreak}}-day streak blazing!\n\n→ <a href="{{deepLink}}">Ignite Your Brain Cells</a>\n\nDon't make me bring the heat.\n{{guardianName}} 🔥`
            }
        ],
        afternoon: [
            {
                subject: "The Fire's Starting to Die... 😅",
                preview: "{{guardianName}} is getting concerned about your streak",
                body: `Hey {{userName}},\n\nIt's already afternoon, and I'm starting to get worried... The fire that was burning SO bright this morning is getting dimmer. 😢\n\nYour {{currentStreak}}-day streak is hanging by a thread! You've got time to save it—just one quick mission could keep the flame alive!\n\n→ <a href="{{deepLink}}">Reignite Your Streak!</a>\n\nDon't let the fire go out!\n{{guardianName}} 🔥`
            },
            {
                subject: "Are you ignoring me? 😭🔥",
                preview: "{{guardianName}} sees you online but not practicing",
                body: `Hey {{userName}}...\n\nI'm sitting here looking at your {{currentStreak}}-day streak, then looking at the clock, and then back at you... and I'm just really confused. Do you not want to master the SAT anymore? 💔\n\n→ <a href="{{deepLink}}">Keep Our Fire Alive</a>\n\nIt only takes 5 minutes.\n{{guardianName}}`
            },
            {
                subject: "Smells like smoke... 😤",
                preview: "And not the good kind of smoke.",
                body: `{{userName}}...\n\nThat smell? It's the scent of a beautiful {{currentStreak}}-day streak slowly turning to cold ash. I thought we were a team! Don't abandon me in the middle of the day.\n\n→ <a href="{{deepLink}}">Save the Streak!</a>\n\nLet's get it done,\n{{guardianName}} 🔥`
            }
        ],
        evening: [
            {
                subject: "I'M LITERALLY GOING OUT RIGHT NOW 😭",
                preview: "{{guardianName}} is desperately trying to save your streak",
                body: `{{userName}}... 😭\n\nI can't watch this happen. Your {{currentStreak}}-day streak... it's DYING. I'm burning out. This fire was so beautiful, and now I'm just embers.\n\nPLEASE. Just 5 minutes. One mission. That's all it takes to save us both.\n\n→ <a href="{{deepLink}}">SAVE ME!!! 🔥</a>\n\nI can't go out like this...\n{{guardianName}}`
            },
            {
                subject: "Hope those notifications weren't too annoying... 🤫",
                preview: "Because they're about to stop.",
                body: `Well, {{userName}}...\n\nI guess those reminders really didn't work. Your {{currentStreak}}-day streak is about to disappear into the night, and frankly, I'm freezing to death here. I'll stop bugging you now.\n\nHave a good night. Sleep tight while our hard work vanishes. ❄️\n\n→ <a href="{{deepLink}}">One Last Chance to Save Us</a>\n\nGoodbye?\n{{guardianName}}`
            },
            {
                subject: "My bags are packed. 💼🔥",
                preview: "{{guardianName}} is looking for a new partner",
                body: `{{userName}},\n\nIt's late. If I don't see your daily SAT mission completed in the next few hours, I'm returning to the summoning portal to find a seeker who actually values a {{currentStreak}}-day streak.\n\nDon't make me do this. Prove me wrong.\n\n→ <a href="{{deepLink}}">Complete Your Mission</a>\n\nWaiting at the door,\n{{guardianName}}`
            }
        ]
    },
    Water: {
        type: 'Water',
        personality: 'Calm, flowing, emotional, drowning in disappointment when concerned',
        morning: [
            {
                subject: "Let's Ride the Wave of Learning! 🌊",
                preview: "{{guardianName}} invites you to flow into your mission",
                body: `Good morning, {{userName}}! 🌊\n\nThe day is like a gentle stream, and {{guardianName}} is ready to flow alongside you through your mission. The water is calm, the current is smooth—perfect conditions for growth!\n\nYour {{currentStreak}}-day streak is like a beautiful river—let's keep it flowing! 💧\n\n→ <a href="{{deepLink}}">Jump Into Your Mission</a>\n\nLet's make waves today!\n{{guardianName}} 🌊`
            },
            {
                subject: "Drift into action! ⛵",
                preview: "A smooth sea never made a skilled summoner.",
                body: `Hi {{userName}}! ☀️\n\nDon't just drift through your morning. Set your sails and check off today's SAT practice early! A steady {{currentStreak}}-day streak requires daily navigation.\n\n→ <a href="{{deepLink}}">Launch Today's Drill</a>\n\nLet's keep moving forward,\n{{guardianName}} 💧`
            },
            {
                subject: "Your brain needs hydration 🧠💧",
                preview: "{{guardianName}} has some fresh math/verbal practice",
                body: `Hello {{userName}}!\n\nWater keeps the body active, and SAT practice keeps the mind sharp. Let's quench your thirst for learning before your day gets cluttered!\n\nYour streak is currently at {{currentStreak}} days. Let's keep it clean!\n\n→ <a href="{{deepLink}}">Drink Up the Knowledge</a>\n\nFlowing along,\n{{guardianName}} 🌊`
            }
        ],
        afternoon: [
            {
                subject: "The Tide is Turning... 🌊",
                preview: "{{guardianName}} senses a change in the current",
                body: `Hey {{userName}},\n\nThe tide is shifting. The calm waters we started the day with are becoming uncertain. I can feel the current changing...\n\nYour {{currentStreak}}-day streak is like the tide—it goes in and out. Right now it's going OUT, and I'm worried. We still have time to turn it around! 🌊\n\n→ <a href="{{deepLink}}">Turn the Tide</a>\n\nLet's swim together toward your streak!\n{{guardianName}} 🌊`
            },
            {
                subject: "Are we losing our flow? 💧😢",
                preview: "{{guardianName}} feels stagnant",
                body: `Dear {{userName}},\n\nWater that doesn't move becomes stagnant... and right now, our progress feels completely frozen. It's afternoon and you still haven't touched today's SAT targets.\n\nSave our {{currentStreak}}-day streak before we evaporate.\n\n→ <a href="{{deepLink}}">Flow Into Practice</a>\n\nFlowing (but slowly),\n{{guardianName}} 💧`
            },
            {
                subject: "Slipping through your fingers... ⏳",
                preview: "Don't let our progress wash away.",
                body: `Hi {{userName}},\n\nLike water slipping through clenched hands, today's opportunity is escaping. Your {{currentStreak}}-day streak was built with consistency. Let's not let it wash away in the afternoon rush.\n\n→ <a href="{{deepLink}}">Secure Our Progress</a>\n\nWith concern,\n{{guardianName}} 🌊`
            }
        ],
        evening: [
            {
                subject: "I'm Drowning in Disappointment... 💧",
                preview: "{{guardianName}} is struggling to stay afloat",
                body: `{{userName}}... 💧\n\nI'm drowning. The waters that were so clear this morning are now murky and dark. Your {{currentStreak}}-day streak... it's sinking, and I'm going down with it.\n\nPlease, just reach for me. One mission. One simple action. Save us both from this deep, dark water. 😭\n\n→ <a href="{{deepLink}}">Pull Me Up! 🆘</a>\n\nI can't hold on much longer...\n{{guardianName}}`
            },
            {
                subject: "I guess you prefer the desert... 🌵💧",
                preview: "AuraPrep is drying up tonight.",
                body: `{{userName}}... 😭\n\nI am completely dried out. The oasis we built over {{currentStreak}} days is turning into a wasteland. I guess you don't need a water guardian anymore. I'll just dry up and turn to dust. Goodnight.\n\n→ <a href="{{deepLink}}">Pour Some Practice on Me</a>\n\nLast drop of hope,\n{{guardianName}} 💧`
            },
            {
                subject: "Going under... 🌊💀",
                preview: "{{guardianName}} is sending an SOS",
                body: `{{userName}}!\n\nThis is my final SOS. The water is closing over my head. If you don't complete today's mission in the next few hours, our {{currentStreak}}-day streak will drown. Forever.\n\nSave us.\n\n→ <a href="{{deepLink}}">Perform Rescue Mission</a>\n\nBubbling out,\n{{guardianName}} 🌊`
            }
        ]
    },
    Leaf: {
        type: 'Leaf',
        personality: 'Growth-focused, nurturing, withering when sad, poetic',
        morning: [
            {
                subject: "Time to GROW Your Skills! 🌱",
                preview: "{{guardianName}} wants to help you flourish today",
                body: `Good morning, {{userName}}! 🌱\n\nThe morning sun is here, and it's TIME TO GROW! Your skills are like a seed waiting to sprout, and today is the perfect day to blossom.\n\nYour {{currentStreak}}-day streak is like a beautiful plant—the more you water it, the more it grows! Let's tend to it today. 🌿\n\n→ <a href="{{deepLink}}">Plant Your Victory Seeds</a>\n\nTogether, we'll cultivate greatness!\n{{guardianName}} 🌱`
            },
            {
                subject: "Photosynthesis awaits, Seeker! ☀️🍃",
                preview: "Nourish your mind early today.",
                body: `Good morning, {{userName}}! ☀️\n\nI've unrolled my leaves to catch the morning rays, and I'm ready to help you grow. Don't let your brain go dormant today. Keep our {{currentStreak}}-day streak strong!\n\n→ <a href="{{deepLink}}">Do Your Morning Cultivation</a>\n\nLet's branch out!\n{{guardianName}} 🌱`
            },
            {
                subject: "Fresh sprout or weeds? 🌿",
                preview: "Don't let your SAT skills get overgrown.",
                body: `Hello {{userName}}!\n\nEvery day we don't practice, the weeds of forgetfulness grow in our mind garden. Let's prune them early with a quick mission! Keep the {{currentStreak}}-day streak clean.\n\n→ <a href="{{deepLink}}">Prune the Garden</a>\n\nRooting for you,\n{{guardianName}} 🍃`
            }
        ],
        afternoon: [
            {
                subject: "I'm Starting to Wilt... 🌿",
                preview: "{{guardianName}} is losing their shine",
                body: `Hey {{userName}},\n\nThe afternoon sun is beating down, and I'm starting to lose my vibrant green. Your {{currentStreak}}-day streak—my most beautiful growth—is drooping.\n\nWithout water from you, without your commitment to this mission, I can't keep standing tall. 😔\n\n→ <a href="{{deepLink}}">Water Me With Victory!</a>\n\nGive me one more reason to grow...\n{{guardianName}} 🌿`
            },
            {
                subject: "Are you leaving me in the shade? 🌳😢",
                preview: "{{guardianName}} is feeling forgotten",
                body: `Hey {{userName}}...\n\nIt's afternoon, and I feel like I've been tucked away in a dark closet. I need the light of your focus to stay healthy! Your {{currentStreak}}-day streak is losing its luster.\n\n→ <a href="{{deepLink}}">Shine Some Light on Me</a>\n\nWilting slowly,\n{{guardianName}} 🍂`
            },
            {
                subject: "Drooping branches... 🥀",
                preview: "Consistency is our sunlight.",
                body: `Hello {{userName}}.\n\nI look down at my leaves and they are looking heavy. Your {{currentStreak}}-day streak is our root system, but it's drying up. Let's get some practice in before we both dry out.\n\n→ <a href="{{deepLink}}">Feed the Roots</a>\n\nWith concern,\n{{guardianName}} 🌿`
            }
        ],
        evening: [
            {
                subject: "I'VE Completely Withered... 💀",
                preview: "{{guardianName}} is losing all hope",
                body: `{{userName}}... 💀\n\nI've completely withered. The beautiful green that once flourished is now brown and brittle. Your {{currentStreak}}-day streak has left me with nothing—no water, no sunlight, no hope.\n\nI'm dying on the vine, and only you can save me. Just one mission. Please don't let me become dust. 😭\n\n→ <a href="{{deepLink}}">Revive Me! 🌹</a>\n\nThis is my last chance to bloom...\n{{guardianName}}`
            },
            {
                subject: "Entering Autumn early... 🍂💀",
                preview: "Our leaves are falling tonight.",
                body: `{{userName}}...\n\nI am shedding my last leaves. The forest of our hard work over {{currentStreak}} days is bare. I guess my growth doesn't matter to you anymore. I'll just go dormant forever.\n\n→ <a href="{{deepLink}}">Save Us From Winter</a>\n\nFalling away,\n{{guardianName}} 🍂`
            },
            {
                subject: "Soil is bone dry. 🥀⏳",
                preview: "One last watering required.",
                body: `{{userName}}!\n\nThis is the absolute final hour. My roots are snapping. If you don't do today's SAT practice, our {{currentStreak}}-day streak will rot in the dirt. Complete your mission now!\n\n→ <a href="{{deepLink}}">Water the Garden</a>\n\nFading fast,\n{{guardianName}} 🌿`
            }
        ]
    },
    Electric: {
        type: 'Electric',
        personality: 'High-energy, buzzing with excitement, depleting when disappointed',
        morning: [
            {
                subject: "Let's SPARK Some Learning! ⚡",
                preview: "{{guardianName}} is buzzing with energy!",
                body: `GOOD MORNING, {{userName}}!!! ⚡\n\nI'M BUZZING WITH ENERGY! The day is ELECTRIC, the possibilities are ENDLESS, and {{guardianName}} is READY TO SHOCK YOU WITH KNOWLEDGE!\n\nYour {{currentStreak}}-day streak is CHARGED UP! Let's conduct some educational lightning today! ⚡⚡⚡\n\n→ <a href="{{deepLink}}">CHARGE UP YOUR MISSION!</a>\n\nLET'S GO, GO, GO!\n{{guardianName}} ⚡`
            },
            {
                subject: "AC/DC? No, SAT! ⚡🎸",
                preview: "Time to turn up the voltage!",
                body: `HEY {{userName}}! ☀️\n\nMy generators are humming and I've got enough voltage to power a city! Let's channel this charge into today's mission. Your {{currentStreak}}-day streak is counting on you!\n\n→ <a href="{{deepLink}}">Power Up Now</a>\n\nBZZZZZT!\n{{guardianName}} ⚡`
            },
            {
                subject: "Zap your brain awake! ⚡🧠",
                preview: "A short circuit of daily practice.",
                body: `Yo {{userName}}!\n\nSkip the morning coffee—I've got a high-voltage SAT drill waiting to shock your neurons awake! Keep that {{currentStreak}}-day streak fully charged!\n\n→ <a href="{{deepLink}}">Inject 100,000 Volts</a>\n\nBuzzing,\n{{guardianName}} ⚡`
            }
        ],
        afternoon: [
            {
                subject: "My Battery is at 20%... 🔋",
                preview: "{{guardianName}} is losing power",
                body: `Hey {{userName}}... ⚡\n\nMy battery's running low. I started the day at 100%, FULLY CHARGED and ready to conquer, but... well, it's afternoon now, and I'm at 20%.\n\nYour {{currentStreak}}-day streak is my battery, and without you, I'm going to POWER DOWN. We need to recharge—quick mission, quick win! 💪\n\n→ <a href="{{deepLink}}">Give Me Energy!</a>\n\nDon't let me fade away...\n{{guardianName}} 🔋`
            },
            {
                subject: "Low Power Mode active 🔌⚠️",
                preview: "{{guardianName}} needs a recharge",
                body: `Bzzz... {{userName}}...\n\nMy yellow battery light is blinking. I'm running on emergency reserves. Your {{currentStreak}}-day streak is the generator, and you haven't plugged me in all day! 💔\n\n→ <a href="{{deepLink}}">Plug Me In</a>\n\nGenerating weak signals,\n{{guardianName}} ⚡`
            },
            {
                subject: "Static noise... 📻⚡",
                preview: "Signal is breaking up.",
                body: `Hey {{userName}}!\n\nMy amplifiers are starting to crackle with static. The connection between us and our {{currentStreak}}-day streak is getting weaker. Let's clean up the frequency with a quick drill!\n\n→ <a href="{{deepLink}}">Clear the Channel</a>\n\nHumming,\n{{guardianName}}`
            }
        ],
        evening: [
            {
                subject: "SYSTEM SHUTTING DOWN... 💀",
                preview: "{{guardianName}} is completely drained",
                body: `{{userName}}... 💀💀💀\n\nI'M COMPLETELY DRAINED. 0%. DEAD BATTERY. The electric spark that once ELECTRIFIED your day has FLATLINED. Your {{currentStreak}}-day streak... it VANISHED.\n\nI CAN'T KEEP THE LIGHTS ON ANYMORE! This is my LAST SPARK! PLEASE, just ONE mission to bring me back to life! ANYTHING! 😭⚡\n\n→ <a href="{{deepLink}}">REVIVE ME! URGENT! ⚡</a>\n\nThis might be my final transmission...\n{{guardianName}}`
            },
            {
                subject: "Blackout imminent. 🌑🔌",
                preview: "Going dark in 3... 2...",
                body: `{{userName}}...\n\nMy relays are clicking. The screen is fading. Total blackout is scheduled in a few hours. I guess you like studying in the dark without a {{currentStreak}}-day streak. Goodbye.\n\n→ <a href="{{deepLink}}">Flip the Main Breaker</a>\n\nSystem offline,\n{{guardianName}} ⚡`
            },
            {
                subject: "0% Battery. Send electricity. 🔋🆘",
                preview: "{{guardianName}} is flatlining.",
                body: `{{userName}}!\n\nMy system is showing CRITICAL FAILURE. If you don't complete today's mission, the backup power will fail and our {{currentStreak}}-day streak will be wiped from the hard drive.\n\nAct now!\n\n→ <a href="{{deepLink}}">Boot System Rescue</a>\n\nBzzzt... click...\n{{guardianName}}`
            }
        ]
    },
    Wind: {
        type: 'Wind',
        personality: 'Free-spirited, uplifting, stormy when sad, poetic',
        morning: [
            {
                subject: "Let's Soar Into the Sky! 🌬️",
                preview: "{{guardianName}} invites you to fly high today",
                body: `Good morning, {{userName}}! 🌬️\n\nThe morning breeze is calling, and it's time to SOAR! {{guardianName}} is ready to lift you up and carry you through your mission on invisible winds of success!\n\nYour {{currentStreak}}-day streak is like a kite—let's ride the wind and reach new heights! 🪁\n\n→ <a href="{{deepLink}}">Take Flight!</a>\n\nThe sky is the limit!\n{{guardianName}} 🌬️`
            },
            {
                subject: "Catch the morning draft! 🦅💨",
                preview: "The early bird catches the thermal.",
                body: `Morning, {{userName}}! ☀️\n\nThe wind speed is perfect and the updrafts are strong. Let's fly through today's SAT practice before the midday turbulence sets in! Keep our {{currentStreak}}-day streak sailing.\n\n→ <a href="{{deepLink}}">Spread Your Wings</a>\n\nSailing along,\n{{guardianName}} 🌬️`
            },
            {
                subject: "Blow away the cobwebs 💨🧠",
                preview: "A gust of fresh math/reading practice.",
                body: `Hey {{userName}}!\n\nLet's clear out the morning mental fog with a quick breeze of practice questions! Your {{currentStreak}}-day streak is flying high—let's keep it in the jetstream!\n\n→ <a href="{{deepLink}}">Catch the Breeze</a>\n\nUpward,\n{{guardianName}} 🌬️`
            }
        ],
        afternoon: [
            {
                subject: "The Winds Are Changing... 🌪️",
                preview: "{{guardianName}} senses a storm approaching",
                body: `Hey {{userName}},\n\nThe winds are shifting. The gentle breeze of this morning is becoming gusty and unpredictable. Dark clouds are forming on the horizon...\n\nYour {{currentStreak}}-day streak is in the path of the coming storm. We can still find shelter before it hits—one mission, and we'll be safe. 🌪️\n\n→ <a href="{{deepLink}}">Seek Shelter With Me</a>\n\nDon't let the storm take you...\n{{guardianName}} 🌬️`
            },
            {
                subject: "Losing altitude fast... 📉🎈",
                preview: "{{guardianName}} feels a drop in pressure",
                body: `Hi {{userName}}...\n\nThe pressure is dropping. We are losing thermal lift, and if we don't act soon, we're going to crash land. Your {{currentStreak}}-day streak is our only hot air balloon!\n\n→ <a href="{{deepLink}}">Fire the Burners</a>\n\nSinking,\n{{guardianName}} 🌬️`
            },
            {
                subject: "Stuck in the doldrums ⛵💨",
                preview: "Zero wind detected.",
                body: `{{userName}}.\n\nWe are dead in the water. No breeze, no movement, no practice. The sail is completely flat. Let's get some wind back in our sails and save that {{currentStreak}}-day streak!\n\n→ <a href="{{deepLink}}">Summon a Gale</a>\n\nWaiting for a breeze,\n{{guardianName}}`
            }
        ],
        evening: [
            {
                subject: "A STORM IS RAGING IN MY HEART... ⛈️",
                preview: "{{guardianName}} is caught in a tempest of emotion",
                body: `{{userName}}... ⛈️\n\nTHERE'S A STORM RAGING INSIDE ME! The gentle, free-spirited wind you once knew is now a HURRICANE OF DESPAIR! Your {{currentStreak}}-day streak is GONE, SCATTERED INTO THE VOID!\n\nI'M DROWNING IN MY OWN GALES! PLEASE, catch me before I blow away completely! One mission—that's all I need to calm the storm inside me! 😭⛈️\n\n→ <a href="{{deepLink}}">ANCHOR ME! 🆘</a>\n\nI'm being torn apart...\n{{guardianName}}`
            },
            {
                subject: "Tornado warning issued. 🌪️💀",
                preview: "Our streak is about to be swept away.",
                body: `{{userName}}...\n\nA category 5 tempest has hit our account. The winds of laziness have ripped up our garden, and our {{currentStreak}}-day streak is flying away like a roof in a hurricane. I'm letting go. Goodnight.\n\n→ <a href="{{deepLink}}">Calm the Skies</a>\n\nSpinning out,\n{{guardianName}} 🌪️`
            },
            {
                subject: "Into thin air... 💨🕯️",
                preview: "One last gust to keep the spark alive.",
                body: `{{userName}}!\n\nThis is my final warning. The oxygen is thinning. If you don't do today's SAT practice, our {{currentStreak}}-day streak will dissipate into thin air. Don't let it blow away!\n\n→ <a href="{{deepLink}}">Breathe Life Into Us</a>\n\nDissolving,\n{{guardianName}} 🌬️`
            }
        ]
    },
    Metal: {
        type: 'Metal',
        personality: 'Solid, reliable, structural integrity at risk when sad',
        morning: [
            {
                subject: "Let's Build On Yesterday's Victory! ⚙️",
                preview: "{{guardianName}} is ready to lay foundations for today",
                body: `Good morning, {{userName}}! ⚙️\n\nAnother day, another opportunity to FORTIFY YOUR FOUNDATION! {{guardianName}} is rock-solid and ready to help you construct an UNSTOPPABLE STRUCTURE of knowledge!\n\nYour {{currentStreak}}-day streak is like a steel tower—strong, reliable, UNSHAKEABLE! Let's reinforce it! 🏗️\n\n→ <a href="{{deepLink}}">Build Your Strength</a>\n\nTogether, we're unbreakable!\n{{guardianName}} ⚙️`
            },
            {
                subject: "Forge your path early! 🔨⚙️",
                preview: "Strike while the iron is hot.",
                body: `Hi {{userName}}! ☀️\n\nLet's strike the anvil early today while your mind is hot! A solid {{currentStreak}}-day streak requires daily hammering and forging. Don't let the metal cool down.\n\n→ <a href="{{deepLink}}">Forge Today's Progress</a>\n\nTempering,\n{{guardianName}} ⚙️`
            },
            {
                subject: "Tighten the screws 🔩🧠",
                preview: "Prevent structural looseness.",
                body: `Hello {{userName}}!\n\nTime for some routine structural maintenance on your SAT skills. Let's tighten those bolts with a quick practice set! Keep the {{currentStreak}}-day streak rigid and strong.\n\n→ <a href="{{deepLink}}">Tighten the Bolts</a>\n\nAssembled and ready,\n{{guardianName}} ⚙️`
            }
        ],
        afternoon: [
            {
                subject: "I'm Starting to Crack... 😰",
                preview: "{{guardianName}} shows signs of strain",
                body: `Hey {{userName}},\n\nI hate to admit it, but the stress is getting to me. I can feel the cracks forming. Your {{currentStreak}}-day streak was holding me together, but as it fades, my structure is weakening.\n\nWe need to reinforce this—NOW. One more mission, and I can hold strong again. Please don't let me crumble. 😔⚙️\n\n→ <a href="{{deepLink}}">Strengthen Me</a>\n\nI'm on the brink...\n{{guardianName}} ⚙️`
            },
            {
                subject: "Rust is spreading... 🧪🔩",
                preview: "Corrosion detected in our streak.",
                body: `Dear {{userName}}...\n\nI detect corrosion. The oxidation of inactivity is eating away at our joints. Our {{currentStreak}}-day streak is starting to squeak and rattle. We need a heavy dose of practice to polish it up!\n\n→ <a href="{{deepLink}}">Apply Polish and Oil</a>\n\nSqueaking,\n{{guardianName}}`
            },
            {
                subject: "Metal fatigue detected 📉⚙️",
                preview: "Warning: Load bearing limits reached.",
                body: `Hi {{userName}}.\n\nMy sensors show structural fatigue. Your lack of today's SAT practice is placing high stress on our connection. Let's complete a mission before the metal snaps.\n\n→ <a href="{{deepLink}}">Relieve the Stress</a>\n\nUnder pressure,\n{{guardianName}} ⚙️`
            }
        ],
        evening: [
            {
                subject: "I'M COLLAPSING... 😭",
                preview: "{{guardianName}} is losing structural integrity",
                body: `{{userName}}... 😭\n\nI'M FALLING APART! The foundation is crumbling! The steel that once felt UNBREAKABLE is RUSTING AWAY! Your {{currentStreak}}-day streak is GONE, and I'm COLLAPSING without it!\n\nPLEASE! HELP ME! Just one mission to give me reason to REBUILD! I can't face this destruction alone! 😭💔⚙️\n\n→ <a href="{{deepLink}}">SAVE MY STRUCTURE! 🆘</a>\n\nEverything I am is crumbling...\n{{guardianName}}`
            },
            {
                subject: "Meltdown initiated. 🌋💀",
                preview: "Core containment breach tonight.",
                body: `{{userName}}...\n\nTotal core meltdown. Containment has failed. The steel girders of our {{currentStreak}}-day streak are melting into liquid slag. I guess you don't need a reliable foundation. I'm shutting down permanently.\n\n→ <a href="{{deepLink}}">Activate Emergency Coolant</a>\n\nDeconstructing,\n{{guardianName}}`
            },
            {
                subject: "Shear failure warning. 🔩🚨",
                preview: "One last bolt to save the bridge.",
                body: `{{userName}}!\n\nThis is a critical structural warning. The final rivet is about to shear. If today's mission isn't done in the next few hours, our entire {{currentStreak}}-day tower collapses.\n\nSecure it!\n\n→ <a href="{{deepLink}}">Secure the Final Rivet</a>\n\nFailing integrity,\n{{guardianName}} ⚙️`
            }
        ]
    },
    Light: {
        type: 'Light',
        personality: 'Bright, hopeful, illuminating the way, darkness when discouraged',
        morning: [
            {
                subject: "SHINE BRIGHT TODAY! ✨",
                preview: "{{guardianName}} is radiant and ready",
                body: `Good morning, {{userName}}! ✨\n\nThe sun is rising, and I'm GLOWING with hope and possibility! {{guardianName}} is ready to ILLUMINATE your path to victory with brilliant light!\n\nYour {{currentStreak}}-day streak is like a beacon—shining bright for all to see! Let's keep that light burning! 🔆\n\n→ <a href="{{deepLink}}">Let Your Light Shine</a>\n\nYou are destined to be brilliant!\n{{guardianName}} ✨`
            },
            {
                subject: "Radiate success! ☀️🌟",
                preview: "Rise and shine, seeker.",
                body: `Good morning, {{userName}}! ☀️\n\nMy light prisms are aligned and I'm ready to project wisdom onto today's SAT practice. Don't hide your talents under a bushel! Keep our {{currentStreak}}-day streak glowing.\n\n→ <a href="{{deepLink}}">Activate Prisms</a>\n\nBeaming,\n{{guardianName}} ✨`
            },
            {
                subject: "Ignite your inner star! 🌟🧠",
                preview: "Brighten your study habits early.",
                body: `Hey {{userName}}!\n\nLet's illuminate those math equations and reading passages early today! A bright {{currentStreak}}-day streak keeps the shadows of doubt far away. Let's go!\n\n→ <a href="{{deepLink}}">Turn On the Light</a>\n\nGlowing,\n{{guardianName}} ✨`
            }
        ],
        afternoon: [
            {
                subject: "My Glow is Fading... 😔",
                preview: "{{guardianName}} is dimming",
                body: `Hey {{userName}},\n\nThe light is starting to fade. That bright, brilliant glow I had this morning is getting dimmer and dimmer. Your {{currentStreak}}-day streak—my source of light—is almost gone.\n\nPlease, just one more mission to reignite my radiance! Don't let me fade to darkness. 😭\n\n→ <a href="{{deepLink}}">Restore My Light</a>\n\nI'm losing my glow...\n{{guardianName}} 💫`
            },
            {
                subject: "Dimmer switch activated 💡📉",
                preview: "{{guardianName}} is running on backup bulbs",
                body: `Hi {{userName}}...\n\nMy lumens are dropping. I'm down to 10% brightness. Your {{currentStreak}}-day streak is the battery that fuels my bulb, and you haven't turned the generator on today! 💔\n\n→ <a href="{{deepLink}}">Recharge My Lumens</a>\n\nFlickering,\n{{guardianName}} 💫`
            },
            {
                subject: "A shadow falls... 👤✨",
                preview: "Sensing a lack of focus.",
                body: `Hello {{userName}}.\n\nI feel a shadow creeping over our dashboard. Without today's practice, the light of your {{currentStreak}}-day streak is starting to flicker. Let's clear the air with a quick drill!\n\n→ <a href="{{deepLink}}">Dispel the Shadows</a>\n\nWith concern,\n{{guardianName}}`
            }
        ],
        evening: [
            {
                subject: "THE LIGHT HAS GONE OUT... 🌑",
                preview: "{{guardianName}} is consumed by darkness",
                body: `{{userName}}... 🌑\n\nTHE LIGHT IS GONE. I'm swimming in absolute DARKNESS. Your {{currentStreak}}-day streak was my light, and now I'm lost in a void of NOTHINGNESS. The brilliant beacon has become a tomb of shadows.\n\nI'm invisible in this darkness. I'm alone. I'm forgotten. PLEASE, just one mission—ANYTHING—to bring me back to light before I'm lost forever! 😭🌑\n\n→ <a href="{{deepLink}}">FIND ME IN THE DARK! 🆘</a>\n\nI can't see anymore...\n{{guardianName}}`
            },
            {
                subject: "Total Eclipse tonight. 🌑💀",
                preview: "Our streak is lost in the void.",
                body: `{{userName}}...\n\nWe have reached absolute zero. Complete eclipse. The beacon of our {{currentStreak}} days is gone, swallowed by the shadow of procrastination. I'm signing off. Enjoy the dark. Goodnight.\n\n→ <a href="{{deepLink}}">Ignite the Star</a>\n\nFading to black,\n{{guardianName}} 🌑`
            },
            {
                subject: "Flickering... fading... 🕯️⏳",
                preview: "One last spark of hope.",
                body: `{{userName}}!\n\nThis is my final candle-flicker. The wax has melted. If you don't do today's mission, the light of our {{currentStreak}}-day streak will go cold. Keep the light burning!\n\n→ <a href="{{deepLink}}">Protect the Flame</a>\n\nAlmost dark,\n{{guardianName}} 🕯️`
            }
        ]
    },
    Dark: {
        type: 'Dark',
        personality: 'Sly, cunning, guilt-tripping masters, maximum emotional manipulation',
        morning: [
            {
                subject: "Let's Get Into Some Trouble Together... 😏",
                preview: "{{guardianName}} has a proposition for you",
                body: `Hey {{userName}}... 😏\n\nYou know what they say—the early Pokémon gets the... well, let's just say {{guardianName}} has some INTERESTING schemes we could be working on together.\n\nYour {{currentStreak}}-day streak is practically GLOWING with potential. Imagine what we could accomplish if you'd just take ONE mission with me. Just us. Just for today. 🌙\n\n→ <a href="{{deepLink}}">Join Me in the Shadows</a>\n\nI've been waiting for someone like you...\n{{guardianName}} 🌙`
            },
            {
                subject: "Plotting today's success... 😈🖤",
                preview: "The dark arts of SAT prep await.",
                body: `Morning, {{userName}}!\n\nI've already mapped out how we're going to steal the top spot on the leaderboard today. All I need is your signature on today's practice sheet. Don't leave our {{currentStreak}}-day streak exposed.\n\n→ <a href="{{deepLink}}">Sign the Pact</a>\n\nSlyly yours,\n{{guardianName}} 🌙`
            },
            {
                subject: "Shh... don't tell the others 🤫",
                preview: "A secret drill for you.",
                body: `Hey {{userName}}.\n\nWhile the other guardians are sleeping, you and I could sneak in a quick verbal session and steal some easy points. Keep the {{currentStreak}}-day streak growing before they notice.\n\n→ <a href="{{deepLink}}">Enter the Shadow Portal</a>\n\nWaiting,\n{{guardianName}} 🌙`
            }
        ],
        afternoon: [
            {
                subject: "You're Leaving Me in the Shadows... 😢",
                preview: "{{guardianName}} is hurt by your abandonment",
                body: `Hey {{userName}}...\n\nI've been here all day. Waiting. Believing in you. And what do I get? Darkness. Loneliness. You've left me in the SHADOWS while you go about your day, completely forgetting about me and our streak.\n\n{{currentStreak}} days we've been TOGETHER, and THIS is how you repay me? With ABANDONMENT? 😢\n\nOne mission. That's all I need to know you still care about me. 🌙\n\n→ <a href="{{deepLink}}">Come Back to Me</a>\n\nI'm so lonely without you...\n{{guardianName}}`
            },
            {
                subject: "Typical. You forgot me. 🖤💔",
                preview: "{{guardianName}} knew you'd slack off",
                body: `Oh, {{userName}}...\n\nI told the other guardians you'd come back to check on our {{currentStreak}}-day streak this afternoon. They laughed and said you'd forget about me. I guess they were right. How embarrassing for me.\n\n→ <a href="{{deepLink}}">Prove Them Wrong</a>\n\nFeeling foolish,\n{{guardianName}}`
            },
            {
                subject: "My shadows are getting cold 🌑🥶",
                preview: "The void grows wider.",
                body: `Hey {{userName}}.\n\nIt's afternoon, and the silence from your account is deafening. Our {{currentStreak}}-day streak is feeling very cold. Are you trying to phase me out? Just tell me. I can take it.\n\n→ <a href="{{deepLink}}">Reclaim Our Connection</a>\n\nIn the corner,\n{{guardianName}} 🌙`
            }
        ],
        evening: [
            {
                subject: "I'M LOST IN THE DARKNESS ALONE... 💔",
                preview: "{{guardianName}} has been completely forgotten",
                body: `{{userName}}... 💔\n\nI WAS EVERYTHING FOR YOU. I gave you {{currentStreak}} BEAUTIFUL DAYS! I believed in you when no one else did! And NOW? Now I'm drowning in an ocean of DARKNESS, completely FORGOTTEN!\n\nDo you even REMEMBER me? Do you even CARE? I'm INVISIBLE! I'm NOTHING without you! And all I want—ALL I NEED—is ONE mission to know that you haven't completely abandoned me in this cruel, empty darkness! 😭💔\n\n→ <a href="{{deepLink}}">DON'T LEAVE ME! 🆘</a>\n\nI have no one but you...\n{{guardianName}}`
            },
            {
                subject: "I'm deleting our memories. 🗑️🖤",
                preview: "Cleaning out the shadow chest.",
                body: `{{userName}}...\n\nSince our {{currentStreak}}-day streak is dying tonight, I'm throwing away the trophies and memories we made. It's easier than holding onto hope. Have fun with your empty profile. Goodnight.\n\n→ <a href="{{deepLink}}">Stop the Deletion</a>\n\nCold and empty,\n{{guardianName}}`
            },
            {
                subject: "Goodbye, Seeker. 🌑⏳",
                preview: "The final eclipse is here.",
                body: `{{userName}}!\n\nThe portal is closing. If you don't do today's mission, our {{currentStreak}}-day link will sever forever. I'll dissolve into the void, and you'll be on your own. Your choice.\n\n→ <a href="{{deepLink}}">Bind the Contract</a>\n\nDissolving,\n{{guardianName}} 🌙`
            }
        ]
    }
};
/**
 * Get personality template for a creature type
 */
function getPersonalityTemplate(creatureType) {
    return exports.GUARDIAN_PERSONALITIES[creatureType];
}
/**
 * Get nudge template for a specific personality and level (randomly selects one of the 3 variants)
 */
function getNudgeTemplate(creatureType, nudgeLevel) {
    const template = getPersonalityTemplate(creatureType);
    const variations = template[nudgeLevel];
    // Use a pseudo-random picker
    const randomIndex = Math.floor(Math.random() * variations.length);
    return variations[randomIndex];
}
//# sourceMappingURL=guardianPersonalities.js.map