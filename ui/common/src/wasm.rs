mod wasm {
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_futures::spawn_local;

    #[wasm_bindgen]
    pub fn double(i: i32) -> i32 {
        i * 2
    }

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(catch)]
        fn triple(i: i32) -> Result<JsValue, JsValue>;
    }

    #[wasm_bindgen]
    pub fn triple_from_js(i: i32) -> i32 {
        unsafe { triple(i).unwrap().as_f64().unwrap().to_int_unchecked() }
    }

    #[wasm_bindgen]
    pub async fn connect_to_hub(address: String, public_key: String) -> Result<(), JsValue> {
        Ok(())
    }
}
