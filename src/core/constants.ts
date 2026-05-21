// Pinned action SHAs. Bump with the `update-actions` command (roadmap).
export const ACTIONS = {
  CHECKOUT: "de0fac2e4500dabe0009e67214ff5f5447ce83dd", // v6.0.2
  SETUP_BUN: "0c5077e51419868618aeaa5fe8019c62421857d6", // v2.2.0
  SETUP_NODE: "48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e", // v6.4.0
  UPLOAD: "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a", // v7.0.1
  DOWNLOAD: "3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c", // v8.0.1
} as const;

export const NODE_VERSION = "24.15.0";
export const NPM_MIN_VERSION = "11.15.0";
export const NPM_VERSION_RANGE = `^${NPM_MIN_VERSION}`;

export const PUBLISH_ENV = "npm-publish";

export const PATHS = {
  RELEASE_WORKFLOW: ".github/workflows/release.yml",
  CI_WORKFLOW: ".github/workflows/ci.yml",
} as const;
