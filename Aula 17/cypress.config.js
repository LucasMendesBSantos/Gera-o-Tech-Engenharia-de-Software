const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCrypressEnv: false,
  e2e: {
    baseUrl: "https://127.0.0.1/5500",
    
  },
});
