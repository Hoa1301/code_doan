const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://103.249.200.85:3002';
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

const getTargetUrl = (req: any) => {
    const fallbackPath = String(req.url || '')
        .split('?')[0]
        .replace(/^\/api\/?/, '');
    const path = Array.isArray(req.query.path)
        ? req.query.path.join('/')
        : String(req.query.path || fallbackPath);
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
    return `${BACKEND_BASE_URL.replace(/\/$/, '')}/${path}${queryString ? `?${queryString}` : ''}`;
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
    const targetUrl = getTargetUrl(req);
    const headers = new Headers();

    Object.entries(req.headers).forEach(([key, value]) => {
        if (!value) return;
        if (key.toLowerCase() === 'host' || key.toLowerCase() === 'content-length') return;
        if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;

        headers.set(key, Array.isArray(value) ? value.join(',') : value);
    });

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: await readRequestBody(req)
        });

        response.headers.forEach((value, key) => {
            if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
            res.setHeader(key, value);
        });

        const body = await response.arrayBuffer();
        res.status(response.status).send(Buffer.from(body));
    } catch (error) {
        res.status(502).json({
            errorCode: 502,
            message: 'Cannot connect to backend API',
            target: targetUrl,
            detail: error instanceof Error ? error.message : String(error)
        });
    }
}
