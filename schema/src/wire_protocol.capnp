@0xb7f6fa068df97558;

struct WireProtocol @0xffb5008f3f8df038 {
    version @0 :UInt8;
    payload :union {
        sharePersonalAccessKey @1 :Data;
        shareCollectiveAccessKeys @2 :List(Data);
    }
}
