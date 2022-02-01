@0xccaaa85c78f6607c;

using Java = import "/capnp/java.capnp";
$Java.package("org.extendedmind.schema");
$Java.outerClassname("UiProtocol");

using Model = import "model.capnp";

struct UiProtocol @0x9c8d211a236b1cfd {
    version @0 :UInt8;
    message :union {
        init @1 :Model.Model;
        destroy @2 :Data;
    }
}
