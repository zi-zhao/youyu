<script setup>
/**
 * YyButton - 全局按钮组件
 * @prop {string} text 按钮文本，可以以插槽的形式使用
 * @prop {string} theme 按钮主题，可选值为'light'、'night'、'primary'、'success'等，默认为'light'，如果不需要使用，则设置为none
 * @prop {boolean} disabled 就是按钮的disabled
 * 其他的使用与普通按钮一致
 * 所有按钮默认都存在border，且盒子模型为border-box，意思是border不会影响盒子的大小，border的默认宽度为1px
 * 如果不需要，可以通过css/class覆盖，从优先级上来说，泛指的button样式<特指的button样式
 * 按钮的大小可由padding撑开
 */
import { defineProps } from "vue";

defineProps({
  text: {
    type: String,
    default: "",
  },
  theme: {
    type: String,
    default: "light",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <button :class="theme" :disabled="disabled">
    <span v-if="text">{{ text }}</span>
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
// 规定按钮基本样式
button {
  // 按钮内部内容居中显示
  display: inline-block;
  justify-content: center;
  align-items: center;
  border: 1px solid;
  border-radius: 0.25rem;
  cursor: pointer;
}

.success {
  background-color: #3d7d3f;
  border-color: #3d7d3f;
  color: white;

  &:hover {
    background-color: #38753b;
  }

  &:active {
    background-color: #38753b;
  }

  &:disabled {
    background-color: #a2d1a6;
  }
}

.primary {
  background-color: #1c74dd;
  border-color: #1c74dd;
  color: white;
  &:hover {
    background-color: #5c83f3;
  }
  &:active {
    background-color: #355cd4;
  }
  &:disabled {
    background-color: #a4c7f1;
    border-color: transparent;
  }
}

.primary-faint {
  background-color: white;
  border-color: #1c74dd;
  color: #1c74dd;
  &:hover {
    background-color: #e3eafc;
  }
  &:active {
    background-color: #bfcef7;
  }
  &:disabled {
    background-color: white;
    border-color: #a4c7f1;
    color: #a4c7f1;
  }
}

.danger {
  background-color: #f6f8fa;
  border-color: #d0d7de;
  color: #c21e31;

  &:hover {
    background-color: #f3f4f6;
  }

  &:active {
    background-color: #ebecef;
  }

  &:disabled {
    color: #ecccd2;
  }
}

.black {
  background-color: black;
  border-color: black;
  color: white;

  &:hover {
    background-color: #555555;
    border-color: #555555;
  }

  &:active {
    background-color: #555555;
    border-color: #555555;
  }

  &:disabled {
    background-color: #b5b5b5;
    border-color: #b5b5b5;
  }
}

.light {
  background-color: #f6f8fa;
  border-color: #d0d7de;
  color: black;

  &:hover {
    background-color: #f3f4f6;
  }

  &:active {
    background-color: #ebecef;
  }

  &:disabled {
    color: gray;
  }
}
.purple{
  background-color: #B1B9D4;
  border-radius: 8px;
  color: #FFF;
  padding: 8px 22px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.5s ease;
  margin: 0 auto;
  font-size: 16px;
  border: none;
  cursor: pointer;
}
.gray{
  background-color: #939393;
  border-radius: 8px;
  color: #FFF;
  padding: 8px 22px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.5s ease;
  margin: 0 auto;
  font-size: 16px;
  border: none;
  cursor: pointer;
}
.nobgc{
  //背景色为button自带的浅灰色
  border-radius: 8px;
  color: #000;
  padding: 8px 22px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.5s ease;
  margin: 0 auto;
  border: none;
  cursor: pointer;
}
</style>
