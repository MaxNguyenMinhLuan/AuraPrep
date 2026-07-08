# Project Schema and State (gemini.md)

## JSON Data Schema

### User Schema (MongoDB)
```json
{
  "_id": "ObjectId",
  "email": "String (unique, index)",
  "name": "String",
  "photoUrl": "String (nullable)",
  "authProvider": "String ('local' | 'google')",
  "googleId": "String (unique, sparse)",
  "passwordHash": "String (nullable)",
  "isEmailVerified": "Boolean",
  "isActive": "Boolean",
  "timezone": "String ('America/New_York' default)",
  "emailNotificationsEnabled": "Boolean (true default)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### UserGameData Schema (MongoDB)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref User, unique)",
  "email": "String (index)",
  "timezone": "String",
  "dailyMissions": {
    "date": "Date",
    "completed": "Boolean",
    "completedAt": "Date (optional)",
    "nudgesSent": "Number",
    "lastNudgeSentAt": "Date (optional)"
  },
  "currentStreak": "Number",
  "longestStreak": "Number",
  "lastCompletionDate": "Date (optional)",
  "activeCreature": {
    "creatureId": "Number",
    "name": "String",
    "type": "String",
    "level": "Number"
  },
  "totalQuestionsAnswered": "Number",
  "totalCorrect": "Number",
  "auraBalance": "Number",
  "emailNotifications": {
    "enabled": "Boolean",
    "morning": "Boolean",
    "afternoon": "Boolean",
    "evening": "Boolean"
  },
  "metrics": {
    "emailsSent": "Number",
    "emailsOpened": "Number",
    "emailsClicked": "Number",
    "conversions": {
      "morning": "Number",
      "afternoon": "Number",
      "evening": "Number"
    }
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### PerformanceLogs Schema (MongoDB)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref User, index)",
  "subtopicId": "String (index)",
  "isCorrect": "Boolean",
  "timeSpentSeconds": "Number",
  "difficultyLevel": "String ('Easy' | 'Medium' | 'Hard')",
  "timestamp": "Date"
}
```

## Maintenance Log
*(To be populated on deployment)*
