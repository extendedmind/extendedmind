@0xc57f2a0601973779;

struct Data @0x8b5980e82d7915ee {
  items @0 :List(Item);
  tags @1 :List(Tag);
  reminders @2 :List(Reminder);

  struct Item @0xa15b6d5e4d8c722e {
    uuid @0 :Data;
    itemType @1 :ItemType = unspecified;
    content @2 :Text;

    enum ItemType @0xca3d39e6e2380c85 {
      unspecified @0;
      task @1;
      note @2;
    }
  }

  struct Tag @0xc2329ca7e6f7b587 {
    uuid @0 :Data;
    tagType @1 :TagType;
    content @2 :Text;

    enum TagType @0xab35690c3d6160b4 {
      keyword @0;
      context @1;
    }
  }

  struct Reminder @0xa9fab51c203f9ab8 {
    uuid @0 :Data;
  }
}
