import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from 'node:crypto';
import { parseSTL } from "../src/lib/stl";
import { estimate } from "../src/lib/quote";
import { materials, pricing, MAX_FILE_BYTES } from "../src/config/pricing";
import { settingsSchema, customerSchema } from "../src/lib/validation";
import { validateFile } from "../src/lib/server/files";
import {
  deliverRequest,
  escapeHtml,
  type EmailMessage,
} from "../src/lib/server/email";
import { POST } from "../src/app/api/requests/route";
import { cubeSTL } from "./fixtures";
import { prepareValidationForm } from "../src/lib/prepare-upload";
import type { Settings } from "../src/lib/models";
const settings: Settings = {
  material: "PLA",
  quantity: 1,
  quality: "standard",
  infill: 20,
  colour: "Black",
};
for (const binary of [true, false])
  test(`${binary ? "Binary" : "ASCII"} STL dimensions and volume are computed from geometry`, () => {
    const { analysis } = parseSTL(cubeSTL(10, binary));
    assert.deepEqual(analysis.dimensions, [10, 10, 10]);
    assert.ok(Math.abs(analysis.volumeCm3 - 1) < 1e-9);
    assert.equal(analysis.watertight, true);
    assert.equal(analysis.triangles, 12);
  });
test("Minimum remains $30 across materials, quality and low volumes", () => {
  for (const material of Object.keys(materials) as Settings["material"][])
    for (const quality of Object.keys(
      pricing.qualityMultiplier,
    ) as Settings["quality"][])
      for (const size of [0.1, 1, 10, 100])
        for (const infill of [10, 20, 100]) {
          const q = estimate(parseSTL(cubeSTL(size)).analysis, {
            ...settings,
            material,
            quality,
            infill,
          });
          assert.ok(q.total >= 30);
          assert.ok(Number.isFinite(q.total));
        }
  assert.equal(estimate(parseSTL(cubeSTL(0.1)).analysis, settings).total, 30);
});
test("Quantity changes material and machine time", () => {
  const analysis = parseSTL(cubeSTL(100)).analysis;
  const one = estimate(analysis, settings),
    ten = estimate(analysis, { ...settings, quantity: 10 });
  assert.ok(ten.total > one.total);
  assert.equal(ten.weightGrams, one.weightGrams * 10);
  assert.equal(ten.hours, one.hours * 10);
});
test("Open geometry requires a manual quote", () => {
  const buffer = cubeSTL();
  const open = buffer.slice(0, buffer.byteLength - 50);
  new DataView(open).setUint32(80, 11, true);
  const analysis = parseSTL(open).analysis;
  assert.equal(analysis.watertight, false);
  assert.equal(estimate(analysis, settings).manual, true);
});
test("Unknown material requires a manual quote", () =>
  assert.equal(
    estimate(parseSTL(cubeSTL()).analysis, { ...settings, material: "Other" })
      .manual,
    true,
  ));
test("Oversize model requires review", () =>
  assert.equal(
    estimate(parseSTL(cubeSTL(400)).analysis, settings).manual,
    true,
  ));
