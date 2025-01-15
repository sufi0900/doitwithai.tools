import React from 'react';
// import { FormField } from '@sanity/base/components';
import { TextArea } from '@sanity/ui';
import styled from 'styled-components';
import { FormField } from 'sanity';

const EditorContainer = styled.div`
  max-width: var(--content-width);
  margin: 0 auto;
`;

const StyledTextArea = styled(TextArea)`
  min-height: 400px;
  width: 100%;
`;

export const CustomRichTextEditor = React.forwardRef((props: any, ref: any) => {
  return (
    <EditorContainer>
      <FormField
        description={props.type.description}
        title={props.type.title}
        // __unstable_markers={props.markers}
      >
        <StyledTextArea {...props} ref={ref} />
      </FormField>
    </EditorContainer>
  );
});