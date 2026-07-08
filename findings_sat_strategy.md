# Digital SAT Strategy: Cheats, Rules, and Desmos Hacks

This document outlines the core strategy system for AuraPrep. The curriculum will be structured around teaching students these specific rules and tricks to "game" the Digital SAT system.

---

## 📐 Math Section: Desmos Calculator Hacks

### 1. Solving Equations & Systems

#### **A. Solving Single-Variable Equations**
* **Rule:** Change any variable in the equation to $x$.
* **Method (Vertical Line):** Type the equation exactly as written (e.g., `2x + 15 = 45`). Desmos will plot a vertical line. Click the line to reveal the x-intercept, which is the solution (e.g., `x = 15`).
* **Method (Intersection):** Split the equation into two lines: `y = (left side)` and `y = (right side)` (e.g., `y = |3x - 5|` and `y = 10`). Click the intersection points. The x-values are the answers.

#### **B. Systems of Equations & Inequalities**
* **Rule:** Never rearrange equations into $y = mx + b$ format.
* **Method:** Type both equations exactly as they appear (even in standard form, e.g., `3x + 4y = 12` and `y = -2x + 5`). Click the intersection point to get the $(x, y)$ coordinate instantly.
* **Inequalities:** For inequality systems, type them directly (e.g., `y >= 2x - 3` and `y < -x + 4`). The solution set is where the shaded regions overlap.

---

### 2. Polynomials & Equivalence

#### **A. The Equivalent Expressions Hack**
* **Rule:** If the question asks which expression is equivalent to a complex polynomial, graph it.
* **Method:**
  * Enter the original expression on Line 1 (e.g., `(x - 3)^2 - 4`).
  * Enter the four answer choices on the lines below (e.g., Line 2: `x^2 - 6x + 5`).
  * Find the answer choice whose graph **completely overlaps** the original expression. Use the color circle toggle to verify.

#### **B. Evaluating Functions & Finding Inputs**
* **Evaluating Outputs:** Define the function, e.g., `f(x) = 3x^2 - 5x + 2`. Then type `f(4)` on Line 2 to evaluate it.
* **Finding Inputs:** If asked "for what value of $x$ is $f(x) = 14$?", graph `f(x) = 3x^2 - 5x + 2` and `y = 14`. Find the intersection point; the x-value is the answer.

---

### 3. Coordinate Geometry

#### **A. Distance and Midpoint Functions**
* **Distance:** Type `distance((x1, y1), (x2, y2))` (e.g., `distance((3, -4), (-2, 8))`) to calculate distance.
* **Midpoint:** Type `midpoint((x1, y1), (x2, y2))` to plot the midpoint.

#### **B. Circle Geometry**
* **Method:** Type the circle equation directly: `(x - h)^2 + (y - k)^2 = r^2`. Desmos will draw it, allowing you to click the center or outer boundaries to determine center coordinates $(h, k)$ and radius $r$.

---

### 4. Sliders, Regressions, & Central Tendency

#### **A. Sliders for Constants**
* **Rule:** If an equation has an unknown constant ($k$ or $a$) and a condition (e.g., "has exactly one x-intercept"), add a slider.
* **Method:** Type `y = x^2 + kx + 9` and click "add slider: k". Drag or change $k$ until the vertex of the graph touches the x-axis exactly once (reveals $k = 6$ or $k = -6$).

#### **B. Linear/Quadratic Regressions (Tables)**
* **Rule:** Fit an equation to a set of points.
* **Method:** Click `+` and choose **Table**. Input $x_1$ and $y_1$ coordinates. On the next line, type:
  * Linear: `y1 ~ mx1 + b` (outputs slope $m$, intercept $b$).
  * Quadratic: `y1 ~ ax1^2 + bx1 + c` (outputs $a$, $b$, $c$).

#### **C. Statistics**
* Define a list: `L = [12, 15, 17, 22, 22, 30]`.
* Calculate: `mean(L)`, `median(L)`, `stdev(L)` (sample standard deviation), `stdevp(L)` (population standard deviation).

---

## 📝 Reading & Writing Section: Grammar & Conventions Formulas

Standard English Conventions are highly predictable. Treat them like math formulas.

### 1. Punctuation Boundary Rules
* **Period = Semicolon:** A period (.) and a semicolon (;) do the exact same thing on the SAT. They must only join two complete sentences (independent clauses). If both options appear, they are likely wrong.
* **Comma + FANBOYS:** A comma + coordinating conjunction (For, And, Nor, But, Or, Yet, So) is the only way to join two complete sentences with a comma.
* **Comma Splice Error:** Joining two complete sentences with only a comma is a comma splice, which is always incorrect.
* **Colons & Dashes:** A colon (:) or single dash (—) must be preceded by a complete sentence. What follows can be a list, explanation, or emphasizing word.

### 2. The Non-Essential Clause "Crossing Out" Trick
* **Rule:** Non-essential details are bracketed by two commas (e.g., `, detail,`), two dashes (e.g., `— detail —`), or parentheses.
* **Cheat:** Cross out the text between the punctuation. The remaining sentence must still be grammatically correct. If not, the punctuation placement is wrong.

### 3. Subject-Verb and Verb Tense Formulas
* **Subject-Verb Agreement:** Ignore prepositional phrases between the subject and the verb (e.g., "The box [of chocolates] **is**", not "are").
* **Keep it Short (Conciseness):** The SAT always favors conciseness. If two answers are grammatically correct, choose the shorter one.
