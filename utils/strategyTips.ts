export interface StrategyTip {
    title: string;
    tip: string;
    icon: string;
}

export function getStrategyTip(subtopic: string, questionText: string): StrategyTip | null {
    const sub = subtopic.toLowerCase();
    const text = questionText.toLowerCase();

    // Math Desmos Hacks
    if (sub.includes('linear equation') || sub.includes('algebra') || text.includes('solve for') || text.includes('equation')) {
        if (text.includes('system') || text.includes('equations')) {
            return {
                title: "Desmos Systems Hack",
                tip: "Never rearrange equations into y = mx + b. Type both equations exactly as they appear in Desmos, then click the intersection point to get the (x, y) coordinate instantly!",
                icon: ""
            };
        }
        return {
            title: "Desmos Single-Variable Hack",
            tip: "Change any variable in the equation to x. Type the equation exactly as written into Desmos. It will plot a vertical line; click the line to reveal the x-intercept, which is the solution!",
            icon: ""
        };
    }

    if (sub.includes('quadratic') || sub.includes('polynomial') || text.includes('equivalent to')) {
        if (text.includes('equivalent')) {
            return {
                title: "Equivalent Expression Cheat",
                tip: "Graph the original expression on Line 1 of Desmos. Graph the four answer choices below it. The correct answer choice will completely overlap the original graph!",
                icon: ""
            };
        }
        return {
            title: "Desmos Function Evaluation",
            tip: "Define your function, e.g., f(x) = 3x^2 - f. Then type f(4) on Line 2 of Desmos to evaluate it instantly without doing the algebra!",
            icon: ""
        };
    }

    if (sub.includes('geometry') || text.includes('circle') || text.includes('distance') || text.includes('midpoint')) {
        if (text.includes('circle')) {
            return {
                title: "Desmos Circle Geometry Hack",
                tip: "Type the circle equation directly: (x-h)^2 + (y-k)^2 = r^2. Desmos will draw the circle; click the center or outer boundaries to read the center and radius directly from the grid!",
                icon: ""
            };
        }
        if (text.includes('distance') || text.includes('midpoint')) {
            return {
                title: "Desmos Coordinate Hack",
                tip: "Use Desmos functions: type 'distance((x1, y1), (x2, y2))' or 'midpoint((x1, y1), (x2, y2))' to compute coordinate geometry formulas instantly!",
                icon: ""
            };
        }
    }

    if (sub.includes('statistics') || sub.includes('probability') || text.includes('mean') || text.includes('median') || text.includes('standard deviation')) {
        return {
            title: "Desmos Statistics Hack",
            tip: "Define a list like L = [12, 15, 17, 22]. Then type 'mean(L)', 'median(L)', or 'stdev(L)' in Desmos to calculate statistical measures automatically!",
            icon: ""
        };
    }

    // Grammar Conventions Hacks
    if (sub.includes('punctuation') || sub.includes('convention') || sub.includes('grammar') || text.includes('semicolon') || text.includes('comma')) {
        if (text.includes(';') || text.includes('period') || text.includes('semicolon')) {
            return {
                title: "Period = Semicolon Rule",
                tip: "A period (.) and a semicolon (;) do the exact same thing on the SAT—they join two complete sentences. If both appear as choices for the same blank, both are likely wrong!",
                icon: ""
            };
        }
        if (text.includes('comma')) {
            return {
                title: "FANBOYS Comma Rule",
                tip: "You can only join two complete sentences with a comma if it's followed by a coordinating conjunction (For, And, Nor, But, Or, Yet, So). Doing so with a comma alone is a Comma Splice error!",
                icon: ""
            };
        }
        return {
            title: "Non-Essential Clause Cheat",
            tip: "Non-essential descriptions are bracketed by two commas (e.g., ', detail,') or two dashes (— detail —). Cross out the text inside; the remaining sentence must still be grammatically complete!",
            icon: ""
        };
    }

    if (text.includes('subject-verb') || text.includes('verb tense') || text.includes('singular') || text.includes('plural')) {
        return {
            title: "Subject-Verb Agreement Trick",
            tip: "Ignore prepositional phrases between the subject and the verb (e.g., 'The box [of chocolates] is...'). Cross out the prepositional phrase to easily identify if the subject is singular or plural!",
            icon: ""
        };
    }

    // General Strategy
    return {
        title: "Conciseness Formula",
        tip: "The SAT highly values conciseness. If multiple answer choices are grammatically correct, the shortest choice is almost always the correct answer!",
        icon: ""
    };
}