test("Malformed, empty and oversized uploads are rejected", () => {
  for (const buffer of [
    new ArrayBuffer(0),
    new ArrayBuffer(MAX_FILE_BYTES + 1),
    new TextEncoder().encode("<script>bad</script>").buffer as ArrayBuffer,
  ])
    assert.throws(() => parseSTL(buffer));
});
test("Non-finite STL coordinates are rejected", () => {
  const b = cubeSTL();
  new DataView(b).setFloat32(96, NaN, true);
  assert.throws(() => parseSTL(b));
});
test("Invalid pricing inputs never produce a displayed number", () => {
  for (const quantity of [0, -1, NaN, Infinity, 1.5, 1001])
    assert.throws(() =>
      estimate(parseSTL(cubeSTL()).analysis, { ...settings, quantity }),
    );
});
test("Server schemas reject malformed contact and settings", () => {
  assert.equal(
    customerSchema.safeParse({ name: "A", email: "bad", phone: "abc" }).success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({ ...settings, infill: -10 }).success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({ ...settings, material: "madeup" }).success,
    false,
  );
});
test("Spoofed file extension and prohibited files are rejected", async () => {
  await assert.rejects(validateFile(new File(["bad"], "sketch.png"), false));
  await assert.rejects(validateFile(new File(["bad"], "part.exe"), false));
  await assert.rejects(validateFile(new File(["bad"], "part.stl"), true));
});
test("Emails contain phone, details and STL and escape HTML", async () => {
  process.env.RESEND_FROM = "Company <quotes@example.com>";
  process.env.BUSINESS_EMAIL = "business@example.com";
  const sent: { message: EmailMessage; key: string }[] = [];
  const params = {
    id: "00000000-0000-4000-8000-000000000001",
    kind: "print" as const,
    customer: {
      name: "Test <script>",
      email: "test@example.com",
      phone: "+15195550123",
    },
    details: { Material: "PLA", Notes: "<b>sample</b>" },
    file: {
      name: "cube.stl",
      bytes: new Uint8Array(cubeSTL()),
      contentType: "application/octet-stream",
    },
    transport: async (message: EmailMessage, key: string) => {
      sent.push({ message, key });
    },
  };
  await deliverRequest(params);
  await deliverRequest(params);
  assert.equal(sent.length, 4);
  assert.match(sent[0].message.html, /Phone: \+15195550123/);
  assert.match(sent[0].message.html, /&lt;script&gt;/);
  assert.equal(sent[0].message.attachments?.[0].filename, "cube.stl");
  assert.equal(sent[1].message.to[0], "test@example.com");
  assert.equal(sent[0].key, sent[2].key);
  assert.equal(sent[1].key, sent[3].key);
  assert.equal(escapeHtml('"<&'), "&quot;&lt;&amp;");
});
test("Transport failure propagates instead of reporting success", async () => {
  await assert.rejects(
    deliverRequest({
      id: "test",
      kind: "design",
      customer: {
        name: "Test",
        email: "test@example.com",
        phone: "5195550123",
      },
      details: { description: "sample" },
      transport: async () => {
        throw new Error("offline");
      },
    }),
  );
});
function requestForm(kind = "design") {
  const data = new FormData();
  Object.entries({
    kind,
    requestId: "00000000-0000-4000-8000-000000000001",
    name: "Test Customer",
    email: "test@example.com",
    phone: "5195550123",
    acknowledged: "true",
    privacyConsent: "true",
    uploadRights: "true",
    policyVersion: "2026-10-15",
    website: "",
    description: "A custom enclosure for a workshop sensor.",
    intendedUse: "Indoor use",
    dimensions: "10 mm",
    material: "PLA",
    quantity: "1",
    deadline: "",
    quality: "standard",
    infill: "20",
    colour: "Black",
  }).forEach(([k, v]) => data.set(k, v));
  return data;
}
function request(data: FormData, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/requests", {
    method: "POST",
    headers: { origin },
    body: data,
  });
}
test("Both valid forms report missing email config without pretending to send", async () => {
  delete process.env.RESEND_API_KEY;
  for (const kind of ["print", "design"]) {
    const data = requestForm(kind);
    if (kind === "print") data.set("file", new File([cubeSTL()], "cube.stl"));
    const result = await POST(request(data));
    assert.equal(result.status, 503);
    assert.match((await result.json()).error, /not been sent/);
  }
});
test("Server rejects missing consent and stale policy versions", async () => {
  for (const field of ["privacyConsent", "uploadRights", "policyVersion"]) {
    const data = requestForm();
    data.delete(field);
    assert.equal((await POST(request(data))).status, 400);
  }
  const stale = requestForm();
  stale.set("policyVersion", "2020-01-01");
  assert.equal((await POST(request(stale))).status, 400);
});
test("Server rejects foreign origin, invalid form, missing STL and oversized body", async () => {
  assert.equal(
    (await POST(request(requestForm(), "https://other.example"))).status,
    403,
  );
  const invalid = requestForm();
  invalid.set("email", "bad");
  assert.equal((await POST(request(invalid))).status, 400);
  assert.equal((await POST(request(requestForm("print")))).status, 400);
  const oversized = new Request("http://localhost:3000/api/requests", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "multipart/form-data; boundary=test",
      "content-length": "5000000",
    },
    body: "test",
  });
  assert.equal((await POST(oversized)).status, 413);
});
test("Both production form flows succeed with mocked providers and server recalculates price", async () => {
  const originalFetch = globalThis.fetch;
  const oldEnv = { ...process.env };
  const sent: EmailMessage[] = [];
  const calls: string[] = [];
  Object.assign(process.env, {
    NODE_ENV: "production",
    DEPLOYMENT_PLATFORM: 'vercel',
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    RESEND_API_KEY: "test-key",
    RESEND_FROM: "Quotes <quotes@example.com>",
    BUSINESS_EMAIL: "business@example.com",
    TURNSTILE_SECRET_KEY: "test-secret",
    UPSTASH_REDIS_REST_URL: "https://redis.example.com",
    UPSTASH_REDIS_REST_TOKEN: "test-token",
  });
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("siteverify"))
      return Response.json({ success: true, hostname: "localhost" });
    if (url.includes("redis.example")) {
      const command = JSON.parse(String(init?.body));
      assert.equal(command[0], "EVAL");
      if(calls.filter(x=>x.includes('redis.example')).length%2===1){assert.equal(command[3],'request-rate:'+createHash('sha256').update('ip:192.0.2.99').digest('hex'));}
      return Response.json({ result: 1 });
    }
    if (url.includes("api.resend.com")) {
      sent.push(JSON.parse(String(init?.body)));
      return Response.json({ id: "mock-email" });
    }
    throw new Error("Unexpected network request");
  };
  try {
    for (const kind of ["print", "design"]) {
      const data = requestForm(kind);
      data.set("cf-turnstile-response", "test-token");
      data.set("estimatedPrice", "0.01");
      if (kind === "print") data.set("file", new File([cubeSTL()], "cube.stl"));
      const netlifyRequest=request(data);
      netlifyRequest.headers.set('x-nf-client-connection-ip','203.0.113.24');
      netlifyRequest.headers.set('x-real-ip','192.0.2.99');
      const result = await POST(netlifyRequest);
      assert.equal(
        result.status,
        200,
        JSON.stringify(await result.clone().json()),
      );
    }
    assert.equal(sent.length, 4);
    assert.match(sent[0].text, /Policy version: 2026-10-15/);
    assert.match(sent[0].text, /Consent recorded at:/);
    assert.match(sent[2].text, /Privacy consent: Yes/);
    assert.match(sent[0].text, /\$30\.00 CAD/);
    assert.doesNotMatch(sent[0].text, /0\.01/);
    assert.equal(sent[0].attachments?.length, 1);
    assert.match(sent[2].text, /A custom enclosure/);
    assert.equal(calls.filter((x) => x.includes("redis.example")).length, 4);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env))
      if (!(key in oldEnv)) delete process.env[key];
    Object.assign(process.env, oldEnv);
  }
});

