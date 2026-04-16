import { streamDecode } from "@/lib/claude";
import type { DetectedErrorType } from "@/types";

const MAX_TRACE_LENGTH = 10_000;

interface DecodeRequestBody {
  trace: string;
  errorType: DetectedErrorType;
}

const VALID_ERROR_TYPES = new Set<DetectedErrorType>([
  "react",
  "typescript",
  "nextjs",
  "cors",
  "css",
  "generic",
]);

export async function POST(request: Request): Promise<Response> {
  let body: DecodeRequestBody;

  try {
    body = (await request.json()) as DecodeRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { trace, errorType } = body;

  if (!trace || typeof trace !== "string" || trace.trim().length === 0) {
    return Response.json(
      { error: "The trace field is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  if (trace.length > MAX_TRACE_LENGTH) {
    return Response.json(
      { error: `Trace must be ${MAX_TRACE_LENGTH.toLocaleString()} characters or fewer.` },
      { status: 400 }
    );
  }

  if (!errorType || !VALID_ERROR_TYPES.has(errorType)) {
    return Response.json(
      { error: "Invalid errorType value." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamDecode(trace, errorType)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch {
        // Signal the client that something went wrong mid-stream
        controller.enqueue(encoder.encode("\n\n[DECODE_ERROR]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
      // Prevent buffering in some reverse proxies
      "X-Accel-Buffering": "no",
    },
  });
}
