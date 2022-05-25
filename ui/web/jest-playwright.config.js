module.exports = {
    serverOptions: {
        command: `${process.env.EXTENDEDMIND_HUB_BIN} --data-root-dir ${process.env.EXTENDEDMIND_HUB_DATA_DIR} --static-root-dir ${process.env.EXTENDEDMIND_UI_WEB_DIST} --http-port ${process.env.EXTENDEDMIND_HUB_PORT} --log-to-stderr --skip-compress-mime application/wasm`,
        port: process.env.EXTENDEDMIND_HUB_PORT,
    },
};
