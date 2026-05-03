const fs = require('fs');

function getFullBounds(filepath) {
    const buffer = fs.readFileSync(filepath);
    const chunkLength = buffer.readUInt32LE(12);
    const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + chunkLength));
    
    let globalMin = [Infinity, Infinity, Infinity];
    let globalMax = [-Infinity, -Infinity, -Infinity];
    
    for (const mesh of gltf.meshes || []) {
        for (const primitive of mesh.primitives || []) {
            const posIdx = primitive.attributes?.POSITION;
            if (posIdx !== undefined) {
                const accessor = gltf.accessors[posIdx];
                if (accessor.min) {
                    globalMin[0] = Math.min(globalMin[0], accessor.min[0]);
                    globalMin[1] = Math.min(globalMin[1], accessor.min[1]);
                    globalMin[2] = Math.min(globalMin[2], accessor.min[2]);
                }
                if (accessor.max) {
                    globalMax[0] = Math.max(globalMax[0], accessor.max[0]);
                    globalMax[1] = Math.max(globalMax[1], accessor.max[1]);
                    globalMax[2] = Math.max(globalMax[2], accessor.max[2]);
                }
            }
        }
    }
    return `Min: ${globalMin.map(n=>n.toFixed(2))}, Max: ${globalMax.map(n=>n.toFixed(2))}`;
}

console.log('road-split:', getFullBounds('public/models/road/road-split.glb'));
console.log('road-curve:', getFullBounds('public/models/road/road-curve.glb'));
console.log('road-straight:', getFullBounds('public/models/road/road-straight.glb'));
