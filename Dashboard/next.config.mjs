/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { webpack, nextRuntime }) => {
    // Next 14 + Vercel's edge bundler can emit a stray `__dirname` reference
    // into the middleware bundle. The Edge runtime does not define `__dirname`,
    // so it crashes at request time with "ReferenceError: __dirname is not
    // defined" (MIDDLEWARE_INVOCATION_FAILED). Replace the token with a
    // harmless constant at compile time, edge build only.
    if (nextRuntime === "edge") {
      config.plugins.push(
        new webpack.DefinePlugin({ __dirname: JSON.stringify("/") }),
      );
    }
    return config;
  },
};

export default nextConfig;
