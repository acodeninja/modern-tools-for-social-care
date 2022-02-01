module.exports = {
  plugins: [
    ["module-resolver", {
      root: ["./"],
      alias: {
        internals: "../../framework/internals/src/"
      }
    }]
  ],
  presets: [
    ["@babel/preset-env", {targets: {node: "current"}}],
    "@babel/preset-typescript"
  ]
}
