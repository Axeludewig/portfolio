import * as THREE from "three";

/**
 * Shared matrix glyph set and texture atlas. Every glyph is painted once into a
 * grid texture so shaders can index into it by cell, and meshes can use it as a
 * map. Browser-only — callers must be client components.
 */

export const GLYPHS =
	"アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\{}[]$#@*+=";
export const ATLAS_COLS = 12;
const CELL = 64; // px per glyph cell

export function buildGlyphAtlas() {
	const rows = Math.ceil(GLYPHS.length / ATLAS_COLS);
	const canvas = document.createElement("canvas");
	canvas.width = ATLAS_COLS * CELL;
	canvas.height = rows * CELL;
	const ctx = canvas.getContext("2d")!;
	ctx.fillStyle = "#fff";
	ctx.font = `600 ${CELL * 0.72}px ui-monospace, "SF Mono", Menlo, monospace`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	for (let i = 0; i < GLYPHS.length; i++) {
		const col = i % ATLAS_COLS;
		const row = Math.floor(i / ATLAS_COLS);
		ctx.fillText(GLYPHS[i], (col + 0.5) * CELL, (row + 0.55) * CELL);
	}
	const texture = new THREE.CanvasTexture(canvas);
	texture.flipY = false; // atlas rows run top-down, like gl_PointCoord
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	return { texture, rows };
}
