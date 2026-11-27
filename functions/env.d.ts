// The bindings in wrangler.toml and the Pages secrets, cut to the parts the functions use, so the node
// tests (which have DOM types, not workers types) can pass the in-memory bucket in scripts/fakeR2.ts.

interface BucketObject {
  etag: string
  httpEtag: string
  body: BodyInit
  httpMetadata?: { contentType?: string }
  text(): Promise<string>
  json(): Promise<unknown>
}
interface PutOptions {
  httpMetadata?: { contentType?: string }
  onlyIf?: { etagMatches: string }
}
export interface Bucket {
  get(key: string): Promise<BucketObject | null>
  put(key: string, value: string | ArrayBuffer, options?: PutOptions): Promise<{ httpEtag: string } | null>
}

export interface Env {
  BUCKET: Bucket
  ADMIN_SECRET?: string
  // Not the workers-types Ai class: its AiModelList does not have the model translate.ts calls yet.
  AI?: { run(model: string, inputs: Record<string, unknown>): Promise<unknown> }
}

/** What the /api handlers read from the Pages context. */
export interface ApiContext {
  request: Request
  env: Env
}
