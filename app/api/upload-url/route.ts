import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configurazione R2 (le credenziali devono essere in .env.local)
const R2_CONFIG = {
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID_VERCEL,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY_VERCEL,
    R2_BUCKET_NAME: process.env.R2_BUCKET_BUCKET_NAME,
};

// Configura il client S3 (compatibile con R2)
const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_CONFIG.R2_ENDPOINT ?? "",
    credentials: {
        accessKeyId: R2_CONFIG.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: R2_CONFIG.R2_SECRET_ACCESS_KEY ?? "",
    },
});

/**
 * Gestisce la richiesta POST dal frontend per ottenere un URL firmato.
 * @param {Request} request - La richiesta in entrata contenente i dettagli del file.
 */
export async function POST(request: Request) {
    try {
        const { fileName, contentType } = await request.json();

        if (!fileName || !contentType) {
            return new Response(JSON.stringify({ error: 'Nome file e ContentType sono richiesti.' }), { status: 400 });
        }

        // Genera la chiave del file, assicurandoci che sia nella cartella NEW/
        const fileKey = `NEW/${Date.now()}-${fileName}`;
        
        const command = new PutObjectCommand({
            Bucket: R2_CONFIG.R2_BUCKET_NAME,
            Key: fileKey,
            ContentType: contentType,
        });

        // Genera l'URL firmato, valido per 60 secondi
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        
        console.log(`[R2] Generato URL firmato per: ${fileKey}`);

        return new Response(JSON.stringify({ signedUrl, fileKey }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Errore nella generazione dell\'URL firmato:', error);
        return new Response(JSON.stringify({ error: 'Errore interno del server durante la generazione dell\'URL.' }), { status: 500 });
    }
}
