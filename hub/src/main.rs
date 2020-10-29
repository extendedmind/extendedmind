use anyhow::Result;
use bytes::Bytes;
use std::collections::HashMap;
use std::time::Duration;
use tide::Request;

use async_std::sync::{channel, Receiver, Sender};

use futures::sink::SinkExt;
use futures::stream::StreamExt;

use async_std::task;

#[derive(Clone, Copy)]
enum SystemCommand {
    DoPing,
    Disconnect,
}

#[derive(Clone)]
struct State {
    system_commands: Receiver<SystemCommand>,
    writers: HashMap<String, Sender<Bytes>>,
    readers: HashMap<String, Receiver<Bytes>>,
}

async fn async_main(initial_state: State) -> Result<()> {
    let mut app = tide::with_state(initial_state);

    app.at("/ws").get(|req: Request<State>| async move {
        tide::websocket::upgrade(req, |_req, handle| async {
            let mut ws = handle.into_inner();

            loop {
                let msg = ws.next().await.unwrap().unwrap();
                dbg!(&msg);
                ws.send(msg).await.unwrap();
            }
        })
    });

    app.listen("0.0.0.0:8080").await?;
    Ok(())
}

fn main() -> Result<()> {
    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d %H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .chain(std::io::stdout())
        .apply()?;
    let (ping_sender, system_command_receiver) = channel(1000);
    let initial_state = State {
        system_commands: system_command_receiver,
        writers: HashMap::new(),
        readers: HashMap::new(),
    };

    // TODO: This should be used on SIGINT/SIGTERM
    let disconnect_sender = ping_sender.clone();

    // Need to start a system executor to send the DoPing command
    task::spawn(async move {
        loop {
            task::sleep(Duration::from_millis(1000)).await;
            dbg!("Sending DoPing");
            ping_sender.send(SystemCommand::DoPing).await;
        }
    });

    futures::executor::block_on(async_main(initial_state))?;

    Ok(())
}
