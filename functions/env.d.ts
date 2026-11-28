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
  head(key: string): Promise<{ etag: string } | null>
  put(key: string, value: string | ArrayBuffer, options?: PutOptions): Promise<{ etag: string; httpEtag: string } | null>
}

export interface Env {
  BUCKET: Bucket
  ADMIN_SECRET?: string
  AI?: { run(model: string, inputs: Record<string, unknown>): Promise<unknown> }
}

/** What the /api handlers read from the Pages context. */
export interface ApiContext {
  request: Request
  env: Env
}
