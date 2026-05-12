#!/bin/bash

# Link to the binary
# Must hardcode Spark directory; no variable available
ln -sf '/opt/Spark/${executable}' '/usr/bin/${executable}'

# SUID chrome-sandbox for Electron 5+
chmod 4755 '/opt/Spark/chrome-sandbox' || true

update-mime-database /usr/share/mime || true
update-desktop-database /usr/share/applications || true
