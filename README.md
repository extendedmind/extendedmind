# Extended Mind v2

[![Actions Status](https://github.com/extendedmind/extendedmind/workflows/Build/badge.svg)](https://github.com/extendedmind/extendedmind/actions)

This is the root of the Extended Mind v2 code repository.

For v1 source code see the `1.x` branch.

## Development

Whereas the build is using Bazel, development of the Rust crates is much easier with Cargo and 
Android development with Gradle. The needed steps for OSX are listed below.

### Install Cap'n Proto

Run:

```bash
brew install capnp
brew unlink capnp
```

The latter command is needed because Bazel build also compiles Capn proto and gets confused when
there is already a different version of `capnp` in the `$PATH`.
