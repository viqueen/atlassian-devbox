# Confluence Devbox Plugin

## dev setup

* start confluence with the plugin installed in it

```bash
mvn confluence:run -pl plugin
```

* start confluence with debug port open

```bash
mvn confluence:debug -pl plugin
```

* refresh the instance with plugin updates using QuickReload

```bash
mvn package -DskipTests -pl plugin
```

* install the plugin into a running instance of Confluence

```bash
mvn confluence:install -pl plugin
```
