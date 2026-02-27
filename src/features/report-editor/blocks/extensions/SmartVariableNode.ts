import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SmartVariableNodeView } from './SmartVariableNodeView';

export const SmartVariableNode = Node.create({
  name: 'smartVariable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-variable-id'),
        renderHTML: (attributes) => ({ 'data-variable-id': attributes.id }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-smart-variable]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, 'data-smart-variable': 'true' }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SmartVariableNodeView);
  },
});
