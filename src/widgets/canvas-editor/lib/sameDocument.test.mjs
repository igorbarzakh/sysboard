import assert from 'node:assert/strict'
import test from 'node:test'
import { hasSameDocument } from './sameDocument.ts'

const saved = {
  document: {
    store: {
      'shape:one': { id: 'shape:one', typeName: 'shape', x: 10, props: { color: 'red' } },
      'page:one': { id: 'page:one', typeName: 'page', name: 'Page 1' },
    },
  },
  session: { selectedShapeIds: ['shape:one'] },
}

test('a saved document matches regardless of record order or session state', () => {
  assert.equal(hasSameDocument(saved, {
    'page:one': { name: 'Page 1', typeName: 'page', id: 'page:one' },
    'shape:one': { props: { color: 'red' }, x: 10, typeName: 'shape', id: 'shape:one' },
  }), true)
})

test('a changed document still needs to be saved', () => {
  assert.equal(hasSameDocument(saved, {
    ...saved.document.store,
    'shape:one': { ...saved.document.store['shape:one'], x: 20 },
  }), false)
  assert.equal(hasSameDocument(null, saved.document.store), false)
})
