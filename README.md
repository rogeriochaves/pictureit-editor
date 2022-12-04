# Picture it Editor: the open-source AI Art creation tool

Picture it Editor is an open-source design editor, currently in beta version, designed to be a studio to help you create and iterate on digital art using a variety of AI models available as tools in the editor

You can run the editor locally or try our hosted version:

[https://pictureit.art](https://pictureit.art)

## Screenshot

![Screenshot of the editor](https://i.ibb.co/xmcpn4y/ss.png)

## Features

- Image generation with Stable Diffusion
- Step and guidance adjustment
- Base image inpainting
- Guided drawing inpainting
- Easy to extend for different backend or other models
- More to come!

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

Feel free to contribute by opening issues with any questions, bug reports or feature requests.

## Get in touch

You can reach us at hello@pictureit.art

## License

[MIT](LICENSE)

![logo](https://pictureit.art/images/logo-black.svg)