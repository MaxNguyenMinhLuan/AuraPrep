const fs = require('fs');
const path = require('path');

async function download() {
    try {
        console.log('Fetching Reading & Writing questions...');
        const rwRes = await fetch('https://pinesat.duckdns.org/api/questions');
        if (!rwRes.ok) throw new Error(`R/W fetch failed: ${rwRes.statusText}`);
        const rwQuestions = await rwRes.json();

        console.log('Fetching Math questions...');
        const mathRes = await fetch('https://pinesat.duckdns.org/api/questions?section=math');
        if (!mathRes.ok) throw new Error(`Math fetch failed: ${mathRes.statusText}`);
        const mathQuestions = await mathRes.json();

        const allQuestions = [...rwQuestions, ...mathQuestions];
        console.log(`Fetched ${rwQuestions.length} R/W and ${mathQuestions.length} Math. Total: ${allQuestions.length} questions.`);

        const targetPath = path.join(__dirname, '../public/questions.json');
        fs.writeFileSync(targetPath, JSON.stringify(allQuestions, null, 2), 'utf8');
        console.log(`Successfully saved merged questions to ${targetPath}`);
    } catch (err) {
        console.error('Error downloading questions:', err);
        process.exit(1);
    }
}

download();
