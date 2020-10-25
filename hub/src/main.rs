use std::time::{Duration, Instant};

#[macro_use]
extern crate log;

use actix::prelude::*;
use actix_files as fs;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use bytes::Bytes;
use futures::channel::mpsc;
use futures_codec::{BytesCodec, FramedRead};

// TODO:
// use hypercore_protocol::Message as HypercoreMessage;
struct HypercoreMessage {}
use hypercore_protocol::ProtocolBuilder;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

/// do websocket handshake and start `HubWebSocket` actor
async fn ws_index(r: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    debug!("{:?}", r);
    let ha = HypercoreActor {}.start();
    let (incoming_tx, incoming_rx) = mpsc::unbounded::<Bytes>();
    let (outgoing_tx, outgoing_rx) = mpsc::unbounded::<Bytes>();
    let res = ws::start(
        HubWebSocket::new(ha, incoming_tx, incoming_rx, outgoing_tx, outgoing_rx),
        &r,
        stream,
    );
    debug!("{:?}", res);
    res
}

#[derive(Message)]
#[rtype(result = "()")]
struct HypercoreActorMessage {
    content: HypercoreMessage,
}

struct HypercoreActor {}

impl Actor for HypercoreActor {
    type Context = Context<Self>;
}

impl Handler<HypercoreActorMessage> for HypercoreActor {
    type Result = ();
    fn handle(&mut self, _msg: HypercoreActorMessage, _ctx: &mut Context<Self>) -> Self::Result {}
}

/// websocket connection is long running connection, it easier
/// to handle with an actor
struct HubWebSocket {
    /// Client must send ping at least once per 10 seconds (CLIENT_TIMEOUT),
    /// otherwise we drop connection.
    hb: Instant,
    ha: Addr<HypercoreActor>,
    incoming_tx: futures::channel::mpsc::UnboundedSender<bytes::Bytes>,
    incoming_rx: futures::channel::mpsc::UnboundedReceiver<bytes::Bytes>,
    outgoing_tx: futures::channel::mpsc::UnboundedSender<bytes::Bytes>,
    outgoing_rx: futures::channel::mpsc::UnboundedReceiver<bytes::Bytes>,
}

impl Actor for HubWebSocket {
    type Context = ws::WebsocketContext<Self>;

    /// Method is called on actor start. We start the heartbeat process here.
    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);
    }
}

/// Handler for `ws::Message`
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for HubWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        // process websocket messages
        debug!("WS: {:?}", msg);
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            Ok(ws::Message::Pong(_)) => {
                self.hb = Instant::now();
            }
            Ok(ws::Message::Text(_)) => error!("Unexpected text"),
            Ok(ws::Message::Binary(bin)) => {
                debug!("Got binary message message");
                self.incoming_tx.unbounded_send(bin).ok();
                let back = self.outgoing_rx.try_next().ok().unwrap().unwrap();

                // https://docs.rs/futures/0.3.6/futures/stream/trait.TryStreamExt.html
                // that haas
                let mut protocol =
                    ProtocolBuilder::new(true).connect_rw(self.incoming_rx, self.outgoing_tx);

                ctx.binary(back);

                // PROBABLY UNNECESSARY ....
                // Taken from https://actix.rs/actix/actix/fut/trait.ActorFuture.html
                let send_msg = self.ha.send(HypercoreActorMessage {
                    content: HypercoreMessage {},
                });
                let send_msg = actix::fut::wrap_future::<_, Self>(send_msg);
                let update_self = send_msg.map(|result, actor, _ctx| {
                    // Actor's state updated here
                    match result {
                        Ok(v) => {
                            debug!("Got response");
                            ctx.text("Ok");
                            Ok(())
                        }
                        // Failed to send message to other_actor
                        Err(_e) => Err(()),
                    }
                });
                Box::pin(update_self);
                // ....PROBABLY UNNECESSARY
            }
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => ctx.stop(),
        }
    }
}

impl HubWebSocket {
    fn new(
        ha: Addr<HypercoreActor>,
        incoming_tx: futures::channel::mpsc::UnboundedSender<bytes::Bytes>,
        incoming_rx: futures::channel::mpsc::UnboundedReceiver<bytes::Bytes>,
        outgoing_tx: futures::channel::mpsc::UnboundedSender<bytes::Bytes>,
        outgoing_rx: futures::channel::mpsc::UnboundedReceiver<bytes::Bytes>,
    ) -> Self {
        Self {
            hb: Instant::now(),
            ha,
            incoming_tx,
            incoming_rx,
            outgoing_tx,
            outgoing_rx,
        }
    }

    /// helper method that sends ping to client every second.
    ///
    /// also this method checks heartbeats from client
    fn hb(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                debug!("Websocket Client heartbeat failed, disconnecting!");

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping(b"");
        });
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_server=info,actix_web=info");
    env_logger::init();

    HttpServer::new(|| {
        App::new()
            // enable logger
            .wrap(middleware::Logger::default())
            // websocket route
            .service(web::resource("/ws/").route(web::get().to(ws_index)))
            // static files
            .service(fs::Files::new("/", "static/").index_file("index.html"))
    })
    // start http server on 127.0.0.1:8080
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
