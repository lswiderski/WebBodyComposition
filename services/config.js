// Proxy API endpoints, set at build time (Next.js inlines NEXT_PUBLIC_* variables). See .env.example.
const YAGCC_URL = process.env.NEXT_PUBLIC_YAGCC_URL;
const BODYCOMPOSITION_WEBAPI_URL = process.env.NEXT_PUBLIC_BODYCOMPOSITION_WEBAPI_URL;

const endpoint = (base, name, path) => {
    if (!base) throw new Error(`${name} is not configured`);
    return base.replace(/\/+$/, '') + path;
};

// YAGCC (yet-another-garmin-connect-client): Garmin Connect upload from /sync/bodycomposition.
export const yagccUploadUrl = () => endpoint(YAGCC_URL, 'NEXT_PUBLIC_YAGCC_URL', '/upload');

// bodycomposition-webapi: Garmin Connect upload from /sync/garmin and ".fit file only" downloads.
export const bodyCompositionWebApiUploadUrl = () =>
    endpoint(BODYCOMPOSITION_WEBAPI_URL, 'NEXT_PUBLIC_BODYCOMPOSITION_WEBAPI_URL', '/upload');
