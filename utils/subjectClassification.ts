// Reading & Writing subtopics carry these prefixes (see constants.ts SUBTOPICS);
// everything else is a math subtopic, and Digital SAT allows a calculator on all math questions.
const RW_SUBTOPIC_PREFIXES = ['R/W:', 'Grammar:', 'Rhetoric:'];

export const isMathSubtopic = (subtopic: string) => !RW_SUBTOPIC_PREFIXES.some(prefix => subtopic.startsWith(prefix));
