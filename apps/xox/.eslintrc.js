module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  // Override settings to remove deprecated options
  settings: {
    'import/resolver': {
      node: {}
    }
  }
};
