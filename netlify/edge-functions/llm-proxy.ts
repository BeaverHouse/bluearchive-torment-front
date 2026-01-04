export default async function handler(request: Request) {
  // 경로에서 /api/llm/ 이후 부분 추출
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/llm\/?/, "");
  const targetUrl = `https://llm.tinyclover.com/${path}${url.search}`;

  // 원본 요청의 헤더 복사
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    // Host 헤더는 제외
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-ignore - duplex is needed for streaming request body
      duplex: "half",
    });

    // 응답 헤더 설정
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: responseHeaders,
      });
    }

    // 스트리밍 응답 반환
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Proxy error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  path: "/api/llm/*",
};
