use std::ffi::CString;
use std::os::raw::c_char;

use jni::objects::{JClass, JObject, JValue};
use jni::JNIEnv;

pub type Callback = unsafe extern "C" fn(*const c_char) -> ();

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn invokeCallbackViaJNA(callback: Callback) {
    let s = CString::new("Hello from Rust").unwrap();
    unsafe {
        callback(s.as_ptr());
    }
}

// NB: "00024" seems random but it's the unicode character for "$"
#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_org_extendedmind_android_Application_00024Companion_invokeCallbackViaJNI(
    env: JNIEnv,
    _class: JClass,
    callback: JObject,
) {
    let s = String::from("Hello from Rust");
    let response = env.new_string(&s).expect("Couldn't create java string!");
    env.call_method(
        callback,
        "callback",
        "(Ljava/lang/String;)V",
        &[JValue::from(JObject::from(response))],
    )
    .unwrap();
}
