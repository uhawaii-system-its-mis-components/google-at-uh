# google-at-uh

### Required html imports
I couldn't figure out a way to import google's platform.js and client.js as es6
modules so anything that uses `<google-at-uh>` needs to include the scripts in
their html page. See the index.html demo page for an example.


### Prerequisites for development
You'll also need the google-auth demo app username and password. Add them in

```
env/dev/secrets/google-at-uh-grouper-password
env/dev/secrets/google-at-uh-grouper-username
```


### Getting Started
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
