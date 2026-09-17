/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Fábrica de JWTs hostis para os testes negativos de autenticação (RG-09 / RG-10):
 * assinatura com secret errado, payload/cabeçalho adulterados após a assinatura, assinatura
 * removida, `alg: none` e `exp` no passado. Usa o JwtService do @nestjs/jwt (já dependência) —
 * nenhum pacote novo, nenhuma rede.
 */

import { JwtService } from '@nestjs/jwt';

/** Claims mínimas que o JwtStrategy lê (sub/companyId/role) mais as temporais opcionais. */
export type TestJwtClaims = {
  sub: string;
  companyId: string;
  role: 'admin' | 'user';
  /** Emitido em (segundos Unix). Se omitido, o jsonwebtoken usa "agora". */
  iat?: number;
  /** Expira em (segundos Unix). Se omitido, o token não expira. */
  exp?: number;
};

/** Segundos Unix atuais, arredondados para baixo (mesma base que o jsonwebtoken usa). */
export const nowInSeconds = (): number => Math.floor(Date.now() / 1000);

/** Assina `claims` com `secret` usando HS256 (o mesmo algoritmo padrão do @nestjs/jwt). */
export const signTestJwt = (secret: string, claims: TestJwtClaims): string =>
  new JwtService({ secret }).sign(claims);

/** Codifica um objeto JSON em base64url (segmento de JWT). */
export const encodeJwtSegment = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

/** Decodifica um segmento base64url de JWT para objeto. */
export const decodeJwtSegment = <T = Record<string, unknown>>(segment: string): T =>
  JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;

/** Divide o token nos três segmentos (header, payload, signature). Lança se o formato for inválido. */
const splitJwt = (token: string): [string, string, string] => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error(`JWT inválido para adulteração: ${token}`);
  return parts as [string, string, string];
};

/**
 * Reescreve claims do payload SEM re-assinar: header e assinatura originais são mantidos,
 * quebrando a correspondência assinatura↔payload (o que o servidor deve detectar).
 */
export const tamperJwtPayload = (token: string, patch: Record<string, unknown>): string => {
  const [header, payload, signature] = splitJwt(token);
  const tampered = { ...decodeJwtSegment(payload), ...patch };
  return [header, encodeJwtSegment(tampered), signature].join('.');
};

/** Reescreve campos do header (ex.: `alg`) mantendo payload e assinatura originais. */
export const tamperJwtHeader = (token: string, patch: Record<string, unknown>): string => {
  const [header, payload, signature] = splitJwt(token);
  const tampered = { ...decodeJwtSegment(header), ...patch };
  return [encodeJwtSegment(tampered), payload, signature].join('.');
};

/** Remove a assinatura, deixando `header.payload.` (token "unsigned"). */
export const stripJwtSignature = (token: string): string => {
  const [header, payload] = splitJwt(token);
  return `${header}.${payload}.`;
};

/** Monta um token `alg: none` sem assinatura a partir das claims dadas. */
export const buildUnsignedJwt = (claims: TestJwtClaims): string =>
  `${encodeJwtSegment({ alg: 'none', typ: 'JWT' })}.${encodeJwtSegment(claims)}.`;

/** Cola o payload de um token à assinatura de OUTRO token (ataque de recorte e colagem). */
export const spliceJwtSignature = (payloadFrom: string, signatureFrom: string): string => {
  const [header, payload] = splitJwt(payloadFrom);
  const [, , signature] = splitJwt(signatureFrom);
  return [header, payload, signature].join('.');
};

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
