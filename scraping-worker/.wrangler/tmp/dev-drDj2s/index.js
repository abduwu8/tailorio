var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-ij2GW6/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-ij2GW6/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/index.ts
var commonSkills = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Express",
  "MongoDB",
  "SQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "CI/CD",
  "Agile",
  "Scrum",
  "REST API",
  "GraphQL",
  "HTML",
  "CSS",
  "SASS",
  "LESS",
  "Redux",
  "Vue",
  "jQuery",
  "Bootstrap",
  "Tailwind",
  "Material-UI",
  "Webpack",
  "Babel",
  "ESLint",
  "Jest",
  "Mocha",
  "Chai",
  "Cypress",
  "Selenium",
  "PHP",
  "Laravel",
  "Ruby",
  "Rails",
  "Django",
  "Flask",
  "Spring",
  "ASP.NET",
  ".NET",
  "C#",
  "Swift",
  "Kotlin",
  "Android",
  "iOS",
  "React Native",
  "Flutter"
];
function extractSkills(text) {
  return commonSkills.filter(
    (skill) => text.toLowerCase().includes(skill.toLowerCase())
  );
}
__name(extractSkills, "extractSkills");
function extractRequirements(text) {
  const lines = text.split(/[\n\r]+/);
  return lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("\u2022") || trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed) || trimmed.toLowerCase().includes("required") || trimmed.toLowerCase().includes("qualification") || trimmed.toLowerCase().includes("experience with") || trimmed.toLowerCase().includes("experience in") || trimmed.toLowerCase().includes("you will need") || trimmed.toLowerCase().includes("you should have");
  }).map((line) => line.trim()).filter((line) => line.length > 0);
}
__name(extractRequirements, "extractRequirements");
async function handleRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const { url } = await request.json();
    if (!url || !url.includes("linkedin.com/jobs/")) {
      return new Response(
        JSON.stringify({ error: "Invalid LinkedIn job URL" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS
          }
        }
      );
    }
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn page: ${response.status}`);
    }
    const html = await response.text();
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/) || html.match(/class="top-card-layout__title"[^>]*>([^<]+)</) || html.match(/class="job-details-jobs-unified-top-card__job-title"[^>]*>([^<]+)</);
    const companyMatch = html.match(/class="topcard__org-name-link"[^>]*>([^<]+)</) || html.match(/class="top-card-layout__company-name"[^>]*>([^<]+)</) || html.match(/class="job-details-jobs-unified-top-card__company-name"[^>]*>([^<]+)</);
    const locationMatch = html.match(/class="topcard__flavor--bullet"[^>]*>([^<]+)</) || html.match(/class="top-card-layout__bullet"[^>]*>([^<]+)</) || html.match(/class="job-details-jobs-unified-top-card__bullet"[^>]*>([^<]+)</);
    const descriptionMatch = html.match(/class="description__text[^>]*>([\s\S]*?)<\/div>/) || html.match(/class="show-more-less-html__markup[^>]*>([\s\S]*?)<\/div>/) || html.match(/class="job-description[^>]*>([\s\S]*?)<\/div>/);
    const employmentTypeMatch = html.match(/class="job-details-jobs-unified-top-card__workplace-type"[^>]*>([^<]+)</) || html.match(/class="top-card-layout__workplace-type"[^>]*>([^<]+)</) || html.match(/class="job-details-jobs-unified-top-card__job-type"[^>]*>([^<]+)</);
    const postedDateMatch = html.match(/class="posted-time-ago__text"[^>]*>([^<]+)</) || html.match(/class="job-posted-date"[^>]*>([^<]+)</) || html.match(/class="top-card-layout__posted-date"[^>]*>([^<]+)</);
    const description = descriptionMatch ? descriptionMatch[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() : "No description available";
    const jobDetails = {
      title: titleMatch ? titleMatch[1].trim() : "Unknown Title",
      company: companyMatch ? companyMatch[1].trim() : "Unknown Company",
      location: locationMatch ? locationMatch[1].trim() : "Unknown Location",
      description,
      employmentType: employmentTypeMatch ? employmentTypeMatch[1].trim() : void 0,
      postedDate: postedDateMatch ? postedDateMatch[1].trim() : void 0,
      requirements: extractRequirements(description),
      skills: extractSkills(description)
    };
    return new Response(
      JSON.stringify(jobDetails),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS,
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Error in handleRequest:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to scrape LinkedIn job",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS
        }
      }
    );
  }
}
__name(handleRequest, "handleRequest");
var src_default = {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ij2GW6/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ij2GW6/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
