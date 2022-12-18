# Picture it Editor: the open-source AI Art creation tool

[![Build](https://github.com/rogeriochaves/pictureit-editor/actions/workflows/build.yml/badge.svg)](https://github.com/rogeriochaves/pictureit-editor/actions/workflows/build.yml)

Picture it Editor is an open-source design editor, currently in beta version, designed to be a studio to help you create and iterate on digital art using a variety of AI models available as tools in the editor

You can run the editor locally or try our hosted version.

Try now: [https://pictureit.art](https://pictureit.art)

## Screenshot

![Screenshot of the editor](https://i.ibb.co/xmcpn4y/ss.png)

## Features

🖼 Image generation with Stable Diffusion

🪜 Step and guidance adjustment

🪧 Base image inpainting

✍️ Guided drawing inpainting

🙅 Negative Prompt

🔧 Easy to extend for different backend or other models

➕ More to come!

## How it works

Picture it Editor was not built to run the model locally on your machine, this is because running models is not the focus of this project, the focus really is on the user experience, to create a great editor for better working with AI Art.

Instead, Picture it uses [Replicate](https://replicate.com/) as the API to run the models, the advantage of that is that the editor is able to use many models at the same time with no setup or the need of a powerful GPU, and as they evolve, no effort from the user is required to update them.

## Running Locally

First, you are going to need a Replicate API key, to be able to use the AI models, get one at:

https://replicate.com/

Then, clone the project and install the dependencies:

```
git clone https://github.com/rogeriochaves/pictureit-editor
npm install
```

Now start the project, passing your token as ENV:

```
VITE_ENV_BACKEND=replicate VITE_ENV_REPLICATE_TOKEN=<token> npm run dev
```

App should be running. Go to http://localhost:5173/ and enjoy!

## Contribution

Feel free to contribute by opening issues with any questions, bug reports or feature requests

Also if you are familiar with React, Typescript, Fabric.js or Stable Diffusion, feel free to send pull requests and contribute with anything you feel like should be improved

## Get in touch

You can reach us at hello@pictureit.art

![logo](https://pictureit.art/images/logo-black.svg)

## License

[MIT](LICENSE)