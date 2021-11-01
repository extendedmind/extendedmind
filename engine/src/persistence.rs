use hypercore::{Feed, PublicKey, Storage};
#[cfg(not(target_arch = "wasm32"))]
use random_access_disk::RandomAccessDisk;
use std::path::PathBuf;

#[cfg(not(target_arch = "wasm32"))]
pub async fn get_disk_feed(
    is_initiator: bool,
    public_key: Option<String>,
) -> Feed<RandomAccessDisk> {
    let remote_feed = if let Some(public_key) = public_key {
        let storage = Storage::new_disk(
            &PathBuf::from(format!("/tmp/testremote_{}.db", is_initiator)),
            false,
        )
        .await
        .unwrap();
        dbg!("USING GIVEN PUBLIC KEY  {}", &public_key);
        let key = hex::decode(public_key).unwrap();
        let public_key = PublicKey::from_bytes(key.as_ref()).unwrap();
        Feed::builder(public_key, storage).build().await.unwrap()
    } else {
        dbg!("Opening/creating feed");
        let remote_feed = Feed::open(format!("/tmp/testremote_{}.db", is_initiator))
            .await
            .unwrap();
        let public_key = hex::encode(remote_feed.public_key());
        dbg!(
            "Reading public key, init: {} value: {}",
            is_initiator,
            public_key
        );
        remote_feed
    };
    remote_feed
}
