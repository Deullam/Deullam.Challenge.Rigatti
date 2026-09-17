/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Parser do stream SSE que o ChatController emite (frames `data: <json>` no formato
 * OpenAI `{ choices: [{ delta: { content } }] }`, encerrados por `data: [DONE]`). Usado pelos
 * specs E2E do chat para afirmar que a resposta é bem formada mesmo em caminhos de erro.
 */

/** Sentinela de término do stream, exatamente como o ChatController a escreve. */
export const SSE_DONE_LINE = 'data: [DONE]';

/** Resultado da leitura de um corpo SSE completo. */
export type ParsedSse = {
  /** Frames não vazios, na ordem em que chegaram (sem o `\n\n` separador). */
  frames: string[];
  /** Conteúdo (`choices[0].delta.content`) de cada frame JSON, na ordem. */
  deltas: string[];
  /** Texto completo = concatenação de todos os deltas. */
  text: string;
  /** Quantas vezes `data: [DONE]` apareceu (esperado: exatamente 1). */
  doneCount: number;
  /** `true` quando o ÚLTIMO frame é o `[DONE]`. */
  endsWithDone: boolean;
};

/**
 * Divide o corpo SSE em frames e extrai os deltas de conteúdo.
 * Lança se algum frame não começar com `data: ` ou não for JSON válido (fora o `[DONE]`),
 * de modo que um stream mal formado derruba a asserção com uma mensagem explícita.
 */
export function parseSse(body: string): ParsedSse {
  const frames = body
    .split('\n\n')
    .map((frame) => frame.trim())
    .filter((frame) => frame.length > 0);

  const deltas: string[] = [];
  let doneCount = 0;

  for (const frame of frames) {
    if (!frame.startsWith('data: ')) {
      throw new Error(`Frame SSE sem prefixo "data: ": ${JSON.stringify(frame)}`);
    }
    if (frame === SSE_DONE_LINE) {
      doneCount += 1;
      continue;
    }
    const payload = JSON.parse(frame.slice('data: '.length));
    const content = payload?.choices?.[0]?.delta?.content;
    if (typeof content !== 'string') {
      throw new Error(`Frame SSE fora do formato OpenAI (choices[0].delta.content): ${frame}`);
    }
    deltas.push(content);
  }

  return {
    frames,
    deltas,
    text: deltas.join(''),
    doneCount,
    endsWithDone: frames.length > 0 && frames[frames.length - 1] === SSE_DONE_LINE,
  };
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
