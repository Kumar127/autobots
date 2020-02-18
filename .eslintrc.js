module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    'airbnb-base',
    'plugin:vue/essential'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
    "linebreak-style":"off",
    "max-len": [ "error", {"code": 140}]
  }
}