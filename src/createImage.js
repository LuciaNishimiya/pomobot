import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';

// Convierte un string emoji a su codepoint separado por guiones (ej: 🐄 -> 1f404)
function emojiToCodePoint(emoji) {
    return Array.from(emoji)
        .map(char => char.codePointAt(0).toString(16))
        .join('-');
}

function getEmojiUrl(emoji) {
    return `https://cdn.zuros.xyz/emojis/${emojiToCodePoint(emoji)}.png`;
}

export async function createImage(size, objects, fontFamily = 'Quicksand') {
    registerFont('./assets/fonts/Quicksand.ttf', { family: fontFamily });

    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext('2d');

    // Ordena los objetos por z (de menor a mayor)
    objects.sort((a, b) => (a.z || 0) - (b.z || 0));

    for (const obj of objects) {
        if (obj.type === 'text') {
            ctx.font = `${obj.height || Math.floor(size.height * 0.18)}px "${fontFamily}"`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = obj.color || '#222';

            let x = obj.x;
            const y = obj.y;
            const emojiHeight = obj.height || Math.floor(size.height * 0.18);

            const regex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
            let lastIndex = 0;
            let match;
            while ((match = regex.exec(obj.value)) !== null) {
                // Dibuja texto antes del emoji
                if (match.index > lastIndex) {
                    const text = obj.value.slice(lastIndex, match.index);
                    ctx.fillText(text, x, y);
                    x += ctx.measureText(text).width;
                }
                // Dibuja el emoji
                const emoji = match[0];
                const emojiUrl = getEmojiUrl(emoji);
                const img = await loadImage(emojiUrl);
                ctx.drawImage(img, x, y, emojiHeight, emojiHeight);
                x += emojiHeight;
                lastIndex = regex.lastIndex;
            }
            // Dibuja texto restante
            if (lastIndex < obj.value.length) {
                const text = obj.value.slice(lastIndex);
                ctx.fillText(text, x, y);
            }
        } else if (obj.type === 'image') {
            const img = await loadImage(obj.value);
            ctx.drawImage(
                img,
                obj.x,
                obj.y,
                obj.width || img.width,
                obj.height || img.height
            );
        } else if (obj.type === 'rect') {
            ctx.fillStyle = obj.color || '#000';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.type === 'circle') {
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
            ctx.fillStyle = obj.color || '#000';
            ctx.fill();
        }
    }

    const buffer = canvas.toBuffer('image/png');
    // fs.writeFileSync('output.png', buffer);
    return buffer;
}
/* 
// Ejemplo de uso:
const objects = [
    { type: 'rect', x: 0, y: 0, width: 800, height: 400, color: '#87ceeb', z: 0 },
    { type: 'rect', x: 0, y: 300, width: 800, height: 100, color: '#4caf50', z: 4 },
    { type: 'text', value: '☀️', x: 650, y: 30, height: 80, z: 1 },
    { type: 'text', value: '☁️', x: 100, y: 60, height: 60, z: 2 },
    { type: 'text', value: '☁️', x: 200, y: 40, height: 50, z: 2 },
    { type: 'text', value: '☁️', x: 400, y: 80, height: 70, z: 2 },
    { type: 'text', value: '🏠', x: 600, y: 220, height: 90, z: 3 },
    { type: 'text', value: '🐐', x: 635, y: 190, height: 50, z: 4 },
    { type: 'text', value: '🌸', x: 120, y: 340, height: 40, z: 5 },
    { type: 'text', value: '🌻', x: 200, y: 350, height: 40, z: 5 },
    { type: 'text', value: '🌼', x: 300, y: 330, height: 40, z: 5 },
    { type: 'text', value: '🌷', x: 400, y: 360, height: 40, z: 7 },
    { type: 'text', value: '🐄', x: 400, y: 300, height: 90, z: 6 }
];

createImage({ width: 800, height: 400 }, objects);
 */