import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface PokemonToAdd {
  id: number;
  evolutionStage: 1 | 2 | 3;
  name: string;
  isShiny?: boolean;
}

async function addPokemonToUser(email: string) {
  try {
    console.log(`\n[INFO] Adding Pokemon to ${email}...`);

    // Query user by email in the 'users' collection
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();

    if (usersSnapshot.empty) {
      console.error(`[ERROR] No user found with email: ${email}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    console.log(`[INFO] Found user: ${userId}`);

    // Get current game data
    const gameDataRef = db.collection('users_game_data').doc(userId);
    const gameDataSnap = await gameDataRef.get();

    if (!gameDataSnap.exists) {
      console.log('[INFO] No existing game data, creating new document...');
    }

    const gameData = gameDataSnap.data() || {};
    const currentCreatures = gameData.creatures || [];

    // Find the max ID to assign unique instance IDs
    let maxId = 0;
    currentCreatures.forEach((c: any) => {
      if (c.id > maxId) maxId = c.id;
    });

    // Define the Pokemon to add
    const pokemonToAdd: PokemonToAdd[] = [
      // Charizard (final stage of Charmander line - id: 2)
      { id: 2, evolutionStage: 3, name: 'Charizard' },
      // Snorlax (no evolution - id: 74)
      { id: 74, evolutionStage: 1, name: 'Snorlax' },
      // Raichu (final stage of Pikachu line - id: 20)
      { id: 20, evolutionStage: 2, name: 'Raichu' },
      // Gyarados (final stage of Magikarp line - id: 51, SHINY)
      { id: 51, evolutionStage: 2, name: 'Shiny Gyarados', isShiny: true },
      // Dragonair (middle stage of Dratini line - id: 16) - keep unevolved
      { id: 16, evolutionStage: 2, name: 'Dragonair' },
      // Galarian Articuno (no evolution - id: 80)
      { id: 80, evolutionStage: 1, name: 'Galarian Articuno' }
    ];

    // Create new creature instances at max level (100)
    const newCreatures = pokemonToAdd.map((pokemon, index) => ({
      id: maxId + index + 1,
      creatureId: pokemon.id,
      xp: (100 - 5) * 30, // Max level 100 XP calculation (level * XP_PER_LEVEL)
      level: 100,
      evolutionStage: pokemon.evolutionStage,
      isShiny: pokemon.isShiny || false
    }));

    console.log(`[INFO] Adding ${newCreatures.length} new creatures:`);
    newCreatures.forEach((c, i) => {
      const poke = pokemonToAdd[i];
      console.log(`  - Instance ID ${c.id}: ${poke.name}, Level ${c.level}, Evolution Stage ${c.evolutionStage}${c.isShiny ? ' (Shiny)' : ''}`);
    });

    // Update the document
    const updatedCreatures = [...currentCreatures, ...newCreatures];
    await gameDataRef.set({
      ...gameData,
      creatures: updatedCreatures,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[SUCCESS] Added ${newCreatures.length} Pokemon to ${email}\n`);
  } catch (error: any) {
    console.error('[ERROR]', error.message);
  }
}

// Run the function
addPokemonToUser('maxidea2008@gmail.com');
