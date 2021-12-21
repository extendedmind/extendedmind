module.exports = {
    serverOptions: {
        command: `${process.env.EXTENDEDMIND_HUB_BIN} ${process.env.EXTENDEDMIND_HUB_PORT} ${process.env.EXTENDEDMIND_HUB_DATA_DIR} ${process.env.EXTENDEDMIND_UI_WEB_DIST} --log-to-stderr`,
        port: process.env.EXTENDEDMIND_HUB_PORT,
    },
};
