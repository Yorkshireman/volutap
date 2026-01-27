require('dotenv').config({ path: '.env.local' });

module.exports = ({ config }) => {
  return {
    expo: {
      ...config,
      extra: {
        ...config.extra,
        AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY
      }
    }
  };
};
