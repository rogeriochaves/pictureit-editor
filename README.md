# Picture it Editor: the open-source AI Art creation tool

[![Build](https://github.com/rogeriochaves/pictureit-editor/actions/workflows/build.yml/badge.svg)](https://github.com/rogeriochaves/pictureit-editor/actions/workflows/build.yml)

Picture it Editor is an open-source design editor, currently in beta version, designed to be a studio to help you create and iterate on digital art using a variety of AI models available as tools in the editor

You can run the editor locally or try our hosted version.

Try now: [https://pictureit.art](https://pictureit.art)

## Screenshot

![Screenshot of the editor](https://i.ibb.co/xmcpn4y/ss.png)

## Features

🖼 [Image generation with Stable Diffusion](https://pictureit.art/guides/getting-started)

🪜 [Step and guidance adjustment](https://pictureit.art/guides/steps-and-guidance)

🪧 [Base image inpainting](https://pictureit.art/guides/base-image)

↔️ [Outpainting extending and zoom out](https://pictureit.art/guides/outpainting)

✍️ Guided drawing inpainting

🙅 [Negative Prompt](https://pictureit.art/guides/negative-prompt)

🔧 Easy to extend for different backend or other models

➕ More to come!

## How it works

Picture it Editor was not built to run the model locally on your machine, this is because running models is not the focus of this project, the focus really is on the user experience, to create a great editor for better working with AI Art.

Instead, Picture it uses [Replicate](https://replicate.com/) as the API to run the models, the advantage of that is that the editor is able to use many models at the same time with no setup or the need of a powerful GPU, and as they evolve, no effort from the user is required to update them.

## Running Locally

To run it locally, you will need to have [nodejs](https://nodejs.org/en/), and then install the editor:

```
git clone https://github.com/rogeriochaves/pictureit-editor
npm install
```

Now start the project, passing your token as ENV:

```
npm run dev
```

A basic version of the app should be running now, go to http://localhost:5173/ and see if everything is working

Now, by default the only working backend is StableHorde, which generates images for free but can get you in a long queue. If you want to generate videos and more images faster, you will need to setup more backends as below:

### Replicate as a Backend

We recommend setting up Replicate as it has the most functionalities, for that you are going to need a Replicate API key, get one at:

https://replicate.com/

Now start the project, passing your token as ENV:

```
VITE_ENV_REPLICATE_TOKEN=<token> npm run dev
```

Go to http://localhost:5173/ and enjoy!

### Evoke as a Backend

Alternatively, you can use also Evoke as a backend, it's cheaper than Replicate, but with only basic Stable Diffusion available for now

First, get an Evoke API key at:

https://evoke-app.com

Then set the env var and start the app:

```
VITE_ENV_EVOKE_TOKEN=<token> npm run dev
```

### StableHorde as a Backend

Finally, you can register on StableHorde to have better priority at the cluster queue, go to:

https://stablehorde.net/

Get a key, then set the env var and start the app:

```
VITE_ENV_STABLE_HORDE_TOKEN=<token> npm run dev
```

## Contribution

Feel free to contribute by opening issues with any questions, bug reports or feature requests

Also if you are familiar with React, Typescript, Fabric.js or Stable Diffusion, feel free to send pull requests and contribute with anything you feel like should be improved

You can enable the env var `VITE_ENV_MOCKED_MODELS=enabled` to play with the frontend without spending anything

## Get in touch

You can reach us at hello@pictureit.art

![logo](https://pictureit.art/images/logo-black.svg)

## License

[MIT](LICENSE)