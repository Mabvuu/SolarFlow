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
  try {
    const { path } =
      await context.params;

    const incomingUrl =
      new URL(request.url);

    const requestedPath =
      path.join("/");

    const hasTrailingSlash =
      incomingUrl.pathname.endsWith(
        "/"
      );

    const backendPath =
      hasTrailingSlash
        ? `${requestedPath}/`
        : requestedPath;

    const targetUrl =
      new URL(
        `${BACKEND_URL}/${backendPath}`
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
          method:
            request.method,

          headers,

          body,

          cache:
            "no-store",

          redirect:
            "follow",
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
        status:
          response.status,

        headers:
          responseHeaders,
      }
    );

  } catch (error) {
    console.error(
      "SolarFlow backend proxy error:",
      error
    );

    return Response.json(
      {
        detail:
          "Could not connect to SolarFlow backend.",
      },
      {
        status: 502,
      }
    );
  }
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
