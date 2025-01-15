export const validationRules = {
    meta: {
      title: {
        max: 70,
        min: 10,
        warning: length => `Title should be between 10-70 characters (current: ${length})`
      },
      description: {
        max: 160,
        min: 50,
        warning: length => `Description should be between 50-160 characters (current: ${length})`
      },
      slug: {
        max: 96,
        pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      }
    },
    content: {
      heading: {
        max: 100,
        min: 3
      },
      paragraph: {
        max: 2000
      }
    },
    image: {
      alt: {
        max: 125,
        min: 5
      },
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  };
  