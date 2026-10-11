import type { Plugin, ViteDevServer } from "vite";
import fs from "fs";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import {
  getStatus,
  getPresets,
  getHistory,
  fetchProblem,
  runTrace,
  synthesizeVoice,
  renderVideo,
  solveCustomProblemApi,
  getSystemDesignPresetsApi,
  generateSystemDesignApi,
} from "./api.ts";

function parseJsonBody<T = any>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export function algoMotionApiPlugin(): Plugin {
  return {
    name: "algomotion-api-plugin",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || "";

        // Static out files serving: /out/videos/:file, /out/thumbnails/:file, etc.
        if (url.startsWith("/out/")) {
          const filePath = path.join(process.cwd(), url);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            if (url.endsWith(".mp4")) res.setHeader("Content-Type", "video/mp4");
            else if (url.endsWith(".jpg") || url.endsWith(".jpeg"))
              res.setHeader("Content-Type", "image/jpeg");
            else if (url.endsWith(".png"))
              res.setHeader("Content-Type", "image/png");
            else if (url.endsWith(".txt"))
              res.setHeader("Content-Type", "text/plain");
            else if (url.endsWith(".json"))
              res.setHeader("Content-Type", "application/json");

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
            return;
          }
        }

        if (!url.startsWith("/api/")) {
          return next();
        }

        try {
          if (req.method === "GET" && url === "/api/status") {
            const status = await getStatus();
            return sendJson(res, { success: true, data: status });
          }

          if (req.method === "GET" && url === "/api/presets") {
            const presets = await getPresets();
            return sendJson(res, { success: true, data: presets });
          }

          if (req.method === "GET" && url === "/api/history") {
            const history = await getHistory();
            return sendJson(res, { success: true, data: history });
          }

          if (req.method === "POST" && url === "/api/fetch-problem") {
            const body = await parseJsonBody<{ input: string }>(req);
            if (!body.input) {
              return sendJson(res, { success: false, error: "input is required" }, 400);
            }
            const props = await fetchProblem(body.input);
            return sendJson(res, { success: true, data: props });
          }

          if (req.method === "POST" && url === "/api/solve-custom-problem") {
            const body = await parseJsonBody<{
              title: string;
              description?: string;
              difficulty?: "Easy" | "Medium" | "Hard";
              testcase?: string;
              code?: string;
            }>(req);
            if (!body.title) {
              return sendJson(res, { success: false, error: "title is required" }, 400);
            }
            const props = await solveCustomProblemApi(body);
            return sendJson(res, { success: true, data: props });
          }

          if (req.method === "GET" && url === "/api/system-design-presets") {
            const presets = await getSystemDesignPresetsApi();
            return sendJson(res, { success: true, data: presets });
          }

          if (req.method === "POST" && url === "/api/generate-system-design") {
            const body = await parseJsonBody<{
              topic: string;
              description?: string;
            }>(req);
            if (!body.topic) {
              return sendJson(res, { success: false, error: "topic is required" }, 400);
            }
            const props = await generateSystemDesignApi(body.topic, body.description);
            return sendJson(res, { success: true, data: props });
          }

          if (req.method === "POST" && url === "/api/trace") {
            const body = await parseJsonBody<{
              code: string;
              array: number[];
              target?: number;
            }>(req);
            if (!body.code || !body.array) {
              return sendJson(
                res,
                { success: false, error: "code and array are required" },
                400,
              );
            }
            const result = await runTrace(body);
            return sendJson(res, { success: true, data: result });
          }

          if (req.method === "POST" && url === "/api/generate-voice") {
            const body = await parseJsonBody<{ text: string; voiceId?: string }>(req);
            if (!body.text) {
              return sendJson(res, { success: false, error: "text is required" }, 400);
            }
            const result = await synthesizeVoice(body);
            return sendJson(res, { success: true, data: result });
          }

          if (req.method === "POST" && url === "/api/render-video") {
            const body = await parseJsonBody<{
              slug: string;
              props: any;
              gpu?: boolean;
              platform?: "instagram" | "youtube";
            }>(req);
            if (!body.slug || !body.props) {
              return sendJson(
                res,
                { success: false, error: "slug and props are required" },
                400,
              );
            }
            const result = await renderVideo(body);
            return sendJson(res, { success: true, data: result });
          }

          // Fallthrough
          sendJson(res, { success: false, error: `Endpoint not found: ${url}` }, 404);
        } catch (err: any) {
          console.error(`[API Error] ${url}:`, err);
          sendJson(
            res,
            { success: false, error: err.message || "Internal server error" },
            500,
          );
        }
      });
    },
  };
}
