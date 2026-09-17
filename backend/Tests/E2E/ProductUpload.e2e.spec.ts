/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E da jornada RG-06 — upload real de imagem de produto: o harness sobe com
 * o LocalDiskStorageProvider de verdade (sem sobrescrever TOKENS.IStorageProvider), o arquivo tem
 * de existir em `<cwd>/uploads/products/` e a rota estática `/uploads` (ServeStaticModule em
 * app.module.ts) tem de devolver exatamente os mesmos bytes enviados. Não depende de Docker.
 * Os arquivos criados são removidos após cada teste para não deixar artefatos no repositório.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as request from 'supertest';
import { createE2EApp, RealStorageE2EContext } from '../Helpers/createE2EApp';

jest.setTimeout(60000);

/** Sessão autenticada: token emitido pelo backend + empresa dona. */
type Session = { token: string; companyId: string };

/**
 * PNG válido de 1x1 pixel (contém bytes 0x00 e bytes altos, o que torna a comparação binária
 * significativa — um round-trip que corrompesse encoding seria detectado).
 */
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

/** Raiz que o LocalDiskStorageProvider e o ServeStaticModule usam (ambos partem de process.cwd()). */
const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

/** Pasta onde o provider grava as imagens de produto. */
const PRODUCTS_DIR = path.join(UPLOADS_ROOT, 'products');

/** Lista os nomes de arquivo presentes na pasta de produtos (vazio se a pasta não existir). */
const listProductsDir = (): string[] =>
  fs.existsSync(PRODUCTS_DIR) ? fs.readdirSync(PRODUCTS_DIR) : [];

/** Subconjunto do stream de resposta do superagent que o parser binário consome (só eventos). */
type ResponseStream = { on(event: string, listener: (...args: any[]) => void): unknown };

/**
 * Parser binário para o superagent: acumula o corpo cru em um Buffer em vez de tentar
 * interpretá-lo como texto/JSON — necessário para comparar byte a byte a imagem servida.
 * Tipado estruturalmente (só `on`) para ser aceito pelo `NodeParser` do @types/superagent.
 */
const binaryParser = (res: ResponseStream, cb: (err: Error | null, body: Buffer) => void) => {
  const chunks: Buffer[] = [];
  res.on('data', (chunk: Buffer) => chunks.push(chunk));
  res.on('end', () => cb(null, Buffer.concat(chunks)));
};

