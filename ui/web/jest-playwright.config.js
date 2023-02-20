module.exports = {
    serverOptions: {
        command: `${process.env.EXTENDEDMIND_SERVER_BIN} --admin-socket-file ${process.env.EXTENDEDMIND_SERVER_SOCKET}  --verbose true start --data-root-dir ${process.env.EXTENDEDMIND_SERVER_DATA_DIR} --static-root-dir ${process.env.EXTENDEDMIND_UI_WEB_DIST} --http-port ${process.env.EXTENDEDMIND_SERVER_HTTP_PORT} --tcp-port ${process.env.EXTENDEDMIND_SERVER_TCP_PORT} --log-to-stderr --skip-compress-mime application/wasm`,
        port: process.env.EXTENDEDMIND_SERVER_HTTP_PORT,
    },
};
