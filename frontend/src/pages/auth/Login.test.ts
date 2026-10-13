import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";
import Login from "./Login.vue";
import { useAuthStore } from "../../stores/auth.js";

// Mock the api service
vi.mock("../../services/api.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock vue-query composables used by the auth store so the store can be
// created outside a component context (no VueQueryPlugin needed in tests)
vi.mock("../../composables/useApi", () => {
  const mutationMock = () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    data: ref(null),
  });
  return {
    useLogin: mutationMock,
    useRegister: mutationMock,
    useRefreshToken: mutationMock,
    useLogout: mutationMock,
    useMe: () => ({ data: ref(null), refetch: vi.fn() }),
  };
});

// Render router-link as a plain anchor so link assertions work without
// installing the full router
const globalMountOptions = {
  global: {
    stubs: {
      "router-link": {
        props: ["to"],
        template: '<a :href="to"><slot /></a>',
      },
    },
  },
};

describe("Login Page", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders login form", () => {
    const wrapper = mount(Login, globalMountOptions);
    expect(wrapper.find("h1").text()).toBe("Entrar na sua conta");
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it("has link to register page", () => {
    const wrapper = mount(Login, globalMountOptions);
    expect(wrapper.find('a[href="/register"]').exists()).toBe(true);
  });
});

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initializes with correct default state", () => {
    const auth = useAuthStore();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBe(null);
    expect(auth.accessToken).toBe(null);
  });
});
