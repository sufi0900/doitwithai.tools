import React from 'react';
import { TextInput } from '@sanity/ui';
import styled from 'styled-components';

const StyledInput = styled(TextInput)`
  width: 100%;
  max-width: var(--content-width);
`;

export const CustomInput = (props: any) => {
  return <StyledInput {...props} />;
};
