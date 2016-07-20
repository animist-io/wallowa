module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  deploy: [
    "AnimistEvent",
    "Race",
    "Race_test",
  ],
  rpc: {
    host: "localhost",
    port: 8545
  }
};
