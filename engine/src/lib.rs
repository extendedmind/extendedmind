extern crate extendedmind_schema_rust;
extern crate serde_json;
use extendedmind_schema_rust::models::Data;

pub struct Engine {
    data: Data,
}

impl Engine {
    pub fn new() -> Engine {
        Engine {
            data: Data::new(Vec::new(), Vec::new()),
        }
    }
    pub fn get_data(&self) -> String {
        serde_json::to_string(&self.data).unwrap()
    }
}

impl Default for Engine {
    fn default() -> Self {
        Engine::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_data() {
        assert_eq!("{\"items\":[],\"reminders\":[]}", Engine::new().get_data());
    }
}
