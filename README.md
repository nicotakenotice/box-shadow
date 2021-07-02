# box-shadow
Sandbox tool to play with the homonymous CSS property.

## Get started
Install the dependencies and run a dev server:

```bash
npm install
npm run dev
```

Navigate to [`localhost:4300`](http://localhost:4300). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` command in `package.json` to include the option `--host 0.0.0.0`.

## Building and running in production mode
To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your `package.json`'s `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).
