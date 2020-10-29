use anyhow::Result;
use tide::Request;

use futures::sink::SinkExt;
use futures::stream::StreamExt;

#[derive(Clone)]
struct State {}

async fn async_main() -> Result<()> {
    let state = State {};
    let mut app = tide::with_state(state);
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

    futures::executor::block_on(async_main())?;

    Ok(())
}
