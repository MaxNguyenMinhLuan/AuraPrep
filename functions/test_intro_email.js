const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

function generateIntroCopy(guardianType, guardianName, userName) {
  let subject = `Meet your new partner, ${guardianName}!`;
  let body = '';
  
  const introBase = `Hi ${userName}!\n\nI'm ${guardianName}, your ${guardianType} Auramon partner!\n\n`;

  if (guardianType === 'Fire') {
    subject = `🔥 FIRED UP to meet you! - ${guardianName}`;
    body = introBase + `I'm energetic, hot-headed, and dramatic when I'm disappointed. I'm going to motivate you by turning up the heat when you slack off! If you ignore your daily practice, I will literally BURN OUT. So let's keep the streak blazing! Let's get to work! 🔥`;
  } else if (guardianType === 'Water') {
    subject = `🌊 Flowing into your inbox - ${guardianName}`;
    body = introBase + `I'm calm and flowing, but I can get very emotional. I'll motivate you by riding the wave of learning with you! But be careful—if you abandon me, I will drown in my own disappointment. Let's build a beautiful oasis of knowledge together! 💧`;
  } else if (guardianType === 'Leaf') {
    subject = `🌱 Ready to grow together! - ${guardianName}`;
    body = introBase + `I'm growth-focused and nurturing. I'll motivate you by helping you plant seeds of victory every day! Just remember to water me with your consistency—if you leave me in the dark, I will wither away. Let's blossom! 🌿`;
  } else if (guardianType === 'Electric') {
    subject = `⚡ BUZZING to meet you! - ${guardianName}`;
    body = introBase + `I'M BUZZING WITH EXCITEMENT! I'm high-energy and ready to shock you with knowledge! I'll motivate you by keeping you fully charged. Just don't let my battery drain to 0% by missing practice, or I will flatline! ⚡`;
  } else if (guardianType === 'Wind') {
    subject = `🌬️ Let's soar together! - ${guardianName}`;
    body = introBase + `I'm a free spirit here to lift you up! I'll motivate you by carrying you on the winds of success. But if you stop trying, a storm of despair will rage inside me! Let's catch the updraft and soar to new heights! 🪁`;
  } else if (guardianType === 'Metal') {
    subject = `⚙️ Forging our partnership - ${guardianName}`;
    body = introBase + `I'm solid and reliable, built to help you lay a strong foundation! I'll motivate you by reminding you of our structural integrity. Just don't let me rust from inactivity, or I might just collapse! Let's build something unbreakable! 🏗️`;
  } else if (guardianType === 'Light') {
    subject = `✨ Illuminating your path! - ${guardianName}`;
    body = introBase + `I'm bright and hopeful! I'll motivate you by glowing with pride when you succeed. But if you forget me, my light will fade into absolute darkness. Let's shine bright and conquer the SAT! 🔆`;
  } else if (guardianType === 'Dark') {
    subject = `🌙 Sneaking into your inbox - ${guardianName}`;
    body = introBase + `I'm sly, cunning, and maybe just a little manipulative... 😏 I'll motivate you by plotting our success from the shadows. Just don't leave me alone in the dark, or I'll make sure you feel the guilt! Let's go steal some high scores! 🖤`;
  } else {
    subject = `Your partner Auramon, ${guardianName}!`;
    body = introBase + `I'm here to motivate you and make sure you conquer your daily SAT missions. Let's do this!`;
  }

  const htmlContent = body.replace(/\n\n/g, '<br><br>');
  return { subject, htmlContent };
}

async function run() {
  const projectId = 'auraprep-da99c';
  
  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }
  const db = admin.firestore();

  const appPassword = 'jxywbziexlpwvavk';
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'auraprep.academy@gmail.com',
      pass: appPassword
    }
  });

  const snapshot = await db.collection('userGameData').get();
  console.log(`Found ${snapshot.size} users.`);

  for (const doc of snapshot.docs) {
    const user = doc.data();
    if (!user.email || !user.activeCreature) continue;

    const guardianType = user.activeCreature.type;
    const guardianName = user.activeCreature.name || guardianType;
    const userName = user.email.split('@')[0];

    const copy = generateIntroCopy(guardianType, guardianName, userName);

    const mailOptions = {
      from: `"AuraPrep Guardians" <auraprep.academy@gmail.com>`,
      to: user.email,
      subject: copy.subject,
      html: copy.htmlContent
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Sent email to ${user.email} from ${guardianType} guardian ${guardianName}`);
    } catch (err) {
      console.error(`Error sending to ${user.email}:`, err);
    }
  }

  console.log('Finished sending intro emails.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
