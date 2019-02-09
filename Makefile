.PHONY: dev build xpi server

NAME="EngineSwitcher"
BIN:="node_modules/.bin"
XPI_DIR=../xpi

dev:
	${BIN}/gulp dev

build:
	${BIN}/gulp build

xpi: build
	mkdir -p ${XPI_DIR}
	zip -r -FS "${XPI_DIR}/${NAME}.xpi" dist/ img/ manifest.json README.org options_ui/

xpi-server: xpi
	ifconfig | grep "inet " | grep --invert-match '127.0.0.1'
	cd ${XPI_DIR}; python3 -m http.server 8888