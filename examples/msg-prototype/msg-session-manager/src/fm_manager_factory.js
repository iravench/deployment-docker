'use strict';

export default function(config) {
  const { repo, token } = config;

  return {
    sendMessages: function(bulk) {
      return new Promise((resolve, reject) => {
        resolve({});
      });
    }
  };
}
