import next from "eslint-config-next";

/** Flat config — Next 16 ships its shareable config as flat config already. */
const config = [...next, { ignores: [".next/**", "node_modules/**", ".data/**"] }];

export default config;
