<template>
  <component :is="layout">
    <router-view />
  </component>
  <ToastContainer />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import AuthLayout from "./layouts/AuthLayout.vue";
import ToastContainer from "./components/ui/ToastContainer.vue";

const route = useRoute();

const layout = computed(() => {
  switch (route.meta.layout) {
    case "auth":
      return AuthLayout;
    case "default":
      return DefaultLayout;
    default:
      return "div";
  }
});
</script>