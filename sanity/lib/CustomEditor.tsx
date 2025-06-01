// components/QuillEditor.tsx
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PatchEvent, set, unset } from 'sanity';

const QuillEditor = (props: any) => {
  const { onChange, value } = props;

  return (
    <ReactQuill
      theme="snow"
      value={value || ''}
      onChange={(content) => {
        onChange(PatchEvent.from(content ? set(content) : unset()));
      }}
      modules={{
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          ['link', 'image'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ]
      }}
    />
  );
};

export default QuillEditor;