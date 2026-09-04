const BACKEND_URL =
  "https://solarflow-backend-uvgv.onrender.com";


type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};


async function proxyRequest(
  request: Request,
  context: RouteContext
) {
  const { path } =
    await context.params;

  const incomingUrl =
    new URL(request.url);

  const targetUrl =
    new URL(
      `${BACKEND_URL}/${path.join("/")}`
    );

  targetUrl.search =
    incomingUrl.search;


  const headers =
    new Headers();

  const contentType =
    request.headers.get(
      "content-type"
    );

  const authorization =
    request.headers.get(
      "authorization"
    );


  if (contentType) {
    headers.set(
      "content-type",
      contentType
    );
  }


  if (authorization) {
    headers.set(
      "authorization",
      authorization
    );
  }


  let body:
    | ArrayBuffer
    | undefined;


  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    body =
      await request.arrayBuffer();
  }


  const response =
    await fetch(
      targetUrl,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
      }
    );


  const responseHeaders =
    new Headers();

  const responseContentType =
    response.headers.get(
      "content-type"
    );


  if (responseContentType) {
    responseHeaders.set(
      "content-type",
      responseContentType
    );
  }


  return new Response(
    response.body,
    {
      status: response.status,
      headers:
        responseHeaders,
    }
  );
}


export async function GET(
  request: Request,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}


export async function POST(
  request: Request,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}


export async function PATCH(
  request: Request,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}


export async function PUT(
  request: Request,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}


export async function DELETE(
  request: Request,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}
