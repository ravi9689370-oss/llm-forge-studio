// Mini BPE tokenizer — real byte-pair encoding, runs fully in the browser.

const WORD_RE = /\S+/g;

export function splitWords(text) {
  return text.match(WORD_RE) || [];
}

// Merge pairs inside a sequence of string tokens.
function applyMerge(seq, a, b) {
  for (let j = 0; j < seq.length - 1; j++) {
    if (seq[j] === a && seq[j + 1] === b) {
      seq[j] = a + b;
      seq.splice(j + 1, 1);
      j--;
    }
  }
}

// Learn a BPE codebook from the given text by performing `merges` merges.
export function buildBPE(text, merges = 48) {
  const words = splitWords(text);
  const seqs = words.map((w) => w.split(''));
  const codebook = [];
  for (let i = 0; i < merges; i++) {
    const counts = new Map(); // "a\0b" -> count
    for (const seq of seqs) {
      for (let j = 0; j < seq.length - 1; j++) {
        const key = seq[j] + '\0' + seq[j + 1];
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    let bestKey = null;
    let bestCount = 0;
    for (const [key, c] of counts) {
      if (c > bestCount) { bestCount = c; bestKey = key; }
    }
    if (!bestKey || bestCount < 2) break;
    const [a, b] = bestKey.split('\0');
    codebook.push({ a, b, merged: a + b, count: bestCount });
    for (const seq of seqs) applyMerge(seq, a, b);
  }
  return { codebook, words, seqs };
}

// Tokenize preserving word boundaries. Returns [{ word, tokens: [..] }]
export function tokenize(text, codebook = []) {
  const words = splitWords(text);
  return words.map((word) => {
    let seq = word.split('');
    for (const rule of codebook) applyMerge(seq, rule.a, rule.b);
    return { word, tokens: seq };
  });
}

export function charTokens(text) {
  return splitWords(text).flatMap((w) => w.split(''));
}

export function tokenStats(text, codebook = []) {
  const perWord = tokenize(text, codebook);
  const tokens = perWord.reduce((n, w) => n + w.tokens.length, 0);
  const chars = text.replace(/\s+/g, '').length;
  return { perWord, tokens, chars, ratio: tokens ? chars / tokens : 0 };
}
