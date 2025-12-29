
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        question: {
            type: Type.STRING,
            description: 'The main text of the SAT question.'
        },
        options: {
            type: Type.ARRAY,
            description: 'An array of 4 strings representing the multiple choice options (A, B, C, D).',
            items: { type: Type.STRING }
        },
        answerIndex: {
            type: Type.INTEGER,
            description: 'The 0-based index of the correct option in the options array.'
        },
        explanation: {
            type: Type.STRING,
            description: 'A brief but clear explanation of why the correct answer is right and the others are wrong.'
        },
        hasGraphic: {
            type: Type.BOOLEAN,
            description: 'Whether or not the question requires a visual graphical element (coordinate plane, line, or scatterplot).'
        },
        graphData: {
            type: Type.OBJECT,
            description: 'Optional graphical data if hasGraphic is true.',
            properties: {
                type: {
                    type: Type.STRING,
                    description: 'The type of graph: "line", "scatter", or "system".'
                },
                points: {
                    type: Type.ARRAY,
                    description: 'Array of points for the graph. For a line, provide two points to define the segment. For scatter, provide multiple points.',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER }
                        },
                        required: ['x', 'y']
                    }
                }
            },
            required: ['type', 'points']
        }
    },
    required: ['question', 'options', 'answerIndex', 'explanation', 'hasGraphic']
};

export const generateSatQuestion = async (subtopic: string, difficulty: Difficulty): Promise<Omit<Question, 'subtopic'>> => {
    try {
        const prompt = `Generate a unique, new, and high-quality SAT-style multiple-choice question.
        Subtopic: "${subtopic}"
        Difficulty: ${difficulty}
        
        CRITICAL INSTRUCTIONS:
        1. If the question refers to a graph, coordinate plane, or set of points, you MUST set 'hasGraphic' to true.
        2. If 'hasGraphic' is true, provide accurate mathematical points in 'graphData'. 
        3. For geometry or algebra questions involving lines, ensure the 'graphData' matches the equation described in your question text.
        4. Format the output strictly as JSON.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionSchema,
                temperature: 1.0,
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            throw new Error("Gemini API returned an empty response.");
        }
        
        const parsed = JSON.parse(jsonString.trim());
        return parsed;

    } catch (error) {
        console.error("Error generating SAT question:", error);
        return {
            question: `The Academy portal is unstable for "${subtopic}". Attempting a simpler projection.`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            answerIndex: 0,
            explanation: "The mystical energies (AI) were interrupted during summoning.",
            hasGraphic: false
        };
    }
};
