import test from 'node:test';
import assert from 'node:assert/strict';
import { attendanceCrop, prepareAttendancePhoto } from '../lib/attendance-camera.mjs';

test('zoom crops the center and preserves the preview aspect ratio for both camera shapes', () => {
  for (const [width, height] of [[1920, 1080], [720, 1280], [1280, 960]]) {
    const full = attendanceCrop(width, height, 1);
    const zoomed = attendanceCrop(width, height, 2);
    assert.equal(zoomed.width, full.width / 2);
    assert.equal(zoomed.height, full.height / 2);
    assert.equal(zoomed.x + zoomed.width / 2, width / 2);
    assert.equal(zoomed.y + zoomed.height / 2, height / 2);
    assert.ok(Math.abs(zoomed.width / zoomed.height - 4 / 3) < 0.00001);
    assert.ok(full.width <= width && full.height <= height);
  }
  assert.deepEqual(attendanceCrop(1280, 960, 9), attendanceCrop(1280, 960, 3));
  assert.deepEqual(attendanceCrop(1280, 960, 0), attendanceCrop(1280, 960, 1));
});

test('submitted JPEG uses the same crop as the digital zoom preview', async () => {
  const original = globalThis.document;
  let draw;
  const blob = new Blob(['photo'], { type: 'image/jpeg' });
  const image = { naturalWidth: 1280, naturalHeight: 960, set src(value) { this.source = value; this.onload(); } };
  const canvas = { getContext: () => ({ drawImage: (...args) => { draw = args; } }),
    toBlob: cb => cb(blob), toDataURL: () => 'data:image/jpeg;base64,preview' };
  globalThis.document = { createElement: tag => tag === 'img' ? image : canvas };
  try {
    const result = await prepareAttendancePhoto('camera-source', 2);
    assert.deepEqual(draw.slice(1, 5), [320, 240, 640, 480]);
    assert.equal(canvas.width, 640);
    assert.equal(canvas.height, 480);
    assert.equal(result.blob, blob);
    assert.equal(result.preview, 'data:image/jpeg;base64,preview');
  } finally { globalThis.document = original; }
});
