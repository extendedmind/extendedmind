use duct::cmd;
use std::env;

#[test]
fn test_no_params() {
    let test_src_dir = env::var("TEST_SRCDIR")
        .expect("TEST_SRCDIR is set by Bazel, are you running this from Cargo?");
    let cli = format!("{}/__main__/ui/cli/extendedmind_cli", test_src_dir);
    let no_params = cmd!(cli, "--version").stdout_capture().run().unwrap();
    let stdout = std::str::from_utf8(&no_params.stdout).unwrap();
    assert_eq!(
        "{\"items\":[],\"tags\":[],\"reminders\":[]}\nextendedmind_cli 0.1.0\n",
        stdout
    );
}
