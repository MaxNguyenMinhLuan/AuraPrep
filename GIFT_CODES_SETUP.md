# Gift Code System - Database Setup

## Overview

Two types of gift codes:

1. **Single-Use Codes** - First user to claim wins, code can't be used again
2. **Multi-Use Codes** - Each user can redeem once (optional Pro requirement)

## Rewards

Codes can grant:
- Auramons (with level, evolution stage, shiny status)
- Aura points
- Power-ups (ELIMINATE, HINT, SKIP, SECOND_CHANCE, DOUBLE_JEOPARDY)

---

## Setup in Firestore

Collection: `gift_codes`
Document ID: The code itself (e.g., `LAUNCH6AURAMONS`, `SUMMER2024`)

---

## Type 1: Single-Use Code Example

**Document ID:** `LAUNCH6AURAMONS`

```json
{
  "type": "single-use",
  "claimedBy": null,
  "claimedAt": null,
  "expiresAt": "2026-12-31T23:59:59Z",
  "createdAt": "2026-07-29T00:00:00Z",
  "description": "Launch day - 6 max-level Auramons",
  "rewards": {
    "auramons": [
      {
        "id": 2,
        "name": "Charizard",
        "level": 100,
        "evolutionStage": 3,
        "isShiny": false
      },
      {
        "id": 74,
        "name": "Snorlax",
        "level": 100,
        "evolutionStage": 1,
        "isShiny": false
      },
      {
        "id": 20,
        "name": "Raichu",
        "level": 100,
        "evolutionStage": 2,
        "isShiny": false
      },
      {
        "id": 51,
        "name": "Gyarados",
        "level": 100,
        "evolutionStage": 2,
        "isShiny": true
      },
      {
        "id": 16,
        "name": "Dragonair",
        "level": 100,
        "evolutionStage": 2,
        "isShiny": false
      },
      {
        "id": 80,
        "name": "Galarian Articuno",
        "level": 100,
        "evolutionStage": 1,
        "isShiny": false
      }
    ],
    "aura": 0,
    "powerUps": {}
  }
}
```

**How it works:**
1. First user to enter `LAUNCH6AURAMONS` gets all 6 Auramons
2. `claimedBy` field gets set to their user ID
3. Any other user gets: "This gift code has already been claimed by another user"
4. Code expires on the date specified in `expiresAt`

---

## Type 2: Multi-Use Code Examples

### Example 1: Promotional Aura Boost (No Pro Required)

**Document ID:** `SUMMER500AURA`

```json
{
  "type": "multi-use",
  "requiresPro": false,
  "expiresAt": "2026-08-31T23:59:59Z",
  "createdAt": "2026-07-29T00:00:00Z",
  "description": "Summer promotion - 500 aura points",
  "rewards": {
    "auramons": [],
    "aura": 500,
    "powerUps": {}
  }
}
```

**How it works:**
- Each user can redeem once
- They get 500 aura points
- Tracked in `users_gift_code_redemptions` collection

---

### Example 2: Power-Up Pack (Pro Only)

**Document ID:** `PROTOOLS2024`

```json
{
  "type": "multi-use",
  "requiresPro": true,
  "expiresAt": "2026-12-31T23:59:59Z",
  "createdAt": "2026-07-29T00:00:00Z",
  "description": "Pro subscriber exclusive - tool bundle",
  "rewards": {
    "auramons": [],
    "aura": 0,
    "powerUps": {
      "ELIMINATE": 5,
      "HINT": 5,
      "SKIP": 5,
      "SECOND_CHANCE": 3,
      "DOUBLE_JEOPARDY": 2
    }
  }
}
```

**How it works:**
- Only users with `isPro: true` in their profile can redeem
- Each user can redeem once
- They get the power-up bundle

---

### Example 3: Legendary Auramon + Aura Combo

**Document ID:** `LEGENDARY2024`

```json
{
  "type": "multi-use",
  "requiresPro": false,
  "expiresAt": "2026-09-30T23:59:59Z",
  "createdAt": "2026-07-29T00:00:00Z",
  "description": "Legendary Auramon + 1000 aura",
  "rewards": {
    "auramons": [
      {
        "id": 80,
        "name": "Galarian Articuno",
        "level": 50,
        "evolutionStage": 1,
        "isShiny": false
      }
    ],
    "aura": 1000,
    "powerUps": {
      "ELIMINATE": 2,
      "HINT": 2
    }
  }
}
```

---

## Tracking Redemptions

### Single-Use Codes
```
Collection: gift_codes
Document: {code}
Fields: claimedBy (user ID), claimedAt (timestamp)
```

### Multi-Use Codes
```
Collection: users_gift_code_redemptions
Document ID: {userId}_{code}
Example: user123_SUMMER500AURA

Fields:
- userId: "user123"
- giftCode: "SUMMER500AURA"
- redeemedAt: "2026-07-29T10:30:00Z"
```

---

## Creating Your First Code (For maxidea2008@gmail.com)

To give yourself the 6 Auramons, create this single-use code in Firestore:

**Collection:** `gift_codes`
**Document ID:** `MAXIDEA6AURAMONS`

```json
{
  "type": "single-use",
  "claimedBy": null,
  "claimedAt": null,
  "expiresAt": "2027-12-31T23:59:59Z",
  "createdAt": "2026-07-29T00:00:00Z",
  "description": "Special code for maxidea2008@gmail.com - 6 max-level Auramons",
  "rewards": {
    "auramons": [
      {"id": 2, "name": "Charizard", "level": 100, "evolutionStage": 3, "isShiny": false},
      {"id": 74, "name": "Snorlax", "level": 100, "evolutionStage": 1, "isShiny": false},
      {"id": 20, "name": "Raichu", "level": 100, "evolutionStage": 2, "isShiny": false},
      {"id": 51, "name": "Gyarados", "level": 100, "evolutionStage": 2, "isShiny": true},
      {"id": 16, "name": "Dragonair", "level": 100, "evolutionStage": 2, "isShiny": false},
      {"id": 80, "name": "Galarian Articuno", "level": 100, "evolutionStage": 1, "isShiny": false}
    ],
    "aura": 0,
    "powerUps": {}
  }
}
```

Then in the app:
1. Click your profile picture
2. Go to "Redeem Gift Code"
3. Enter: `MAXIDEA6AURAMONS`
4. Click Redeem
5. You should get all 6 Auramons! ✨

---

## Best Practices

- **Single-use for limited events** - Launch day, special drops, contest winners
- **Multi-use for ongoing promotions** - Seasonal events, referral codes, newsletter signups
- **Pro codes** - Exclusive rewards for paying users
- **Expiration dates** - Always set to prevent old codes from cluttering inventory
- **Code naming** - Use descriptive uppercase names (SUMMER2024, PROMO100AURA, etc.)
