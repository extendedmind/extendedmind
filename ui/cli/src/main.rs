extern crate extendedmind_engine;
use extendedmind_engine::Engine;

fn main() {
    let data = Engine::new().get_data();
    println!("{}", data);
}
