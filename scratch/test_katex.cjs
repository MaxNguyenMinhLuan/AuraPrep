const { unified } = require('unified');
const markdown = require('remark-parse');
const math = require('remark-math');
const remark2rehype = require('remark-rehype');
const katex = require('rehype-katex');
const html = require('rehype-stringify');

const text = "$$\nx^2\n$$";
const doubleSpaced = text.replace(/(?<!\n)\n(?!\n)/g, '\n\n');

async function run() {
  const processor = unified()
    .use(markdown)
    .use(math)
    .use(remark2rehype)
    .use(katex)
    .use(html);

  const res1 = await processor.process(text);
  console.log("Original:", res1.toString());

  const res2 = await processor.process(doubleSpaced);
  console.log("Double Spaced:", res2.toString());
}
run();
