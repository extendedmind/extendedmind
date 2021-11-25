pub use extendedmind_engine::Engine;
#[cfg(not(target_arch = "wasm32"))]
pub use extendedmind_engine::RandomAccessDisk;

#[cfg(target_arch = "wasm32")]
pub mod wasm;
