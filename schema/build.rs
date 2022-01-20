fn main() {
    capnpc::CompilerCommand::new()
        .src_prefix("src")
        .file("src/data.capnp")
        .file("src/wire_protocol.capnp")
        .run().expect("schema compiler command");
}
