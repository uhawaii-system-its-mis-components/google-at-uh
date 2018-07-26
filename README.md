# google-at-uh

### A Note about using this element
I couldn't figure out a way to import google's platform.js and client.js as es6
modules so anything that uses `<google-at-uh>` needs to include the scripts in
their html page. See the index.html demo page for an example.

Start a development environment with:

```
make
```
Then, the first time:

```
yarn install
exit
```

Then to start the stack (which includes a proxy and fake-identity-service):

```
make deploy
```

Access the demo at http://localhost/google-at-uh/

See `Makefile` for other commands.
