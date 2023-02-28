use async_std::task;
use extendedmind_ui_disk::{capnp, connect_to_hub, ui_protocol};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures::stream::StreamExt;
use jni::objects::{JClass, JObject, JString, JValue};
use jni::sys::jbyteArray;
use jni::JNIEnv;
use log::*;
use std::ffi::CString;
use std::os::raw::c_char;
use std::path::PathBuf;

pub type Callback = unsafe extern "C" fn(*const c_char) -> ();

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn invokeCallbackViaJNA(callback: Callback) {
    let s = CString::new("Hello from Rust").unwrap();
    unsafe {
        callback(s.as_ptr());
    }
}

// NB: "00024" seems random but it's the Unicode code point for "$"
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

// NB: "00024" seems random but it's the Unicode code point for "$"
#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_org_extendedmind_android_Application_00024Companion_connectToHub(
    env: JNIEnv,
    _class: JClass,
    data_root_dir: JString,
    hub_url: JString,        // FIXME: This should be domain + port
    hub_public_key: JString, // FIXME: This should be encryption key
) -> jbyteArray {
    let data_root_dir: String = env
        .get_string(data_root_dir)
        .expect("Couldn't get java string!")
        .into();
    let data_root_dir: PathBuf = PathBuf::from(data_root_dir);
    let hub_url: String = env
        .get_string(hub_url)
        .expect("Couldn't get java string!")
        .into();
    // FIXME: This should be doc_url and encryption_key
    let hub_public_key: String = env
        .get_string(hub_public_key)
        .expect("Couldn't get java string!")
        .into();

    let (ui_protocol_sender, mut ui_protocol_receiver): (
        UnboundedSender<capnp::message::TypedBuilder<ui_protocol::Owned>>,
        UnboundedReceiver<capnp::message::TypedBuilder<ui_protocol::Owned>>,
    ) = unbounded();

    task::spawn_local(async move {
        debug!("Connecting to hub");
        // FIXME: Connect with peermerge
        // connect_to_hub(
        //     data_root_dir,
        //     &hub_url,
        //     &hub_public_key,
        //     &hub_public_key,
        //     ui_protocol_sender,
        // )
        // .await
        // .unwrap();
    });

    // TODO: Eventually this would be a loop with callbacks
    // loop {
    debug!("Begin listening to ui protocol messages");
    let mut packed_message = Vec::<u8>::new();
    task::block_on(async {
        let message = ui_protocol_receiver.next().await.unwrap();
        capnp::serialize_packed::write_message(&mut packed_message, message.borrow_inner())
            .unwrap();
        debug!("Got message {:?}", packed_message);
        // }
    });
    env.byte_array_from_slice(&packed_message)
        .expect("Could not make new byte array")
}
