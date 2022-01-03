pub use extendedmind_engine::{Engine, RandomAccess};
use log::*;
use std::fmt::Debug;

pub async fn connect_active<T>(engine: Engine<T>)
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    debug!("connect_to_hub called")
}
