const text = "Here is some text.\nAnd a new line.\n\n$$\nx^2 + y^2 = z^2\n$$\n\nMore text.\nSingle newline here.";
const parts = text.split(/(\$\$[\s\S]*?\$\$)/);
const doubleSpacedText = parts.map(part => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
        return part;
    }
    return part.replace(/\r\n/g, '\n').replace(/(?<!\n)\n(?!\n)/g, '\n\n');
}).join('');

console.log(doubleSpacedText);
