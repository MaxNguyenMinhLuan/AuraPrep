# Gift Code System

Gift codes allow you to reward players with special Auramons for promotional events. Each code is one-time use per player.

## Creating a Gift Code

To create a gift code for your promo events, you need to manually add a document to the Firestore `gift_codes` collection.

### Collection Structure

**Collection:** `gift_codes`
**Document ID:** The gift code itself (e.g., `SUMMER2024`, `LAUNCH10`, etc.)

### Document Fields

```json
{
  "code": "SUMMER2024",
  "auramonId": 2,
  "auramonName": "Charizard",
  "level": 50,
  "evolutionStage": 3,
  "isShiny": false,
  "expiresAt": "2024-08-31T23:59:59Z",
  "createdAt": "2024-07-01T00:00:00Z",
  "description": "Summer celebration reward - Charizard"
}
```

### Field Descriptions

- **code**: The gift code string (auto-populated from doc ID, uppercase recommended)
- **auramonId**: The creature ID from INITIAL_CREATURES (e.g., 2 for Charizard, 74 for Snorlax)
- **auramonName**: Human-readable name for reference (e.g., "Charizard")
- **level**: Starting level for the Auramon (default: 5)
- **evolutionStage**: Starting evolution stage - 1, 2, or 3
- **isShiny**: Boolean flag for shiny variant
- **expiresAt**: ISO 8601 timestamp when code becomes invalid (optional, leave empty for no expiration)
- **createdAt**: ISO 8601 timestamp of code creation
- **description**: Notes about the promotion (optional)

### Example Gift Codes

#### Code 1: Early Founder Reward
```json
{
  "auramonId": 20,
  "auramonName": "Raichu",
  "level": 30,
  "evolutionStage": 2,
  "isShiny": false,
  "expiresAt": "2025-12-31T23:59:59Z",
  "description": "Founder's launch reward"
}
```

#### Code 2: Seasonal Shiny Event
```json
{
  "auramonId": 51,
  "auramonName": "Gyarados",
  "level": 5,
  "evolutionStage": 1,
  "isShiny": true,
  "expiresAt": "2026-02-14T23:59:59Z",
  "description": "Valentine's Day special - Shiny Gyarados"
}
```

#### Code 3: Level 100 Legendary
```json
{
  "auramonId": 80,
  "auramonName": "Galarian Articuno",
  "level": 100,
  "evolutionStage": 1,
  "isShiny": false,
  "expiresAt": "2025-09-30T23:59:59Z",
  "description": "Anniversary celebration - Max level Articuno"
}
```

## How Players Use Gift Codes

1. Navigate to the **Summon** tab
2. Look for the "Enter gift code..." input field at the top
3. Paste or type the gift code (case-insensitive)
4. Click **Redeem**
5. If valid, they'll receive the Auramon immediately

## Redemption Rules

- **One-time use per player**: Each player can only redeem a specific code once
- **Expiration**: If `expiresAt` is set and has passed, the code cannot be redeemed
- **Not consumed until redemption**: Creating a code doesn't consume it; it's marked used only after redemption
- **No level-up**: Redeemed Auramons don't auto-level to 100; they use the specified level

## Tracking Redemptions

Redemptions are stored in the `users_gift_code_redemptions` collection:

```json
{
  "userId": "firebase_uid",
  "giftCode": "SUMMER2024",
  "redeemedAt": "2024-07-15T10:30:00Z",
  "auramonId": 2,
  "auramonName": "Charizard"
}
```

Use this collection to see which users have redeemed which codes.

## Admin Access

Only `maxidea2008@gmail.com` can:
- Add bulk special Auramons via the admin panel
- All other users can only redeem gift codes during summon

## Recommended Auramons by Event

| Event | Recommendation | Reason |
|-------|----------------|--------|
| Launch Day | Charizard (id: 2, stage 3, lvl 50) | Iconic, high evolution |
| Valentine's Day | Shiny Gyarados (id: 51, stage 2, lvl 5) | Shiny rarity, romantic blue |
| Summer | Raichu (id: 20, stage 2, lvl 30) | Electric, fun, partially evolved |
| Halloween | Galarian Articuno (id: 80, stage 1, lvl 20) | Legendary, unique Galar form |
| Anniversary | High-level variant of popular Auramon | Celebrates player investment |

## Automation (For Future)

To automate gift code creation:

```bash
# Example: Create SUMMER2024 code via Firestore CLI
gcloud firestore documents create gift_codes/SUMMER2024 \
  --data='auramonId=2,auramonName="Charizard",level=50,evolutionStage=3,isShiny=false,expiresAt="2024-08-31T23:59:59Z"'
```
