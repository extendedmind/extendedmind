# Extended Mind Hub

The Hub is a small-scale proxy/backup for connecting infrequently online extended mind UIs.

## Configuration

By default the hub process first checks that the path given by the environment variable
`EXTENDEDMIND_HUB_DIR` (defaults to `~/.local/share/extendedmind/hub`) exists. Below that
folder you need to first create the `data` directory and at least one owner configuration file to
a path:

```
${EXTENDEDMIND_HUB_DIR}/data/my-path-to-an-owner/owner.properties
```

where `my-path-to-an-owner` is the HTTP url you will use to access this data in the hub. The
configuration file has the following properties.

* `type` (required): one of `PERSON`, `SYSTEM` (e.g. a radiator or secondary backup process), or
  `COLLECTIVE` (shared data between multiple PERSON and SYSTEM owners). At least one PERSON or
  SYSTEM is required because only those can be used for handshaking – COLLECTIVE is always accessed
  after connection to the hub is established.
* `name` (required): name of the owner as shown in your UI, you will want to keep this short.

For example a file under `${EXTENDEDMIND_HUB_DIR}/data/ttiurani/owner.properties`

```
type=PERSON
name=Timo
```

will print at launch the public key to use for bootstrapping the connection and reserve the path
`/ttiurani` for public notes.

In addition to hub data, you can also host static HTML files unders:

```
${EXTENDEDMIND_HUB_DIR}/static
```

with `${EXTENDEDMIND_HUB_DIR}/static/index.html` as the source for the root path.
