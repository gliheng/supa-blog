import '@blocksuite/presets/themes/affine.css';
import { AffineEditorContainer, createEmptyDoc } from '@blocksuite/presets';
import { Doc, Schema } from '@blocksuite/store';
import { DocCollection } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks';

export function initEditor() {
  // const schema = new Schema().register(AffineSchemas);
  // const collection = new DocCollection({ schema });
  // const doc = collection.createDoc({ id: 'page1' });
  const doc = createEmptyDoc().init();

  doc.load(() => {
    const pageBlockId = doc.addBlock('affine:page', {});
    doc.addBlock('affine:surface', {}, pageBlockId);
    const noteId = doc.addBlock('affine:note', {}, pageBlockId);
    doc.addBlock('affine:paragraph', {}, noteId);
  });

  const editor = new AffineEditorContainer();
  editor.doc = doc;
  // editor.slots.docLinkClicked.on(({ docId }) => {
  //   const target = <Doc>collection.getDoc(docId);
  //   editor.doc = target;
  // });
  return { editor };
}

// export function initEditor() {
//   const doc = createEmptyDoc().init();
//   const editor = new PageEditor();
//   editor.specs = PageEditorBlockSpecs;
//   editor.doc = doc;
  
//   elRef.value.appendChild(editor);
  
//   // Update block node with some initial text content
//   const paragraphs = doc.getBlockByFlavour('affine:paragraph');
//   const paragraph = paragraphs[0];
//   doc.updateBlock(paragraph, { text: new Text('Hello World!') });
//   return { editor };
// }