// Rastreio: jornada RG-06 do plano do PO (upload real em disco + GET estático em /uploads).
describe('RG-06 — real product image upload to disk and static /uploads (E2E)', () => {
  let ctx: RealStorageE2EContext;
  let server: any;
  let admin: Session;
  let user: Session;

  /** Se a pasta de uploads já existia antes da suíte, não a removemos ao final. */
  const uploadsRootExistedBefore = fs.existsSync(UPLOADS_ROOT);
  const productsDirExistedBefore = fs.existsSync(PRODUCTS_DIR);

  /** Snapshot dos arquivos da pasta antes de cada teste — tudo que aparecer a mais é apagado. */
  let filesBeforeTest: Set<string>;

  /** Registra um admin (cria empresa nova) e devolve token + companyId reais. */
  const registerAdmin = async (email: string, companyName: string): Promise<Session> => {
    const res = await request(server)
      .post('/auth/register')
      .send({ email, password: 'secret123', companyName, role: 'admin' }) // gitleaks:allow
      .expect(201);
    return { token: res.body.access_token, companyId: res.body.user.companyId };
  };

  const auth = (s: Session) => `Bearer ${s.token}`;

  /** POST /products/upload multipart com o PNG no campo `file`, autenticado como a sessão dada. */
  const uploadPng = (s: Session, fileName = 'photo.png') =>
    request(server)
      .post('/products/upload')
      .set('Authorization', auth(s))
      .attach('file', PNG_1X1, { filename: fileName, contentType: 'image/png' });

  /** Extrai o caminho (ex.: /uploads/products/123.png) da URL absoluta devolvida pelo backend. */
  const pathnameOf = (url: string) => new URL(url).pathname;

  /** GET binário no caminho estático, devolvendo o corpo como Buffer. */
  const getBinary = (pathname: string) =>
    request(server).get(pathname).buffer(true).parse(binaryParser);

  beforeAll(async () => {
    ctx = await createE2EApp({ storage: 'real' });
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
    // Só remove as pastas se foram criadas por esta suíte e ficaram vazias.
    if (!productsDirExistedBefore && fs.existsSync(PRODUCTS_DIR) && listProductsDir().length === 0) {
      fs.rmdirSync(PRODUCTS_DIR);
    }
    if (!uploadsRootExistedBefore && fs.existsSync(UPLOADS_ROOT) && fs.readdirSync(UPLOADS_ROOT).length === 0) {
      fs.rmdirSync(UPLOADS_ROOT);
    }
  });

  beforeEach(async () => {
    await ctx.clearDatabase();
    filesBeforeTest = new Set(listProductsDir());
    admin = await registerAdmin('admin-upload@a.com', 'UploadCorp');
    user = { token: await ctx.signToken({ companyId: admin.companyId, role: 'user' }), companyId: admin.companyId };
  });

  afterEach(() => {
    // Apaga apenas o que o teste criou; arquivos pré-existentes do desenvolvedor ficam intactos.
    for (const name of listProductsDir()) {
      if (!filesBeforeTest.has(name)) fs.unlinkSync(path.join(PRODUCTS_DIR, name));
    }
  });

  /** Arquivos que surgiram na pasta desde o início do teste corrente. */
  const newFiles = () => listProductsDir().filter((name) => !filesBeforeTest.has(name));

  describe('happy path', () => {
    // AC1: 201 + url em /uploads/products/<algo> + arquivo existe de fato em disco.
    it('shouldStoreUploadedImageOnDiskAndReturnPublicUrl', async () => {
      const res = await uploadPng(admin).expect(201);

      expect(typeof res.body.url).toBe('string');
      const pathname = pathnameOf(res.body.url);
      expect(pathname).toMatch(/^\/uploads\/products\/[^/]+\.png$/);

      const fileName = path.posix.basename(pathname);
      const created = newFiles();
      expect(created).toEqual([fileName]);

      const onDisk = fs.readFileSync(path.join(PRODUCTS_DIR, fileName));
      expect(onDisk.equals(PNG_1X1)).toBe(true);
    });

    // AC2: GET na url devolvida → 200 com o mesmo conteúdo binário enviado.
    it('shouldServeUploadedImageBackWithTheSameBytes', async () => {
      const upload = await uploadPng(admin).expect(201);
      const pathname = pathnameOf(upload.body.url);

      const res = await getBinary(pathname).expect(200);

      expect(res.headers['content-type']).toMatch(/^image\/png/);
      expect(Buffer.isBuffer(res.body)).toBe(true);
      expect(res.body.length).toBe(PNG_1X1.length);
      expect((res.body as Buffer).equals(PNG_1X1)).toBe(true);
    });

    it('shouldGenerateDistinctFileNamesForRepeatedUploadsOfTheSameName', async () => {
      const first = await uploadPng(admin, 'same.png').expect(201);
      const second = await uploadPng(admin, 'same.png').expect(201);

      expect(pathnameOf(first.body.url)).not.toBe(pathnameOf(second.body.url));
      expect(newFiles()).toHaveLength(2);
    });
  });

  describe('negative cases', () => {
    // Negativo do PO: "Upload sem o campo 'file' → 400".
    it('shouldReturn400WhenMultipartUsesAnotherFieldName', async () => {
      await request(server)
        .post('/products/upload')
        .set('Authorization', auth(admin))
        .attach('image', PNG_1X1, { filename: 'photo.png', contentType: 'image/png' })
        .expect(400);

      expect(newFiles()).toEqual([]);
    });

    // BUG DE PRODUÇÃO (não corrigido aqui — tester não altera código de produção): quando a
    // requisição chega sem NENHUM arquivo (multipart só com campos de texto, ou corpo JSON), o
    // FileInterceptor deixa `file` undefined e UploadProductImageUseCase.execute lê
    // `input.file.originalname` → TypeError → 500 Internal Server Error, em vez do 400 exigido
    // pelo PO. Verificado em 17/09/2026: ambos os cenários abaixo devolvem 500. Quando o backend
    // validar a presença do arquivo (ex.: ParseFilePipe com fileIsRequired), converter em `it`
    // com `.expect(400)` e `expect(newFiles()).toEqual([])`.
    it.todo('shouldReturn400WhenMultipartHasNoFilePart — hoje devolve 500 (TypeError no use case)');
    it.todo('shouldReturn400WhenBodyIsNotMultipart — hoje devolve 500 (TypeError no use case)');

    // Negativo do PO (já coberto em Products.e2e.spec.ts com storage mockado; aqui com o real):
    // user → 403 e nada é gravado em disco.
    it('shouldForbidUserRoleAndWriteNothingToDisk', async () => {
      await uploadPng(user).expect(403);
      expect(newFiles()).toEqual([]);
    });

    it('shouldRejectAnonymousUploadAndWriteNothingToDisk', async () => {
      await request(server)
        .post('/products/upload')
        .attach('file', PNG_1X1, { filename: 'photo.png', contentType: 'image/png' })
        .expect(401);
      expect(newFiles()).toEqual([]);
    });

    it('shouldReturn404ForAnImageThatWasNeverUploaded', async () => {
      await getBinary('/uploads/products/does-not-exist.png').expect(404);
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
