export const getDefaultDocumentNode = ({ schemaType }) => {
    if (schemaType === 'SEO') {
      return S.document().views([
        S.view.form(),
        S.view.component(JsonView).title('JSON')
      ]);
    }
    return S.document();
  };
  
  export default (S) =>
    S.list()
      .title('Content')
      .items([
        S.listItem()
          .title('SEO Articles')
          .schemaType('SEO')
          .child(
            S.documentList()
              .title('SEO Articles')
              .filter('_type == "SEO"')
              .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
          ),
        // Add other document types here
      ]);