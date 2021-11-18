use wasm_bindgen::prelude::*;

pub use extendedmind_engine::Engine;
#[cfg(not(target_arch = "wasm32"))]
pub use extendedmind_engine::RandomAccessDisk;

// SDASDAS

#[wasm_bindgen]
pub fn double(i: i32) -> i32 {
    i * 2
}
