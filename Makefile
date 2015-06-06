run:
	# generate english doc.
	restdown/bin/restdown -b brand en.md
	mv en.html en/index.html
	mv en.json en/index.json
	# generate chinese doc.
	restdown/bin/restdown -b brand cn.md
	mv cn.html cn/index.html
	mv cn.json cn/index.json

.PHONY: run
