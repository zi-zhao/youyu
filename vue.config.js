const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const JavaScriptObfuscator = require("webpack-obfuscator");

module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    iconPaths: {
      favicon32: "favicon.ico",
      favicon16: "favicon.ico",
      appleTouchIcon: "favicon.ico",
      maskIcon: "favicon.ico",
      msTileImage: "favicon.ico",
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      // 生产环境添加JavaScriptObfuscator插件
      config.plugins.push(
        new JavaScriptObfuscator(
          {
            rotateUnicodeArray: true, // 启用unicode数组旋转
            // 其他混淆选项...
          },
          []
        )
      );
    }
    // 添加或覆盖webpack的externals配置
    config.externals = {
      ...config.externals, // 展开任何已有的externals
      MathLive: "MathLive",
    };
  },
});

