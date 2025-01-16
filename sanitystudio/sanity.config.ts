import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { table } from '@sanity/table';
import { media } from 'sanity-plugin-media';

// import {theme as _theme} from 'https://themer.sanity.build/api/hues?preset=pixel-art'
// const theme = _theme as import('sanity').StudioTheme
// import {theme} from 'https://themer.sanity.build/api/hues?preset=pixel-art'
export default defineConfig({
  name: 'default',
  title: 'doitwithai.tools',
  projectId: 'qyshio4a',
  dataset: 'production',
  basePath: '/',
  // theme,
  // Apply custom theme
  // theme: myTheme,

  // Schema definition
  schema: {
    types: schemaTypes,
  },
  file: {
    assetSources: ['file', 'url'],
  },
  // Plugins
  plugins: [
    deskTool(),
    visionTool(),
    table(),
    media(),
  ],

  // Studio custom components and styles
  // studio: {
  //   theme: theme, // Apply the custom theme
  // },

  // Custom form components
  // form: {
  //   components: {
  //     input: CustomInput, 
  //     textarea: CustomRichTextEditor,
  //   },
  // },

  // // Customize document actions
  // document: {
  //   actions: (prev) => {
  //     return prev; // Add custom actions if needed
  //   },
  // },
});
