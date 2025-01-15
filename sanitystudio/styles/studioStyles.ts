import { createGlobalStyle } from 'styled-components';

export const StudioStyles = createGlobalStyle`
  :root {
    --content-width: 1200px;
    --input-bg-color: #ffffff;
    --input-border-color: #e2e8f0;
  }

  /* Wider content area */
  .sanity-studio-content {
    max-width: var(--content-width) !important;
    margin: 0 auto;
  }

  /* Rich text editor customization */
  .portable-text-editor {
    min-height: 400px;
    background-color: var(--input-bg-color);
    border: 1px solid var(--input-border-color);
    border-radius: 4px;
    padding: 20px;
    
    &:focus-within {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }

  /* Custom toolbar styles */
  .toolbar {
    border-bottom: 1px solid var(--input-border-color);
    padding: 8px;
    margin-bottom: 16px;
    
    button {
      margin-right: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      
      &:hover {
        background-color: var(--component-bg);
      }
    }
  }

  /* Custom input styles */
  .form-field {
    input, textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--input-border-color);
      border-radius: 4px;
      background-color: var(--input-bg-color);
      
      &:focus {
        border-color: var(--brand-primary);
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
    }
  }

  /* Custom field label styles */
  .field-label {
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--component-text-color);
  }

  /* Custom document list styles */
  .document-list {
    background-color: var(--input-bg-color);
    border-radius: 4px;
    overflow: hidden;
    
    .document-list-item {
      padding: 12px;
      border-bottom: 1px solid var(--input-border-color);
      
      &:hover {
        background-color: var(--component-bg);
      }
    }
  }
`;