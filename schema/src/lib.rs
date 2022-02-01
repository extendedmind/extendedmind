// NOTE: This file is used only to make local cargo compilation work, does not have anything to do
// with Bazel!
pub use capnp;
pub mod model_capnp {
    include!(concat!(env!("OUT_DIR"), "/model_capnp.rs"));
}
pub mod wire_protocol_capnp {
    include!(concat!(env!("OUT_DIR"), "/wire_protocol_capnp.rs"));
}
pub mod ui_protocol_capnp {
    include!(concat!(env!("OUT_DIR"), "/ui_protocol_capnp.rs"));
}
