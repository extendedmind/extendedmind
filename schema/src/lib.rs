// NOTE: This file is used only to make local cargo compilation work, does not have anything to do
// with Bazel!
pub use capnp;
pub mod data_capnp {
    include!(concat!(env!("OUT_DIR"), "/data_capnp.rs"));
}
pub mod wire_protocol_capnp {
    include!(concat!(env!("OUT_DIR"), "/wire_protocol_capnp.rs"));
}