test("Netlify prepares validated print and design submissions without email credentials or outbound calls", async () => {
  const previous = process.env.DEPLOYMENT_PLATFORM;
  const originalFetch = globalThis.fetch;
  process.env.DEPLOYMENT_PLATFORM = "netlify";
  globalThis.fetch = async () => { throw new Error("Preparation must not send data"); };
  try {
    for (const kind of ["print", "design"]) {
      const data = requestForm(kind);
      data.set("estimatedPrice", "0.01");
      if (kind === "print") data.set("file", new File([cubeSTL()], "cube.stl"));
      const result = await POST(request(data));
      assert.equal(result.status, 200);
      const payload = await result.json();
      assert.equal(payload.prepared, true);
      assert.equal(payload.fields["form-name"], `${kind}-requests`);
      assert.equal(payload.fields.email, data.get("email"));
      assert.match(payload.fields.details, /Privacy consent: Yes/);
      assert.match(payload.fields.details, /Policy version: 2026-10-15/);
      assert.match(payload.message, /no automatic confirmation email/);
      if (kind === "print") {
        assert.match(payload.fields.details, /\$30\.00 CAD/);
        assert.doesNotMatch(payload.fields.details, /0\.01/);
      }
    }
    const bot = requestForm("design");
    bot.set("website", "https://spam.example");
    assert.equal((await POST(request(bot))).status, 400);
    const badFile = requestForm("print");
    badFile.set("file", new File(["bad geometry"], "bad.stl"));
    assert.equal((await POST(request(badFile))).status, 400);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.DEPLOYMENT_PLATFORM;
    else process.env.DEPLOYMENT_PLATFORM = previous;
  }
});

test("A 7 MB ASCII STL is compacted for validation while its original is preserved", async () => {
  const ascii = new TextDecoder().decode(cubeSTL(10, false));
  const large = ascii.padEnd(MAX_FILE_BYTES, " ");
  const data = requestForm("print");
  const original = new File([large], "large-ascii.stl");
  data.set("file", original);
  const compact = await prepareValidationForm(data);
  const validatedFile = compact.get("file") as File;
  assert.equal(original.size, MAX_FILE_BYTES);
  assert.equal((data.get("file") as File).size, MAX_FILE_BYTES);
  assert.equal(validatedFile.size, 684);
  assert.equal(validatedFile.name, original.name);
  assert.deepEqual(parseSTL(await validatedFile.arrayBuffer()).analysis.dimensions, [10, 10, 10]);
  const previous = process.env.DEPLOYMENT_PLATFORM;
  process.env.DEPLOYMENT_PLATFORM = "netlify";
  try {
    assert.equal((await POST(request(compact))).status, 200);
    data.set("file", new File([large + " "], "too-large.stl"));
    await assert.rejects(() => prepareValidationForm(data), /7 MB/);
    data.set("kind", "design");
    data.set("file", original);
    await assert.rejects(() => prepareValidationForm(data), /3 MB/);
  } finally {
    if (previous === undefined) delete process.env.DEPLOYMENT_PLATFORM;
    else process.env.DEPLOYMENT_PLATFORM = previous;
  }
});
