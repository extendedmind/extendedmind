use std::time::{Duration, Instant};

#[macro_use]
extern crate log;

use actix::prelude::*;
use actix_files as fs;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

mod hub_hypercore;
use hub_hypercore::{HubHypercore, HubHypercoreMessage};

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

/// do websocket handshake and start `HubWebSocket` actor
async fn ws_index(r: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    debug!("{:?}", r);
    let res = ws::start(HubWebSocket::new(), &r, stream);
    debug!("{:?}", res);
    res
}

/// websocket connection is long running connection, it easier
/// to handle with an actor
struct HubWebSocket {
    /// Client must send ping at least once per 10 seconds (CLIENT_TIMEOUT),
    /// otherwise we drop connection.
    heartbeat: Instant,
    hub_hypercore: Addr<hub_hypercore::HubHypercore>,
}

impl Actor for HubWebSocket {
    type Context = ws::WebsocketContext<Self>;

    /// Method is called on actor start. We start the heartbeat process here.
    fn started(&mut self, ctx: &mut Self::Context) {
        self.heartbeat(ctx);
    }
}

/// Handler for `ws::Message`
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for HubWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        // process websocket messages
        debug!("WS: {:?}", msg);
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                self.heartbeat = Instant::now();
                ctx.pong(&msg);
            }
            Ok(ws::Message::Pong(_)) => {
                self.heartbeat = Instant::now();
            }
            Ok(ws::Message::Text(_)) => error!("Unexpected text"),
            Ok(ws::Message::Binary(bin)) => {
                debug!("Got binary web socket message");
                //let (mut incoming_writer, incoming_reader) = async_pipe::pipe();
                //let (outgoing_writer, mut outgoing_reader) = async_pipe::pipe();
                //let mut protocol =
                //    ProtocolBuilder::new(true).connect_rw(incoming_reader, outgoing_writer);

                //let future = async move {
                //    incoming_writer.write_all(&bin).await.unwrap();
                //    let mut response = Vec::new();
                //    outgoing_reader.read(&mut response).await.unwrap();
                //    // This doesn't work becuase of:
                //    // https://stackoverflow.com/questions/64434912/how-to-correctly-call-async-functions-in-a-websocket-handler-in-actix-web
                //    // crux of the issue:
                //    // https://github.com/actix/actix/issues/308
                //    //
                //    // ctx.binary(response);
                //};
                //future.into_actor(self).spawn(ctx);
                let send_msg = self
                    .hub_hypercore
                    .send(HubHypercoreMessage { payload: bin });
                let send_msg = actix::fut::wrap_future::<_, Self>(send_msg);
                let update_self = send_msg.map(|result, actor, _ctx| {
                    match result {
                        Ok(v) => {
                            debug!("Got response");
                            ctx.binary(v.unwrap());
                            Ok(())
                        }
                        // Failed to send message to other_actor
                        Err(_e) => Err(()),
                    }
                });
                Box::pin(update_self);
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
    fn new() -> Self {
        Self {
            hub_hypercore: HubHypercore::new().start(),
            heartbeat: Instant::now(),
        }
    }

    /// helper method that sends ping to client every second.
    ///
    /// also this method checks heartbeats from client
    fn heartbeat(&self, ctx: &mut <Self as Actor>::Context) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.heartbeat) > CLIENT_TIMEOUT {
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
