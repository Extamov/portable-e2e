# Portable E2E

Portable E2E is a web page for generating messages securely under [End-to-end encryption](https://en.wikipedia.org/wiki/End-to-end_encryption).

The project is written in Typescript, Preact and uses CodeMirror as the editor.

Messages are encrypted using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) and the key exchange is done using [Elliptic-curve Diffie-Hellman](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie-Hellman).

Key exchange can also be done between more than two users, encryption key can be reused later.