// app/api/upload/route.ts
// IMPORTANTE: Necessario installare '@aws-sdk/client-s3' anche nel progetto Next.js

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

// ⚠️ Per l'upload di file grandi, dobbiamo specificare che questa route non deve usare il parser di Next.js 
// per caricare l'intero body in memoria. Tuttavia, con Next.js 14 e App Router, gestiamo 
// il FormData come stream.

// Configurazione R2 (usa le variabili d'ambiente di Vercel)
const s3Client = new S3Client({
    endpoint: process.env.R2_ENDPOINT ?? "",
    region: 'auto',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID_VERCEL ?? "", // Chiavi da Vercel
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY_VERCEL ?? "", // Chiavi da Vercel
    }
});

export async function POST(request: Request) {
    try {
        // 1. Leggi il form data (Next.js gestisce lo streaming implicito qui)
        const formData = await request.formData();
        const file = formData.get('csvFile') as File | null; 

        if (!file) {
            return NextResponse.json({ error: 'Nessun file trovato.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const fileName = `NEW/${Date.now()}-${file.name}`;

        // 2. Caricamento Stream su R2
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_BUCKET_NAME,
            Key: fileName,
            Body: buffer, // Invia il buffer ad R2
            ContentType: file.type
        }));

        // 3. Risposta immediata
        return NextResponse.json({ 
            status: 'Accepted', 
            message: 'File caricato. Elaborazione avviata.', 
            key: fileName 
        }, { status: 202 });

    } catch (error) {
        console.error("Errore di caricamento:", error);
        return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 });
    }
}