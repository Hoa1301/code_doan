const DEFAULT_BACKEND_BASE_URL = 'http://103.249.200.85:3001';
const BACKEND_BASE_URLS = Array.from(
    new Set([DEFAULT_BACKEND_BASE_URL, process.env.BACKEND_BASE_URL].filter(Boolean))
) as string[];
const HOP_BY_HOP_HEADERS = new Set([
    'connection',
    'content-encoding',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade'
]);

export const config = {
    api: {
        bodyParser: false
    }
};

const getTargetPath = (req: any) => {
    const path = String(req.query.path || '').replace(/^\/+/, '');
    const query = new URLSearchParams();

    Object.entries(req.query).forEach(([key, value]) => {
        if (key === 'path') return;

        if (Array.isArray(value)) {
            value.forEach((item) => query.append(key, item));
            return;
        }

        if (typeof value === 'string') {
            query.append(key, value);
        }
    });

    const queryString = query.toString();
    return `${path}${queryString ? `?${queryString}` : ''}`;
};

const getTargetUrl = (baseUrl: string, targetPath: string) => {
    return `${baseUrl.replace(/\/$/, '')}/${targetPath}`;
};

const readRequestBody = async (req: any) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
        return undefined;
    }

    const chunks: Buffer[] = [];

    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
};

export default async function handler(req: any, res: any) {
    const targetPath = getTargetPath(req);
    const headers = new Headers();

    Object.entries(req.headers).forEach(([key, value]) => {
        if (!value) return;
        const normalizedKey = key.toLowerCase();

        if (normalizedKey === 'host' || normalizedKey === 'content-length') return;
        if (HOP_BY_HOP_HEADERS.has(normalizedKey)) return;

        headers.set(key, Array.isArray(value) ? value.join(',') : value);
    });

    let lastError: unknown;
    const requestBody = await readRequestBody(req);

    for (const baseUrl of BACKEND_BASE_URLS) {
        const targetUrl = getTargetUrl(baseUrl, targetPath);

        try {
            const response = await fetch(targetUrl, {
                method: req.method,
                headers,
                body: requestBody
            });

            response.headers.forEach((value, key) => {
                if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
                res.setHeader(key, value);
            });

            const body = await response.arrayBuffer();
            res.status(response.status).send(Buffer.from(body));
            return;
        } catch (error) {
            lastError = error;
        }
    }

    res.status(502).json({
        errorCode: 502,
        message: 'Cannot connect to backend API',
        targets: BACKEND_BASE_URLS.map((baseUrl) => getTargetUrl(baseUrl, targetPath)),
        detail: lastError instanceof Error ? lastError.message : String(lastError)
    });
}
